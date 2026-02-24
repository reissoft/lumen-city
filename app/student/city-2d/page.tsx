// app/student/city-2d/page.tsx

import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CityInterface2D from "@/components/CityInterface2D";

const prisma = new PrismaClient();

async function getStudentData() {
    const sessionUsername = cookies().get('lumen_session')?.value;
    const userRole = cookies().get('lumen_role')?.value;

    if (!sessionUsername || userRole !== 'student') {
        redirect('/login');
    }

    const student = await prisma.student.findUnique({
        where: { username: sessionUsername },
        include: { resources: true },
    });

    if (!student) {
        // Se a sessão é válida mas o aluno não existe, força o logout
        redirect('/auth/logout');
    }

    return student;
}

// Tipagem para garantir que o cityData tem a estrutura esperada
interface CityData {
    buildings: Building[];
}

interface Building {
    type: string;
    x: number;
    y: number;
}

function isValidCityData(data: any): data is CityData {
    return data && Array.isArray(data.buildings);
}

export default async function City2DPage() {
    const student = await getStudentData();

    // Extrai as construções do JSON, garantindo que os dados sejam válidos
    const cityData = student.cityData;
    const buildings = isValidCityData(cityData) ? cityData.buildings : [];

    // Renderiza a interface 2D, passando os dados do estudante e das construções
    return <CityInterface2D student={student} buildings={buildings} />;
}
