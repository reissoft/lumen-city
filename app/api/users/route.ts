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
  // Inclui o `classId` para o usuário estudante
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
    let teachers: { id: string; name: string | null }[] = [];
    let students: { id: string; name: string | null }[] = [];

    if (user.role === 'admin') {
      teachers = await prisma.teacher.findMany({
        where: { schoolId: user.schoolId, id: { not: user.id } },
        select: { id: true, name: true },
      });
      students = await prisma.student.findMany({
        where: { schoolId: user.schoolId },
        select: { id: true, name: true },
      });
    } else if (user.role === 'student') {
      // --- LÓGICA CORRETA PARA ALUNOS ---
      if (user.classId) {
        const studentClass = await prisma.class.findUnique({
          where: { id: user.classId },
          include: { teachers: true }, // A relação em `Class` para professores é `teachers`
        });
        if (studentClass) {
          teachers = studentClass.teachers.map(t => ({ id: t.id, name: t.name }));
        }
      }
    } else if (user.role === 'teacher') {
      // --- LÓGICA CORRETA PARA PROFESSORES ---
      const teacherClasses = await prisma.class.findMany({
        where: { teachers: { some: { id: user.id } } },
        include: { students: true }, // A relação em `Class` para alunos é `students`
      });

      const studentMap = new Map<string, { id: string; name: string | null }>();
      teacherClasses.forEach(c => {
        c.students.forEach(s => {
          if (!studentMap.has(s.id)) {
            studentMap.set(s.id, { id: s.id, name: s.name });
          }
        });
      });
      students = Array.from(studentMap.values());
    }

    const responseUsers = {
      teachers: teachers.map(t => ({ id: t.id, name: t.name, role: 'teacher' as const })),
      students: students.map(s => ({ id: s.id, name: s.name, role: 'student' as const })),
    };

    return NextResponse.json(responseUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}
