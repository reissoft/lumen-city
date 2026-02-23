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

export default async function MessagingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/');
  }

  // Define a URL de retorno com base no perfil do usuário
  const backUrl = currentUser.role === 'student' ? '/student' : '/teacher';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white p-4 relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>

        {/* BOTÃO DE VOLTAR AO PAINEL */}
        <Link href={backUrl} passHref>
            <Button variant="ghost" className="absolute top-5 left-6 z-20 flex items-center gap-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
                Voltar ao Painel
            </Button>
        </Link>

        <div className="w-full max-w-7xl h-[calc(100vh-80px)] z-10 mt-10">
            <MessagingInterface currentUser={currentUser} />
        </div>
    </div>
  );
}
