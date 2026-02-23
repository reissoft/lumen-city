import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

const SESSION_COOKIE_NAME = 'lumen_session';
const ROLE_COOKIE_NAME = 'lumen_role';

async function getAuthenticatedUser() {
  const session = cookies().get(SESSION_COOKIE_NAME)?.value;
  const role = cookies().get(ROLE_COOKIE_NAME)?.value;

  if (!session || !role) return null;

  let user: any = null;
  if (role === 'teacher' || role === 'admin') {
    user = await prisma.teacher.findUnique({ where: { email: session } });
  } else if (role === 'student') {
    user = await prisma.student.findUnique({ where: { username: session } });
  }

  if (!user) return null;

  return { ...user, role };
}

// GET messages - Rota para buscar mensagens
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get('contactId');

  if (!contactId) {
    return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      // CORREÇÃO: A lógica da query foi reestruturada para ser explícita e correta.
      where: {
        OR: [
          { // 1. Mensagens DE mim PARA o contato
            AND: [
              { OR: [{ senderTeacherId: user.id }, { senderStudentId: user.id }] },
              { OR: [{ receiverTeacherId: contactId }, { receiverStudentId: contactId }] },
            ],
          },
          { // 2. Mensagens DE o contato PARA mim
            AND: [
              { OR: [{ senderTeacherId: contactId }, { senderStudentId: contactId }] },
              { OR: [{ receiverTeacherId: user.id }, { receiverStudentId: user.id }] },
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

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
  }
}

// POST message - Rota para enviar mensagens
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { recipientId, content } = await req.json();

    if (!recipientId || !content) {
      return NextResponse.json({ error: 'Recipient ID and content are required' }, { status: 400 });
    }

    const recipientTeacher = await prisma.teacher.findUnique({ where: { id: recipientId } });
    const recipientStudent = await prisma.student.findUnique({ where: { id: recipientId } });

    if (!recipientTeacher && !recipientStudent) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    const createdMessage = await prisma.message.create({
      data: {
        content: content,
        ...(user.role === 'student'
          ? { senderStudent: { connect: { id: user.id } } }
          : { senderTeacher: { connect: { id: user.id } } }),
        ...(recipientStudent
          ? { receiverStudent: { connect: { id: recipientId } } }
          : { receiverTeacher: { connect: { id: recipientId } } }),
      },
    });

    await prisma.notification.create({
      data: {
        messageId: createdMessage.id,
        read: false,
        recipientTeacherId: recipientTeacher ? recipientId : undefined,
        recipientStudentId: recipientStudent ? recipientId : undefined,
      },
    });
    
    // CORREÇÃO: Busca a mensagem recém-criada com os `includes` para retornar o objeto no formato correto.
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
