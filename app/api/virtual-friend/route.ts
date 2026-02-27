import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const sessionUsername = cookies().get('lumen_session')?.value;
    if (!sessionUsername) {
      return NextResponse.json({ error: 'Aluno não autenticado. Por favor, faça login novamente.' }, { status: 401 });
    }

    const body = await request.json();
    const { virtualFriendName, virtualFriendAvatar } = body;

    // Validate input
    if (!virtualFriendName || !virtualFriendAvatar) {
      return NextResponse.json({ error: 'Nome e avatar são obrigatórios.' }, { status: 400 });
    }

    // Validate avatar is in allowed list
    const FRIEND_OPTIONS = [
      'bear', 'buffalo', 'chick', 'chicken', 'cow', 'crocodile', 'dog', 'duck',
      'elephant', 'frog', 'giraffe', 'goat', 'gorilla', 'hippo', 'horse', 'monkey',
      'moose', 'narwhal', 'owl', 'panda', 'parrot', 'penguin', 'pig', 'rabbit',
      'rhino', 'sloth', 'snake', 'walrus', 'whale', 'zebra'
    ];

    if (!FRIEND_OPTIONS.includes(virtualFriendAvatar)) {
      return NextResponse.json({ error: 'Avatar inválido.' }, { status: 400 });
    }

    // Find student
    const student = await prisma.student.findUnique({ where: { username: sessionUsername } });
    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 });
    }

    // Update student virtual friend settings
    await prisma.student.update({
      where: { id: student.id },
      data: {
        // @ts-ignore
        virtualFriendName: virtualFriendName,
        virtualFriendAvatar: virtualFriendAvatar
      },
    });

    return NextResponse.json({ success: 'Configurações do amigo virtual salvas com sucesso!' });

  } catch (error) {
    console.error('Error updating virtual friend settings:', error);
    return NextResponse.json({ error: 'Ocorreu um erro no servidor. Tente novamente.' }, { status: 500 });
  }
}