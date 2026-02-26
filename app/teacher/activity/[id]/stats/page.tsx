import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ActivityStatsClient from './ActivityStatsClient';

const prisma = new PrismaClient();

export interface ActivityStatsData {
  activity: {
    id: string;
    title: string;
    type: string;
  };
  attempts: Array<{
    id: string;
    studentId: string;
    student: {
      id: string;
      name: string;
    };
    score: number | null;
    createdAt: Date;
  }>;
}

async function getActivityStats(activityId: string): Promise<ActivityStatsData> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: {
      id: true,
      title: true,
      type: true,
      teacherId: true,
    },
  });

  if (!activity) {
    redirect('/teacher');
  }

  const attempts = await prisma.activityAttempt.findMany({
    where: { activityId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      studentId: true,
      student: {
        select: {
          id: true,
          name: true,
        },
      },
      score: true,
      createdAt: true,
    },
  });

  // @ts-ignore
  return { activity, attempts };
}

export default async function ActivityStatsPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  if (!cookieStore.get('lumen_session')) {
    redirect('/login');
  }

  const data = await getActivityStats(params.id);

  return (
    <Suspense fallback={<div className='flex items-center justify-center min-h-screen text-white text-2xl bg-gradient-to-br from-gray-900 to-blue-900/20'>Carregando dados da atividade...</div>}>
      <ActivityStatsClient data={data} />
    </Suspense>
  );
}
