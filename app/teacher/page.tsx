import { Suspense } from 'react';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TeacherDashboardClient from './TeacherDashboardClient';

const prisma = new PrismaClient()

async function getTeacherData() {
    const cookieStore = cookies();
    const email = cookieStore.get("lumen_session")?.value;
    if (!email) redirect("/login");

    const teacher = await prisma.teacher.findUnique({ 
      where: { email },
      select: {
        id: true,
        name: true,
      }
    });
    if (!teacher) redirect("/login");

    return teacher;
}

async function getActivities(teacherId: string) {
  return await prisma.activity.findMany({
    where: { teacherId: teacherId }, 
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      difficulty: true,
      // @ts-ignore - new field from prisma schema; regenerate types after running migrate
      expiresAt: true,
      reviewMaterials: true,
      payload: true
    }
  });
}

async function getTeacherStats(teacherId: string) {
  // 1. Encontrar todas as turmas do professor (usando a relação muitos-para-muitos)
  const teacherClasses = await prisma.class.findMany({
    where: {
      teachers: { // A turma tem uma lista de `teachers`
        some: {   // Onde `some` (algum) professor da lista
          id: teacherId, // Tenha o ID do professor atual
        },
      },
    },
    select: { id: true },
  });

  // Se não houver turmas, não há estatísticas para calcular.
  if (teacherClasses.length === 0) {
    return { totalStudents: 0, totalAttempts: 0, averageEngagement: 0 };
  }
  const teacherClassIds = teacherClasses.map(c => c.id);

  // 2. Encontrar todos os alunos que pertencem a essas turmas
  const studentsOfTeacher = await prisma.student.findMany({
    where: {
      classId: {
        in: teacherClassIds,
      },
    },
    select: { id: true },
  });
  const totalStudents = studentsOfTeacher.length;
  const studentIdsOfTeacher = studentsOfTeacher.map(s => s.id);

  // 3. Contar o total de tentativas (quizzes realizados) nas atividades deste professor
  const totalAttempts = await prisma.activityAttempt.count({
    where: {
      activity: {
        teacherId: teacherId,
      },
    },
  });

  // 4. Contar quantos alunos únicos (das turmas do professor) realizaram pelo menos uma atividade
  let engagedStudentsCount = 0;
  if (studentIdsOfTeacher.length > 0) {
      const engagedStudents = await prisma.activityAttempt.groupBy({
        by: ['studentId'],
        where: {
          studentId: {
            in: studentIdsOfTeacher,
          },
        },
      });
      engagedStudentsCount = engagedStudents.length;
  }

  // 5. Calcular a porcentagem de engajamento
  const averageEngagement = totalStudents > 0
    ? Math.round((engagedStudentsCount / totalStudents) * 100)
    : 0;

  return {
    totalStudents,
    totalAttempts,
    averageEngagement,
  };
}

export default async function TeacherDashboard() {
  const teacher = await getTeacherData();
  
  const [activities, statsData] = await Promise.all([
    getActivities(teacher.id),
    getTeacherStats(teacher.id),
  ]);

  const stats = [
    { title: "Total de Alunos", value: statsData.totalStudents.toString(), icon: "Users", color: "text-blue-400" },
    { title: "Quizzes Realizados", value: statsData.totalAttempts.toString(), icon: "CheckCircle2", color: "text-green-400" },
    { title: "Engajamento Médio", value: `${statsData.averageEngagement}%`, icon: "TrendingUp", color: "text-purple-400" },
  ];

  return (
    <Suspense fallback={<div className='flex items-center justify-center min-h-screen text-white text-2xl bg-gradient-to-br from-gray-900 to-blue-900/20'>Carregando Painel...</div>}> 
      <TeacherDashboardClient 
        teacherName={teacher.name || 'Professor(a)'} 
        activities={activities as any} 
        stats={stats}
      />
    </Suspense>
  );
}
