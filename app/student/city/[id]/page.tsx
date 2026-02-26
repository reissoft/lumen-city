// app/student/city/[id]/page.tsx

import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CityInterface from "@/components/CityInterface";

const prisma = new PrismaClient();

// reuse authorization check to ensure only logged in students can view
async function ensureStudentSession() {
    const sessionUsername = cookies().get('lumen_session')?.value;
    const userRole = cookies().get('lumen_role')?.value;

    if (!sessionUsername || userRole !== 'student') {
        redirect('/login');
    }
}

interface PageProps {
    params: {
        id: string;
    };
}

export default async function FriendCityPage({ params }: PageProps) {
    await ensureStudentSession();

    // fetch viewer information so we can confirm they are in same class
    const viewer = await prisma.student.findUnique({
        where: { username: cookies().get('lumen_session')?.value || '' },
        select: { classId: true }
    });

    const friend = await prisma.student.findUnique({
        where: { id: params.id },
        include: { resources: true, class: { select: { id: true } } }
    });

    if (!friend) {
        return <div className="min-h-screen flex items-center justify-center text-white">Amigo não encontrado.</div>;
    }

    // check same class permission
    if (viewer && friend.class?.id && viewer.classId !== friend.class.id) {
        return <div className="min-h-screen flex items-center justify-center text-white">Você não tem acesso à cidade desse aluno.</div>;
    }

    const cityData = (friend.cityData as any) || { buildings: [] };
    const buildings = cityData.buildings || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
            <CityInterface student={friend} buildings={buildings} readOnly />
        </div>
    );
}
