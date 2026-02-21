// app/student/city/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import CityInterface from '@/components/CityInterface'; // CORRIGIDO: Voltando a usar o componente original

const prisma = new PrismaClient();

async function getStudentData() {
    const sessionUsername = cookies().get('lumen_session')?.value;
    const userRole = cookies().get('lumen_role')?.value;

    if (!sessionUsername || userRole !== 'student') {
        redirect('/login');
    }

    try {
        const student = await prisma.student.findUnique({
            where: { username: sessionUsername },
            select: {
                id: true,
                name: true,
                resources: true, // Garante que os recursos (ouro, etc.) sejam buscados
            },
        });

        if (!student) {
            redirect("/auth/logout");
        }

        const buildings = await prisma.building.findMany({
            where: {
                studentId: student.id,
            },
        });

        return { student, buildings };

    } catch (error) {
        console.error("Falha ao buscar dados para a cidade do aluno:", error);
        redirect("/auth/logout");
    }
}

export default async function StudentCityPage() {
    const { student, buildings } = await getStudentData();

    if (!student) {
        return <p className="text-center mt-10">Erro ao carregar perfil. Tente fazer login novamente.</p>;
    }

    // CORRIGIDO: Voltando a renderizar o componente correto
    return <CityInterface student={student} initialBuildings={buildings} />;
}
