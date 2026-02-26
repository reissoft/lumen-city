// app/api/quiz/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// GET /api/quiz/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    // 1. Verificação de Autenticação
    const cookieStore = cookies();
    const session = cookieStore.get("lumen_session")?.value;
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // 2. Buscar a atividade no banco de dados
    const activity = await prisma.activity.findUnique({
      where: { id },
    });

    // 3. Validar a atividade
    if (!activity) {
      return new NextResponse("Atividade não encontrada", { status: 404 });
    }

    if (activity.type !== 'QUIZ' || !activity.payload) {
        return new NextResponse("Este conteúdo não é um quiz válido.", { status: 400 });
    }

    if (activity.expiresAt && new Date(activity.expiresAt) < new Date()) {
        return NextResponse.json({ error: "Atividade expirada" }, { status: 410 });
    }

    // 4. Extrair e retornar os dados do quiz
    const quizData = {
        title: activity.title,
        description: activity.description,
        questions: (activity.payload as any).questions, 
    };

    return NextResponse.json(quizData);

  } catch (error) {
    console.error("[API_QUIZ_GET]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}
