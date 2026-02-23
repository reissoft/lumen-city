import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import MessagingInterface from "@/components/messaging/MessagingInterface";

// Definindo os nomes dos cookies como constantes locais
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

  return (
    <>
      <header>
        <h1 className="text-4xl font-bold">Mensagens</h1>
        <p className="text-white/60 mt-1">Converse com professores e alunos da sua escola.</p>
      </header>
      
      <div className="mt-8 rounded-lg overflow-hidden h-[calc(100vh-15rem)]">
        <MessagingInterface currentUser={currentUser} />
      </div>
    </>
  );
}
