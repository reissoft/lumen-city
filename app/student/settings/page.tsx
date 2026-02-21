// app/student/settings/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import StudentSettingsClientPage from './client-page';

const prisma = new PrismaClient();

async function getStudentData(username: string) {
    try {
        const student = await prisma.student.findUnique({
            where: { username },
            select: {
                name: true,
                email: true,
                username: true,
            },
        });
        return student;
    } catch (error) {
        console.error("Falha ao buscar dados do aluno:", error);
        return null;
    }
}

export default async function StudentSettingsPage() {
    // CORREÇÃO: Usando o nome correto do cookie
    const sessionUsername = cookies().get('lumen_session')?.value;
    const userRole = cookies().get('lumen_role')?.value;

    if (!sessionUsername || userRole !== 'student') {
        redirect('/login');
    }

    const student = await getStudentData(sessionUsername);

    if (!student) {
        // Se o aluno não for encontrado no banco de dados, a sessão é inválida
        // A melhor ação é deslogar o usuário para que ele possa se autenticar novamente
        redirect('/auth/logout');
    }

    return <StudentSettingsClientPage student={student} />;
}
