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
  const systemOnly = searchParams.get('system') === 'true';

  if (!systemOnly && (!userId1 || !userId2)) {
    return NextResponse.json({ error: 'Sender and Contact ID are required' }, { status: 400 });
  }

  const isParticipant = loggedInUser.id === userId1 || loggedInUser.id === userId2;
  const isAdmin = loggedInUser.role === 'admin';

  // skip permission check for system messages (authenticated users can view their own system messages)
  if (!systemOnly && !isParticipant && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You can only view your own messages.' }, { status: 403 });
  }

  try {
    let messages;
    if (systemOnly) {
      console.log('🔍 [API] Fetching system messages for user:', loggedInUser.id, 'role:', loggedInUser.role);
      // return all system messages and legacy messages without sender
      // @ts-ignore
      messages = await prisma.message.findMany({
        where: {
          AND: [
            {
              OR: [
                { isSystem: true },
                {
                  AND: [
                    { senderTeacherId: null },
                    { senderStudentId: null },
                  ],
                },
              ],
            },
            {
              OR: [
                { receiverTeacherId: loggedInUser.id },
                { receiverStudentId: loggedInUser.id },
              ],
            },
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          senderTeacher: { select: { id: true, name: true } },
          senderStudent: { select: { id: true, name: true } },
        },
      });
      console.log('🔍 [API] Found', messages.length, 'system messages');
    } else {
      // include system messages between users by also returning any message where
      // isSystem = true and recipient matches either id (so system can broadcast).
      // @ts-ignore
      messages = await prisma.message.findMany({
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
            },
            // also include system messages sent to either side
            {
              isSystem: true,
              receiverTeacherId: userId1,
            },
            {
              isSystem: true,
              receiverTeacherId: userId2,
            },
            {
              isSystem: true,
              receiverStudentId: userId1,
            },
            {
              isSystem: true,
              receiverStudentId: userId2,
            }
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          senderTeacher: { select: { id: true, name: true } },
          senderStudent: { select: { id: true, name: true } },
        },
      });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('❌ [API] Error fetching messages:', error);
    return NextResponse.json({ error: 'Error fetching messages', details: String(error) }, { status: 500 });
  }
}

// POST /api/messages - Rota para enviar uma nova mensagem
export async function POST(req: NextRequest) {
  const loggedInUser = await getAuthenticatedUser();
  if (!loggedInUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { senderId, recipientId, content, isSystem } = await req.json();

    // if it's a system message we ignore senderId check
    if (!isSystem) {
        if (loggedInUser.id !== senderId) {
            return NextResponse.json({ error: 'Forbidden: You cannot send messages as another user.' }, { status: 403 });
        }
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

    // CORREÇÃO: Cria a mensagem usando os campos específicos do schema
    // @ts-ignore
    const createdMessage = await prisma.message.create({
        data: {
            content: content,
            isSystem: !!isSystem,
            ...(isSystem ? {} : (loggedInUser.role === 'teacher' ? { senderTeacherId: loggedInUser.id } : { senderStudentId: loggedInUser.id })),
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

    // Retorna a mensagem criada com os dados do remetente (se houver)
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