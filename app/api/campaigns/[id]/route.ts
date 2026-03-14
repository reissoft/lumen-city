// app/api/campaigns/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id;

    // 1. Deleta a campanha do banco de dados (o Prisma apagará os logs vinculados em cascata automaticamente)
    await prisma.studyCampaign.delete({
      where: { id: campaignId }
    });

    // 2. Limpa o cache para o painel do professor atualizar na mesma hora
    revalidatePath('/teacher');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao deletar campanha:', error);
    return NextResponse.json({ error: 'Erro interno ao deletar a campanha.' }, { status: 500 });
  }
}