import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const email = cookies().get('lumen_session')?.value;
    if (!email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const admin = await prisma.teacher.findUnique({
      where: { email },
      select: { isSchoolAdmin: true, schoolId: true },
    });

    if (!admin?.isSchoolAdmin || !admin.schoolId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const teacherId = params.id;
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, schoolId: admin.schoolId },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Estatísticas gerais
    const [totalCreated, totalDone, recentCreated, recentDone] = await Promise.all([
      prisma.activity.count({ where: { teacherId } }),
      prisma.activityAttempt.count({
        where: { activity: { teacherId } },
      }),
      prisma.activity.count({
        where: { teacherId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.activityAttempt.count({
        where: { activity: { teacherId }, createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    // Estatísticas por tipo de atividade
    const activitiesByType = await prisma.activity.findMany({
      where: { teacherId },
      select: {
        id: true,
        type: true,
        attempts: {
          select: { id: true },
        },
      },
    });

    const typeStats: Record<string, { created: number; done: number }> = {};
    activitiesByType.forEach((activity) => {
      if (!typeStats[activity.type]) {
        typeStats[activity.type] = { created: 0, done: 0 };
      }
      typeStats[activity.type].created += 1;
      typeStats[activity.type].done += activity.attempts.length;
    });

    // Estatísticas por turma
    const classesByTeacher = await prisma.class.findMany({
      where: { teachers: { some: { id: teacherId } } },
      select: {
        id: true,
        name: true,
        activities: {
          select: {
            id: true,
            attempts: { select: { id: true } },
          },
        },
      },
    });

    const classStats: Array<{ name: string; created: number; done: number }> = classesByTeacher.map((cls) => ({
      name: cls.name,
      created: cls.activities.length,
      done: cls.activities.reduce((sum, act) => sum + act.attempts.length, 0),
    }));

    return NextResponse.json({
      totalCreated,
      totalDone,
      recentCreated,
      recentDone,
      typeStats,
      classStats,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
