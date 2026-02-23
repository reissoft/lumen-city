import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import MessagingInterface from "@/components/messaging/MessagingInterface";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const SESSION_COOKIE_NAME = 'lumen_session';
const ROLE_COOKIE_NAME = 'lumen_role';

const prisma = new PrismaClient();

async function getCurrentUser() {
  const session = cookies().get(SESSION_COOKIE_NAME)?.value;
  const role = cookies().get(ROLE_COOKIE_NAME)?.value;

  if (!session || !role) {
    return null;
  }

  let user = null;
  if (role === 'teacher' || role === 'admin') {
    user = await prisma.teacher.findUnique({
      where: { email: session },
    });
  } else if (role === 'student') {
    user = await prisma.student.findUnique({
      where: { username: session },
    });
  }

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    role: role,
    schoolId: user.schoolId,
  };
}

async function getUnreadMessages(userId: string, userRole: string) {
    const recipientCondition = userRole === 'student' ? { recipientStudentId: userId } : { recipientTeacherId: userId };
    
    const notifications = await prisma.notification.findMany({
        where: {
            ...recipientCondition,
            read: false,
            // CORREÇÃO FINAL E CORRETA: Em vez de checar se o campo é nulo, a abordagem correta
            // é simplesmente verificar se a relação `message` existe, fornecendo um filtro vazio.
            message: {}
        },
        select: {
            message: {
                select: {
                    senderStudentId: true,
                    senderTeacherId: true
                }
            }
        }
    });

    const unreadFrom = notifications.reduce((acc, notif) => {
        // O filtro acima garante que notif.message nunca será nulo aqui.
        if (!notif.message) return acc; 

        const senderId = notif.message.senderStudentId || notif.message.senderTeacherId;
        if (senderId) {
            acc[senderId] = (acc[senderId] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return unreadFrom;
}

export default async function MessagingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/');
  }

  const unreadMessages = await getUnreadMessages(currentUser.id, currentUser.role);

  const backUrl = currentUser.role === 'student' ? '/student' : '/teacher';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white p-4 relative">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>

      <Link href={backUrl} passHref>
        <Button variant="ghost" className="absolute top-5 left-6 z-20 flex items-center gap-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
          Voltar ao Painel
        </Button>
      </Link>

      <div className="w-full max-w-7xl h-[calc(100vh-80px)] z-10 mt-10">
        <MessagingInterface currentUser={currentUser} initialUnreadMessages={unreadMessages} />
      </div>
    </div>
  );
}
