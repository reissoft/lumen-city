// app/api/campaigns/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id;
    const body = await request.json();
    const { title, studyMaterial, startDate, endDate, rewardCoins, classId,dailyFrequency } = body;

    // Atualiza a campanha no banco de dados
    const updatedCampaign = await prisma.studyCampaign.update({
      where: { id: campaignId },
      data: {
        title,
        studyMaterial,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rewardCoins: Number(rewardCoins),
        dailyFrequency: Number(dailyFrequency),
        // O `set` substitui a turma antiga pela nova que o professor selecionou
        classes: {
          set: [{ id: classId }]
        }
      }
    });

    return NextResponse.json({ success: true, campaign: updatedCampaign });

  } catch (error) {
    console.error('Erro ao atualizar campanha:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar a campanha.' }, { status: 500 });
  }
}