import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Envia uma mensagem do sistema para um professor ou aluno.
 * @param recipientId ID do destinatário (pode ser professor ou aluno)
 * @param recipientRole 'teacher' | 'student'
 * @param content Texto da mensagem
 */
export async function sendSystemMessage(recipientId: string, recipientRole: 'teacher' | 'student', content: string) {
    if (!recipientId || !content) return;

    // payload always includes isSystem now that migration has been applied
    const data: any = { content, isSystem: true };

    if (recipientRole === 'teacher') {
        data.receiverTeacherId = recipientId;
    } else {
        data.receiverStudentId = recipientId;
    }

    try {
        const createdMessage = await prisma.message.create({ data });

        // cria notificação também (mas só se o modelo existir!)
        if ('notification' in prisma) {
            await prisma.notification.create({
                data: {
                    messageId: createdMessage.id,
                    read: false,
                    ...(recipientRole === 'teacher'
                        ? { recipientTeacherId: recipientId }
                        : { recipientStudentId: recipientId }),
                },
            });
        }

        return createdMessage;
    } catch (error) {
        // registrar para diagnóstico; chamadas anteriores usavam .catch(console.error)
        console.error('Erro ao enviar mensagem do sistema:', error);
        throw error;
    }
}
