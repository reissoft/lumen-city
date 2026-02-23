import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Função para obter o usuário autenticado a partir dos cookies
async function getAuthenticatedUser() {
  const session = cookies().get('lumen_session')?.value;
  const role = cookies().get('lumen_role')?.value;

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

// Função refatorada para buscar contatos para um usuário específico
async function getContactsForUser(user: { id: string; role: string; schoolId: string; classId?: string | null }) {
  let teachers: any[] = [];
  let students: any[] = [];

  if (user.role === 'admin') {
    // Admin vê todos na escola, exceto ele mesmo.
    teachers = await prisma.teacher.findMany({
      where: { schoolId: user.schoolId, id: { not: user.id } },
      select: { id: true, name: true },
    });
    students = await prisma.student.findMany({
      where: { schoolId: user.schoolId },
      select: { id: true, name: true, class: { select: { name: true } } },
    });
  } else if (user.role === 'student') {
    // Aluno vê os professores de sua turma.
    if (user.classId) {
      const studentClass = await prisma.class.findUnique({ where: { id: user.classId }, include: { teachers: true } });
      if (studentClass) {
        teachers = studentClass.teachers.map(t => ({ id: t.id, name: t.name }));
      }
    }
  } else if (user.role === 'teacher') {
    // Professor vê os alunos de suas turmas.
    const teacherClasses = await prisma.class.findMany({
      where: { teachers: { some: { id: user.id } } },
      include: { students: true },
    });
    const studentMap = new Map<string, { id: string; name: string | null; className: string }>();
    teacherClasses.forEach(c => {
      c.students.forEach(s => {
        if (!studentMap.has(s.id)) {
          studentMap.set(s.id, { id: s.id, name: s.name, className: c.name });
        }
      });
    });
    students = Array.from(studentMap.values());
  }

  return { teachers, students };
}

export async function GET(req: NextRequest) {
  const loggedInUser = await getAuthenticatedUser();

  if (!loggedInUser) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const viewAsId = searchParams.get('viewAs');

  let targetUser = loggedInUser;

  // Lógica de Moderação
  if (viewAsId) {
    // Apenas admins podem usar o parâmetro viewAs
    if (loggedInUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins can view as another user.' }, { status: 403 });
    }

    // Admin está tentando ver os contatos de um professor específico
    const userToView = await prisma.teacher.findUnique({ where: { id: viewAsId } });
    if (!userToView) {
      return NextResponse.json({ error: 'User to view not found' }, { status: 404 });
    }
    // Define o alvo da busca de contatos como o professor a ser moderado
    targetUser = { ...userToView, role: 'teacher' }; 
  }

  try {
    const { teachers, students } = await getContactsForUser(targetUser);
    
    const responseUsers = {
      teachers: teachers.map(t => ({ id: t.id, name: t.name, role: 'teacher' as const })),
      students: students.map(s => ({
        id: s.id,
        name: s.name,
        role: 'student' as const,
        className: (s as any).className || s.class?.name || null,
      })),
    };

    return NextResponse.json(responseUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}
