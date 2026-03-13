// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 👇 Adicionamos o classId aqui
    const { title, studyMaterial, startDate, endDate, rewardCoins, teacherId, classId,dailyFrequency } = body;

    // Validação básica
    if (!title || !studyMaterial || !teacherId || !classId || !dailyFrequency) {
      return NextResponse.json({ error: 'Preencha todos os campos, incluindo a Turma.' }, { status: 400 });
    }

    // Salva a Campanha no Banco de Dados
    const newCampaign = await prisma.studyCampaign.create({
      data: {
        title,
        studyMaterial,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rewardCoins: Number(rewardCoins),
        teacherId: teacherId,
        dailyFrequency: Number(dailyFrequency),
        // 👇 Conecta a campanha à Turma (Class) selecionada no banco
        classes: {
          connect: [{ id: classId }] 
        }
      }
    });

    return NextResponse.json({ success: true, campaign: newCampaign });

  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar a campanha.' }, { status: 500 });
  }
}