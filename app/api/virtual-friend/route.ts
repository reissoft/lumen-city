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
      return await handleAIMessage(body.message, body.studentName, body.friendName, body.pageContext);
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

// Função para construir o systemPrompt baseado no contexto da página
function buildSystemPrompt(friendName: string, studentName: string, pageContext?: any): string {
  let prompt = `Você é um assistente educacional amigável chamado ${friendName}, ajudando o aluno ${studentName}. `;
  
  if (pageContext) {
    // Adicionar contexto da página ao prompt
    prompt += `\n\nCONTEXTO DA PÁGINA ATUAL:\n`;
    
    // Informações do aluno
    if (pageContext.student) {
      prompt += `• Aluno: ${pageContext.student.name}\n`;
      prompt += `• Nível: ${pageContext.student.level}\n`;
      prompt += `• XP: ${pageContext.student.xp}\n`;
      prompt += `• Ouro: ${pageContext.student.gold}\n`;
      prompt += `• Turma: ${pageContext.student.className}\n\n`;
    }
    
    
    // Dados específicos da página (se houver dados estruturados)
    if (pageContext.pageData) {
      prompt += `• Página: ${pageContext.page}\n`;
      
      // Dados específicos por tipo de página
      if (pageContext.page === 'student/page') {
        const activities = pageContext.pageData.activities;
        const progress = pageContext.pageData.progress;
        const ranking = pageContext.pageData.ranking;
        
        prompt += `\nDADOS DA PÁGINA PRINCIPAL:\n`;
        prompt += `• Atividades disponíveis: ${activities?.available || 0}\n`;
        prompt += `• Atividades concluídas: ${activities?.completed || 0}\n`;
        prompt += `• Progresso do nível: ${progress?.levelProgress || 0}%\n`;
        prompt += `• Posição no ranking: ${ranking?.position || 'N/A'}\n`;
        prompt += `• Dicas rápidas: ${pageContext.pageData.tips?.join(', ') || 'Nenhuma'}\n`;
      }
      
      else if (pageContext.page === 'student/city/page') {
        const city = pageContext.pageData.city;
        const missions = pageContext.pageData.missions;
        
        prompt += `\nDADOS DA CIDADE:\n`;
        prompt += `• Prédios: ${city?.buildings || 0}\n`;
        prompt += `• Recursos: ${city?.resources?.gold || 0} ouro, ${city?.resources?.materials || 0} materiais\n`;
        prompt += `• Nível da cidade: ${city?.level || 0}\n`;
        prompt += `• Missões disponíveis: ${missions?.available || 0}\n`;
        prompt += `• Missões concluídas: ${missions?.completed || 0}\n`;
      }
      
      else if (pageContext.page === 'messaging/page') {
        const messages = pageContext.pageData.messages;
        const notifications = pageContext.pageData.notifications;
        
        prompt += `\nDADOS DE MENSAGENS:\n`;
        prompt += `• Mensagens não lidas: ${messages?.unread || 0}\n`;
        prompt += `• Contatos recentes: ${messages?.recentContacts || 0}\n`;
        prompt += `• Última mensagem: ${messages?.lastMessage || 'Nenhuma'}\n`;
        prompt += `• Notificações totais: ${notifications?.total || 0}\n`;
        prompt += `• Notificações do sistema: ${notifications?.system || 0}\n`;
      }
      
      else if (pageContext.page === 'student/settings/client-page') {
        const account = pageContext.pageData.account;
        const virtualFriend = pageContext.pageData.virtualFriend;
        
        prompt += `\nDADOS DE CONFIGURAÇÕES:\n`;
        prompt += `• Nome de usuário: ${account?.username || 'N/A'}\n`;
        prompt += `• Email: ${account?.email || 'N/A'}\n`;
        prompt += `• Nome do amigo virtual: ${virtualFriend?.name || 'N/A'}\n`;
        prompt += `• Avatar do amigo virtual: ${virtualFriend?.avatar || 'N/A'}\n`;
      }
      
      else if (pageContext.page === 'student/activity/[id]/review/page') {
        const activity = pageContext.pageData.activity;
        const progress = pageContext.pageData.progress;
        
        prompt += `\nDADOS DE REVISÃO DE ATIVIDADE:\n`;
        prompt += `• Título: ${activity?.title || 'N/A'}\n`;
        prompt += `• Tipo: ${activity?.type || 'N/A'}\n`;
        prompt += `• Dificuldade: ${activity?.difficulty || 'N/A'}\n`;
        prompt += `• Materiais disponíveis: ${activity?.materials?.count || 0}\n`;
        prompt += `• Tempo estimado: ${activity?.estimatedTime || 'N/A'} minutos\n`;
        prompt += `• Melhor pontuação: ${progress?.bestScore || 0}%\n`;
      }
      
      else if (pageContext.page.includes('student/play/')) {
        const quiz = pageContext.pageData.quiz;
        const performance = pageContext.pageData.performance;
        
        prompt += `\nDADOS DO QUIZ:\n`;
        prompt += `• Título: ${quiz?.title || 'N/A'}\n`;
        prompt += `• Perguntas: ${quiz?.questions || 0}\n`;
        prompt += `• Dificuldade: ${quiz?.difficulty || 'N/A'}\n`;
        prompt += `• Tempo limite: ${quiz?.timeLimit || 'N/A'} minutos\n`;
        prompt += `• Pontuação atual: ${performance?.currentScore || 0}%\n`;
        prompt += `• Pontuação máxima: ${performance?.maxScore || 0}%\n`;
      }
      
      // Ações disponíveis
      if (pageContext.pageData.availableActions) {
        prompt += `\nAÇÕES DISPONÍVEIS:\n`;
        pageContext.pageData.availableActions.forEach((action: string, index: number) => {
          prompt += `• ${index + 1}. ${action}\n`;
        });
      }
    }
  }
  
  prompt += `\n\nINSTRUÇÕES:\n`;
  prompt += `Responda de forma curta, educativa e encorajadora, como se fosse um amigo virtual que ajuda com dúvidas escolares.\n`;
  prompt += `Importante: se o aluno perguntar diretamente sobre respostas de atividade, você deve recusar educadamente, dizendo que não pode ajudar com isso, mas que pode explicar os conceitos relacionados para ajudar a entender melhor.\n`;
  prompt += `Seja simpático e use emojis quando apropriado. Responda em português.\n`;
  prompt += `Use o contexto da página para dar respostas mais relevantes e personalizadas.\n`;
  
  return prompt;
}

// Função para lidar com mensagens do AI
async function handleAIMessage(message: string, studentName: string, friendName: string, pageContext?: any) {
  try {
    // Aqui você pode integrar com o Groq ou outra API de IA
    // Por enquanto, vamos retornar uma resposta simulada
    
    // Construir o systemPrompt com base no contexto da página
    const systemPrompt = buildSystemPrompt(friendName, studentName, pageContext);
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
//console.log("Resposta da IA:", completion);
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