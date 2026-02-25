import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import StudentDetailsClient from './StudentDetailsClient';

const prisma = new PrismaClient();

// Tipagem para os dados da página que serão passados para o cliente
export interface StudentPageData {
  student: {
    id: string;
    name: string;
  };
  activityAttempts: {
    id: string;
    completed: boolean;
    score: number | null;
    createdAt: Date;
    activity: {
      id: string;
      title: string;
      type: string;
    };
  }[];
}

async function getStudentData(studentId: string): Promise<StudentPageData> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, name: true },
  });

  if (!student) {
    // Se o aluno não for encontrado, redireciona ou mostra um erro
    redirect('/teacher/classes');
  }

  const activityAttempts = await prisma.activityAttempt.findMany({
    where: {
      studentId: studentId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      activity: {
        select: {
          id: true,
          title: true,
          type: true,
        },
      },
    },
  });

  return { student, activityAttempts };
}

export default async function StudentDetailsPage({ params }: { params: { studentId: string; classId: string } }) {
  // Validar a sessão do professor, se necessário (boa prática)
  const cookieStore = cookies();
  if (!cookieStore.get("lumen_session")) {
    redirect("/login");
  }

  const data = await getStudentData(params.studentId);

  return (
    <Suspense fallback={<div className='flex items-center justify-center min-h-screen text-white text-2xl bg-gradient-to-br from-gray-900 to-blue-900/20'>Carregando dados do aluno...</div>}>
      <StudentDetailsClient data={data} classId={params.classId} />
    </Suspense>
  );
}
