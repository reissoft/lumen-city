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

// 1. ATUALIZAMOS A FUNÇÃO PARA INCLUIR reviewMaterials
async function getActivities(teacherId: string) {
  return await prisma.activity.findMany({
    where: { teacherId: teacherId }, 
    orderBy: { createdAt: 'desc' },
    // Incluindo o campo necessário
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
  // Os dados agora incluem reviewMaterials
  const activities = await getActivities(teacher.id);

  const stats = [
    { title: "Total de Alunos", value: "32", icon: "Users", color: "text-blue-600" },
    { title: "Quizzes Realizados", value: "145", icon: "CheckCircle2", color: "text-green-600" },
    { title: "Engajamento Médio", value: "87%", icon: "TrendingUp", color: "text-purple-600" },
  ];

  return (
    <Suspense fallback={<div>Carregando Painel...</div>}>
      {/* 2. PASSAMOS AS ATIVIDADES COMPLETAS PARA O CLIENTE */}
      <TeacherDashboardClient 
        teacherName={teacher.name || 'Professor(a)'} 
        activities={activities} 
        stats={stats}
      />
    </Suspense>
  );
}
