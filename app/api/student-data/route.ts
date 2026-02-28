import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Função para calcular o nível correto a partir do XP
const getCorrectLevelFromXp = (xp: number): number => {
  if (xp < 100) return 1;
  const level = Math.floor(0.5 + 0.1 * Math.sqrt(25 + 2 * xp));
  return level;
};

// Função para calcular o progresso do nível
const getLevelProgress = (xp: number, level: number): number => {
  const getTotalXpForLevelStart = (level: number): number => {
    if (level <= 1) return 0;
    const n = level - 1;
    const a1 = 100;
    const an = n * 100;
    return (n * (a1 + an)) / 2;
  };

  const xpForCurrentLevelStart = getTotalXpForLevelStart(level);
  const xpForNextLevelStart = getTotalXpForLevelStart(level + 1);
  const xpNeededForThisLevel = xpForNextLevelStart - xpForCurrentLevelStart;
  const currentLevelProgress = xp - xpForCurrentLevelStart;
  return xpNeededForThisLevel > 0 ? (currentLevelProgress / xpNeededForThisLevel) * 100 : 100;
};

export async function GET(request: NextRequest) {
  try {
    const sessionUsername = cookies().get('lumen_session')?.value;
    if (!sessionUsername) {
      return NextResponse.json({ error: 'Aluno não autenticado. Por favor, faça login novamente.' }, { status: 401 });
    }

    // Buscar dados do aluno
    const student = await prisma.student.findUnique({
      where: { username: sessionUsername },
      include: {
        resources: true,
        class: { select: { name: true, id: true } }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 });
    }

    // Buscar atividades disponíveis para a turma do aluno
    let activitiesAvailable = 0;
    let activitiesCompleted = 0;
    
    if (student.classId) {
      const activities = await prisma.activity.findMany({
        where: { classes: { some: { id: student.classId } } }
      });
      
      activitiesAvailable = activities.length;

      // Contar atividades concluídas (com score > 0)
      const attempts = await prisma.activityAttempt.findMany({
        where: { studentId: student.id }
      });

      const completedActivityIds = new Set();
      attempts.forEach(attempt => {
        if (attempt.score > 0) {
          completedActivityIds.add(attempt.activityId);
        }
      });

      activitiesCompleted = completedActivityIds.size;
    }

    // Buscar ranking da turma
    let rankingPosition = 0;
    if (student.classId) {
      const ranking = await prisma.student.findMany({
        where: { classId: student.classId },
        orderBy: { xp: 'desc' },
        select: { id: true, xp: true }
      });

      rankingPosition = ranking.findIndex(s => s.id === student.id) + 1;
    }

    // Calcular nível e progresso
    const level = getCorrectLevelFromXp(student.xp);
    const levelProgress = getLevelProgress(student.xp, level);

    return NextResponse.json({
      xp: student.xp,
      gold: student.resources?.gold || 0,
      className: student.class?.name || 'Sem turma',
      activitiesAvailable,
      activitiesCompleted,
      levelProgress: Math.round(levelProgress),
      rankingPosition
    });

  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json({ error: 'Ocorreu um erro no servidor. Tente novamente.' }, { status: 500 });
  }
}