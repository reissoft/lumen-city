// app/api/campaigns/[id]/report/page.tsx

import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import CampaignReportClient from './CampaignReportClient'; // Ajuste o caminho se o client estiver em outra pasta

const prisma = new PrismaClient();

export default async function CampaignReportPage({ params }: { params: { id: string } }) {
    // 1. Busca a campanha e todos os logs relacionados a ela
    const campaign = await prisma.studyCampaign.findUnique({
        where: { 
            id: params.id 
        },
        include: {
            logs: {
                orderBy: { 
                    createdAt: 'desc' // Traz as respostas mais recentes primeiro
                },
                include: {
                    student: {
                        select: { name: true } // Pega apenas o nome do aluno para não pesar a busca
                    }
                }
            }
        }
    });

    // 2. Se a campanha não existir (alguém digitou o ID errado na URL), retorna página 404
    if (!campaign) {
        notFound();
    }

    // 3. Formata os dados para garantir que a data (Date) vire string e não quebre o Client Component
    const formattedCampaign = {
        id: campaign.id,
        title: campaign.title,
        rewardCoins: campaign.rewardCoins,
        logs: campaign.logs.map(log => ({
            id: log.id,
            student: { name: log.student.name },
            generatedQuest: log.generatedQuest,
            studentAnswer: log.studentAnswer,
            isCorrect: log.isCorrect,
            aiFeedback: log.aiFeedback,
            createdAt: log.createdAt.toISOString()
        }))
    };

    // 4. Renderiza a interface passando os dados formatados
    return <CampaignReportClient campaign={formattedCampaign} />;
}