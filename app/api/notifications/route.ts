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

// GET - Buscar notificações não lidas para o usuário logado
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        read: false,
        ...(user.role === 'student'
          ? { recipientStudentId: user.id }
          : { recipientTeacherId: user.id }),
      },
      include: {
        message: {
          include: {
            sender: true, // Inclui o objeto completo do remetente
          },
        },
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Error fetching notifications' }, { status: 500 });
  }
}

// POST - Marcar notificações como lidas
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { notificationIds } = await req.json();
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Notification IDs are required' }, { status: 400 });
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        // Segurança: Garante que o usuário só pode marcar as *suas* notificações como lidas
        ...(user.role === 'student'
          ? { recipientStudentId: user.id }
          : { recipientTeacherId: user.id }),
      },
      data: { read: true },
    });

    return NextResponse.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Error updating notifications' }, { status: 500 });
  }
}
