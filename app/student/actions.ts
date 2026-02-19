'use server'
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

const getTotalXpForLevelStart = (level: number): number => {
    if (level <= 1) {
        return 0;
    }
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

    // 1. Contar quantas vezes a atividade já foi recompensada.
    const rewardedCount = await prisma.activityAttempt.count({
        where: {
            studentId: student.id,
            activityId: submission.activityId,
            rewarded: true,
        }
    });
alert(rewardedCount);
    // 2. Se a contagem for > 0, já foi recompensado. Não dar XP.
    if (rewardedCount > 0) {
        await prisma.activityAttempt.create({
            data: {
                studentId: student.id,
                activityId: submission.activityId,
                score: submission.score,
                response: {},
                rewarded: false, // Marcar como não recompensada
            }
        });
        revalidatePath('/student');
        return {
            xpGained: 0,
            newLevel: student.level,
            leveledUp: false,
            message: "Você já ganhou XP por esta atividade."
        };
    }

    // 3. Se a contagem for 0, prossiga com a lógica de recompensa.
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
    while (newTotalXp >= getTotalXpForLevelStart(newLevel + 1)) {
        newLevel++;
    }
    
    await prisma.$transaction([
        prisma.activityAttempt.create({
            data: {
                studentId: student.id,
                activityId: submission.activityId,
                score: submission.score,
                response: {},
                rewarded: true, // Marcar como recompensada
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

    revalidatePath('/student');

    return {
        xpGained,
        newLevel,
        leveledUp: newLevel > student.level,
    };
}