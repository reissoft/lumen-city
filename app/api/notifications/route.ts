import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

const SESSION_COOKIE_NAME = 'lumen_session';
const ROLE_COOKIE_NAME = 'lumen_role';

// Lógica de autenticação reutilizada
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

// GET: Busca as notificações não lidas para o usuário
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // se o modelo notification ainda não estiver gerado, retornamos vazio
    if (!('notification' in prisma) || typeof (prisma as any).notification?.findMany !== 'function') {
      console.warn('Prisma client missing notification model');
      return NextResponse.json([]);
    }

    // @ts-ignore
    const notifications = await prisma.notification.findMany({
      where: {
        read: false,
        OR: [
          { recipientTeacherId: user.id },
          { recipientStudentId: user.id },
        ],
      },
      include: {
        message: {
          include: {
            senderTeacher: { select: { name: true, id: true } },
            senderStudent: { select: { name: true, id: true } },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notifications);

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Error fetching notifications' }, { status: 500 });
  }
}

// DELETE: Marca todas as notificações do usuário como lidas
export async function DELETE(req: NextRequest) {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // @ts-ignore
        await prisma.notification.updateMany({
            where: {
                read: false,
                OR: [
                  { recipientTeacherId: user.id },
                  { recipientStudentId: user.id },
                ],
            },
            data: {
                read: true,
            },
        });

        return NextResponse.json({ message: 'Notifications marked as read' }, { status: 200 });

    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json({ error: 'Error marking notifications as read' }, { status: 500 });
    }
}
