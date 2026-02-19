'use server'
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

// Helper para calcular o total de XP necessário para INICIAR um determinado nível.
// Nível 1: 0 XP
// Nível 2: 100 XP (para completar o L1)
// Nível 3: 300 XP (100 para o L1 + 200 para o L2)
// Nível 4: 600 XP (300 + 300 para o L3)
const getTotalXpForLevelStart = (level: number): number => {
    if (level <= 1) {
        return 0;
    }
    // Soma de uma progressão aritmética: 100 + 200 + ... + (level-1)*100
    const n = level - 1;
    const a1 = 100;
    const an = n * 100;
    return (n * (a1 + an)) / 2;
};

interface ActivitySubmission {
    activityId: string;
    score: number; // Pontuação de 0 a 100
}

export async function submitActivity(submission: ActivitySubmission) {
    const email = cookies().get("lumen_session")?.value;
    if (!email) {
        redirect("/login");
    }

    const student = await prisma.student.findUnique({
        where: { email },
        select: { id: true, xp: true, level: true }
    });

    if (!student) {
        throw new Error("Estudante não encontrado.");
    }
    
    const activity = await prisma.activity.findUnique({
        where: { id: submission.activityId },
        select: { difficulty: true }
    });

    if (!activity) {
        throw new Error("Atividade não encontrada.");
    }

    const xpGained = Math.round(submission.score * (1 + (activity.difficulty - 1) * 0.5));
    const newTotalXp = student.xp + xpGained;
    
    let newLevel = student.level;
    // Lógica de "level up" corrigida e mais robusta
    // Verifica se o XP total do aluno ultrapassou o necessário para o próximo nível
    while (newTotalXp >= getTotalXpForLevelStart(newLevel + 1)) {
        newLevel++;
    }
    
    await prisma.$transaction([
        prisma.activityAttempt.create({
            data: {
                studentId: student.id,
                activityId: submission.activityId,
                score: submission.score,
                response: {}, // Campo obrigatório
                rewarded: true, // Campo obrigatório
            }
        }),
        prisma.student.update({
            where: { id: student.id },
            data: {
                xp: newTotalXp,
                level: newLevel,
            }
        })
    ]);

    return {
        xpGained,
        newLevel,
        leveledUp: newLevel > student.level,
    };
}