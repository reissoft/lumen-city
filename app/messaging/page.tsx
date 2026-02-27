// app/messaging/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import MessagingInterface from "@/components/messaging/MessagingInterface";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import StudentHeader from '@/app/student/StudentHeader';

const SESSION_COOKIE_NAME = 'lumen_session';
const ROLE_COOKIE_NAME = 'lumen_role';

const prisma = new PrismaClient();

// Função para obter o usuário logado (pode ser admin, professor ou aluno)
async function getLoggedInUser() {
  const session = cookies().get(SESSION_COOKIE_NAME)?.value;
  const role = cookies().get(ROLE_COOKIE_NAME)?.value;

  if (!session || !role) return null;

  let user: any = null;
  if (role === 'teacher' || role === 'admin') {
    user = await prisma.teacher.findUnique({ where: { email: session } });
  } else if (role === 'student') {
    user = await prisma.student.findUnique({ where: { username: session } });
  }

  if (!user) return null;

  return { id: user.id, name: user.name, role, schoolId: user.schoolId };
}

// Função para obter os dados do usuário a ser exibido na interface de mensagens
// Pode ser o próprio usuário logado ou um professor sendo moderado por um admin.
async function getViewUser(loggedInUser: any, moderateAsId?: string) {
  if (loggedInUser.role === 'admin' && moderateAsId) {
    const teacherToModerate = await prisma.teacher.findUnique({
      where: { id: moderateAsId },
    });
    if (teacherToModerate) {
      // Retorna os dados do professor para moderação
      return { ...teacherToModerate, role: 'teacher' }; 
    }
  }
  // Por padrão, ou se a moderação falhar, retorna o usuário logado
  return loggedInUser;
}

// Função para buscar mensagens não lidas
async function getUnreadMessages(userId: string, userRole: string) {
    const recipientCondition = userRole === 'student' ? { recipientStudentId: userId } : { recipientTeacherId: userId };

    if (!prisma || !('notification' in prisma) || typeof (prisma as any).notification?.findMany !== 'function') {
        console.warn('Prisma client missing notification model, returning empty unread count');
        return {};
    }

    try {
        // @ts-ignore
        const notifications = await prisma.notification.findMany({
            where: { ...recipientCondition, read: false, message: {} },
            select: { message: { select: { senderStudentId: true, senderTeacherId: true } } }
        });
        // accumulate counts per sender; use key 'system' for messages without sender
        return notifications.reduce((acc, notif) => {
            if (!notif.message) return acc;
            const senderId = notif.message.senderStudentId || notif.message.senderTeacherId;
            if (senderId) {
                acc[senderId] = (acc[senderId] || 0) + 1;
            } else {
                acc['system'] = (acc['system'] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
    } catch (error) {
        console.error('Erro ao buscar notificações não lidas:', error);
        return {};
    }
}

export default async function MessagingPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser) {
    redirect('/');
  }

  const moderateAsId = searchParams.moderateAs;
  const systemMode = searchParams.system === 'true';
  let backUrl = '/';
  let viewUser = loggedInUser;
  let isModerating = false;

  // Lógica de Moderação
  if (loggedInUser.role === 'admin' && moderateAsId) {
    const teacherToModerate = await prisma.teacher.findUnique({ where: { id: moderateAsId } });
    if (teacherToModerate) {
        // Define o usuário da visão como o professor a ser moderado
        viewUser = { id: teacherToModerate.id, name: teacherToModerate.name, role: 'teacher', schoolId: teacherToModerate.schoolId };
        backUrl = '/admin/moderation'; // Link de volta para a seleção de professores
        isModerating = true;
    }
  } else {
    // Lógica normal para não-admins ou admins sem moderação
    switch (loggedInUser.role) {
      case 'admin': backUrl = '/admin'; break;
      case 'teacher': backUrl = '/teacher'; break;
      case 'student': backUrl = '/student'; break;
    }
  }
  
  // Busca mensagens não lidas para o usuário que está sendo visualizado
  const unreadMessages = await getUnreadMessages(viewUser.id, viewUser.role);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white p-4 relative">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>

      <Link href={backUrl} passHref>
        <Button variant="ghost" className="absolute top-5 left-6 z-20 flex items-center gap-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
          {isModerating ? 'Voltar para Seleção' : 'Voltar ao Painel'}
        </Button>
      </Link>

      {/* Only show virtual friend for students */}
      {loggedInUser.role === 'student' && (
        <StudentHeader studentName={loggedInUser.name || 'Aluno(a)'} />
      )}

      <div className="w-full max-w-7xl h-[calc(100vh-80px)] z-10 mt-10">
        {/* MODIFICAÇÃO: Passa as props para o componente */}
        <MessagingInterface 
            currentUser={viewUser} 
            initialUnreadMessages={unreadMessages} 
            isModerating={isModerating}
            initialSystem={systemMode}
        />
      </div>
    </div>
  );
}
