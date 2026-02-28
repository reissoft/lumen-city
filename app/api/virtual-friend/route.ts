import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import Groq from 'groq-sdk'

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const sessionUsername = cookies().get('lumen_session')?.value;
    if (!sessionUsername) {
      return NextResponse.json({ error: 'Aluno não autenticado. Por favor, faça login novamente.' }, { status: 401 });
    }

    const body = await request.json();
    
    // Se for uma mensagem para o AI
    if (body.message && body.studentName && body.friendName) {
      return await handleAIMessage(body.message, body.studentName,body.friendName);
    }

    // Caso contrário, trata como configuração do amigo virtual
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

// Função para lidar com mensagens do AI
async function handleAIMessage(message: string, studentName: string, friendName: string) {
  try {
    // Aqui você pode integrar com o Groq ou outra API de IA
    // Por enquanto, vamos retornar uma resposta simulada
    
    const systemPrompt = `Você é um assistente educacional amigável chamado ${friendName} , nome do aluno é ${studentName}'. 
    Responda de forma curta, educativa e encorajadora, como se fosse um amigo virtual que ajuda com dúvidas escolares.
    Importante, se ele perguntar diretamente sobre respostas de atividade, você deve recusar educadamente, dizendo que não pode ajudar com isso, mas que pode explicar os conceitos relacionados para ajudar a entender melhor.
    Seja simpático e use emojis quando apropriado. Responda em português.`;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    // Simulação de chamada à API de IA
    // Na prática, você substituiria isso pela chamada real ao Groq
const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.5,
     // response_format: { type: "json_object" } 
    });
console.log("Resposta da IA:", completion);
    const aiResponse = completion.choices[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    return NextResponse.json({ 
      response: aiResponse,
      success: true 
    });

  } catch (error) {
    console.error('Error processing AI message:', error);
    return NextResponse.json({ 
      response: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
      success: false 
    });
  }
}

// Função simulada para resposta da IA
// Na prática, você substituiria isso pela chamada real ao Groq
async function simulateAIResponse(message: string, systemPrompt: string): Promise<string> {
  // Simulação de processamento
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Respostas simuladas baseadas no tipo de mensagem
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('ajuda') || lowerMessage.includes('ajudar')) {
    return 'Claro! Estou aqui para te ajudar! 🤗 O que você precisa?';
  } else if (lowerMessage.includes('matemática') || lowerMessage.includes('matematica')) {
    return 'Matemática é incrível! 🧮 Qual conceito você está estudando? Posso te explicar de forma divertida!';
  } else if (lowerMessage.includes('história') || lowerMessage.includes('historia')) {
    return 'História é uma viagem no tempo! 🕰️ Qual período ou evento você quer saber mais?';
  } else if (lowerMessage.includes('ciências') || lowerMessage.includes('ciencia')) {
    return 'Ciências são fascinantes! 🔬 Qual tema você quer explorar?';
  } else if (lowerMessage.includes('obrigado') || lowerMessage.includes('obg')) {
    return 'De nada! 😊 Sempre que precisar, estou aqui!';
  } else if (lowerMessage.includes('tchau') || lowerMessage.includes('até logo')) {
    return 'Até logo! 👋 Volte sempre que precisar!';
  } else {
    return `Entendi sua mensagem: "${message}".

Estou aqui para te ajudar com estudos! 📚

Pergunte-me sobre:
• Matemática 🧮
• História 🕰️  
• Ciências 🔬
• Português 📖
• Qualquer dúvida escolar! 💡

O que você gostaria de saber?`;
  }
}