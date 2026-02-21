// app/teacher/settings/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import TeacherSettingsClientPage from './client-page';

const prisma = new PrismaClient();

async function getTeacherData(email: string) {
    try {
        const teacher = await prisma.teacher.findUnique({
            where: { email },
            select: {
                name: true,
                email: true,
            },
        });
        return teacher;
    } catch (error) {
        console.error("Falha ao buscar dados do professor:", error);
        return null;
    }
}

export default async function TeacherSettingsPage() {
    const sessionEmail = cookies().get('lumen_session')?.value;
    const userRole = cookies().get('lumen_role')?.value;

    // Proteção de rota: apenas professores logados podem acessar
    if (!sessionEmail || userRole !== 'teacher') {
        redirect('/login');
    }

    const teacher = await getTeacherData(sessionEmail);

    if (!teacher) {
        // Se não encontrar o professor no banco, força o logout
        redirect('/auth/logout');
    }

    return (
        <TeacherSettingsClientPage teacher={teacher} />
    );
}
