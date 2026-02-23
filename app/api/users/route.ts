import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

const SESSION_COOKIE_NAME = 'lumen_session';
const ROLE_COOKIE_NAME = 'lumen_role';

async function getAuthenticatedUser() {
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

  return { ...user, role };
}

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user || !user.id || !user.schoolId) {
    return NextResponse.json({ error: 'Unauthorized or user not in a school' }, { status: 401 });
  }

  try {
    const teachers = await prisma.teacher.findMany({
      where: {
        schoolId: user.schoolId,
        id: { not: user.id },
      },
      select: { id: true, name: true },
    });

    const students = await prisma.student.findMany({
      where: {
        schoolId: user.schoolId,
        id: { not: user.id },
      },
      select: { id: true, name: true }, // Corrigido de 'username' para 'name'
    });

    const responseUsers = {
        teachers: teachers.map(t => ({ id: t.id, name: t.name, role: 'teacher' as const })),
        // Agora ambos os tipos de usuário têm um campo 'name'
        students: students.map(s => ({ id: s.id, name: s.name, role: 'student' as const }))
    };

    return NextResponse.json(responseUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}
