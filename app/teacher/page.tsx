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
      reviewMaterials: true, 
    }
  });
}

export default async function TeacherDashboard() {
  const teacher = await getTeacherData();
  const activities = await getActivities(teacher.id);

  const stats = [
    { title: "Total de Alunos", value: "32", icon: "Users", color: "text-blue-400" },
    { title: "Quizzes Realizados", value: "145", icon: "CheckCircle2", color: "text-green-400" },
    { title: "Engajamento Médio", value: "87%", icon: "TrendingUp", color: "text-purple-400" },
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
