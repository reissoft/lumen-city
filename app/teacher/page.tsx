// app/teacher/page.tsx
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from 'react';
import TeacherDashboardClient from "./TeacherDashboardClient"; // Componente cliente separado

const prisma = new PrismaClient();

async function getTeacherData() {
    const cookieStore = cookies();
    const email = cookieStore.get("lumen_session")?.value;
    
    if (!email) redirect("/login");

    const teacher = await prisma.teacher.findUnique({
      where: { email: email },
    });

    if (!teacher) redirect("/login");

    return teacher;
}

async function getActivities(teacherId: string) {
  return await prisma.activity.findMany({
    where: { teacherId: teacherId }, 
    orderBy: { createdAt: 'desc' }
  });
}

// A página principal continua sendo um Server Component que busca dados
export default async function TeacherDashboard() {
  const teacher = await getTeacherData();
  const rawActivities = await getActivities(teacher.id);

  // Mapeamos os dados das atividades para garantir que são serializáveis (sem Date objects)
  const activities = rawActivities.map(activity => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    type: activity.type,
    difficulty: activity.difficulty,
  }));

  // **A CORREÇÃO FINAL:** Passamos o nome do ícone como string, não o componente.
  const stats = [
    { title: "Total de Alunos", value: "32", icon: "Users", color: "text-blue-600" },
    { title: "Quizzes Realizados", value: "145", icon: "CheckCircle2", color: "text-green-600" },
    { title: "Engajamento Médio", value: "87%", icon: "TrendingUp", color: "text-purple-600" },
  ];

  return (
    <Suspense fallback={<div>Carregando Painel...</div>}>
      <TeacherDashboardClient 
        teacherName={teacher.name || 'Professor(a)'} 
        activities={activities} 
        stats={stats} // Agora os stats são 100% serializáveis
      />
    </Suspense>
  );
}
