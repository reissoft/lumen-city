// app/api/campaigns/active/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const classId = searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ error: 'ID da turma não fornecido.' }, { status: 400 });
  }

  try {
    const today = new Date();
    
    // 👇 MUDANÇA: findMany para buscar TODAS as campanhas ativas
    const activeCampaigns = await prisma.studyCampaign.findMany({
      where: {
        classes: { some: { id: classId } },
        startDate: { lte: today },
        endDate: { gte: today }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!activeCampaigns || activeCampaigns.length === 0) {
      return NextResponse.json({ success: false, message: 'Nenhuma campanha ativa.' });
    }

    // 👇 MUDANÇA: Retorna um array "campaigns" em vez de "campaign"
    return NextResponse.json({ success: true, campaigns: activeCampaigns });

  } catch (error) {
    console.error('Erro ao buscar campanhas ativas:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}