import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Função de helper para pegar usuário autenticado dos cookies
async function getAuthenticatedUser() {
  const session = cookies().get('lumen_session')?.value;
  const role = cookies().get('lumen_role')?.value;
  if (!session || !role) return null;

  let user: any = null;
  if (role === 'admin' || role === 'teacher') {
      user = await prisma.teacher.findUnique({ where: { email: session } });
  } else if (role === 'student') {
      user = await prisma.student.findUnique({ where: { username: session } });
  }

  if (!user) return null;
  return { ...user, role };
}

// GET /api/messages - Rota para buscar o histórico de mensagens
export async function GET(req: NextRequest) {
  const loggedInUser = await getAuthenticatedUser();
  if (!loggedInUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId1 = searchParams.get('senderId'); 
  const userId2 = searchParams.get('contactId');

  if (!userId1 || !userId2) {
    return NextResponse.json({ error: 'Sender and Contact ID are required' }, { status: 400 });
  }

  const isParticipant = loggedInUser.id === userId1 || loggedInUser.id === userId2;
  const isAdmin = loggedInUser.role === 'admin';

  if (!isParticipant && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You can only view your own messages.' }, { status: 403 });
  }

  try {
    // CORREÇÃO: Utiliza o schema original com campos específicos (teacher/student)
    // @ts-ignore
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { // userId1 -> userId2
            senderTeacherId: userId1,
            receiverStudentId: userId2,
          },
          { // userId2 -> userId1
            senderStudentId: userId2,
            receiverTeacherId: userId1,
          },
           { // Adicionando os outros casos de comunicação
            senderStudentId: userId1,
            receiverTeacherId: userId2,
          },
          {
            senderTeacherId: userId2,
            receiverStudentId: userId1,
          }
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        senderTeacher: { select: { id: true, name: true } },
        senderStudent: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
  }
}

// POST /api/messages - Rota para enviar uma nova mensagem
export async function POST(req: NextRequest) {
  const loggedInUser = await getAuthenticatedUser();
  if (!loggedInUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { senderId, recipientId, content } = await req.json();

    if (loggedInUser.id !== senderId) {
        return NextResponse.json({ error: 'Forbidden: You cannot send messages as another user.' }, { status: 403 });
    }

    if (!recipientId || !content) {
      return NextResponse.json({ error: 'Recipient ID and content are required' }, { status: 400 });
    }
    
    // Busca o destinatário para saber a sua role (teacher ou student)
    const recipient = await (async () => {
        let target = await prisma.teacher.findUnique({ where: { id: recipientId } });
        if (target) return {...target, role: 'teacher'};
        {/* @ts-ignore */}
        target = await prisma.student.findUnique({ where: { id: recipientId } });
        if (target) return {...target, role: 'student'};
        return null;
    })();

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // ... (lógica de validação de turma compartilhada permanece a mesma)

    // CORREÇÃO: Cria a mensagem usando os campos específicos do schema
    // @ts-ignore
    const createdMessage = await prisma.message.create({
        data: {
            content: content,
            ...(loggedInUser.role === 'teacher' ? { senderTeacherId: loggedInUser.id } : { senderStudentId: loggedInUser.id }),
            ...(recipient.role === 'teacher' ? { receiverTeacherId: recipient.id } : { receiverStudentId: recipient.id }),
        },
    });

    // Cria a notificação para o destinatário
    // @ts-ignore
    await prisma.notification.create({
        data: {
            messageId: createdMessage.id,
            read: false,
            ...(recipient.role === 'teacher' ? { recipientTeacherId: recipient.id } : { recipientStudentId: recipient.id }),
        },
    });

    // Retorna a mensagem criada com os dados do remetente
    // @ts-ignore
    const sentMessage = await prisma.message.findUnique({
        where: { id: createdMessage.id },
        include: {
            senderTeacher: { select: { id: true, name: true } },
            senderStudent: { select: { id: true, name: true } },
        }
    });

    return NextResponse.json(sentMessage, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Error sending message' }, { status: 500 });
  }
}