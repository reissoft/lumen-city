import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

/**
 * Obtém os dados do usuário logado a partir dos cookies de sessão.
 * 
 * Esta função lê os cookies 'lumen_session' (username) e 'lumen_role' (role)
 * para buscar o usuário correspondente no banco de dados.
 * 
 * @returns O objeto do usuário (Teacher ou Student) ou null se não estiver logado ou não for encontrado.
 */
export async function getSession() {
    const cookieStore = cookies();
    const session = cookieStore.get('lumen_session')?.value;
    const role = cookieStore.get('lumen_role')?.value;

    if (!session || !role) {
        return null;
    }

    let user = null;
    if (role === 'teacher' || role === 'admin') {
        // O login salva o email do professor na sessão
        user = await prisma.teacher.findUnique({
            where: { email: session },
            select: {
                id: true,
                name: true,
                email: true,
                isSchoolAdmin: true,
                schoolId: true,
            }
        });
    } else if (role === 'student') {
        // O login salva o username do aluno na sessão
        user = await prisma.student.findUnique({
            where: { username: session },
            select: {
                id: true,
                name: true,
                username: true,
                schoolId: true,
            }
        });
    }

    if (!user) return null;

    return { ...user, role };
}
