// app/teacher/classes/[id]/page.tsx
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClassDetailsClient from "./ClassDetailsClient";

const prisma = new PrismaClient();

async function getData(classId: string) {
    const cookieStore = cookies();
    const email = cookieStore.get("lumen_session")?.value;
    if (!email) redirect("/login");

    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) redirect("/login");

    // Lógica simplificada: apenas busca a turma e seus alunos
    const classData = await prisma.class.findFirst({
        where: { 
            id: classId, 
            teachers: { 
                some: { id: teacher.id } 
            }
        },
        include: {
            students: { 
                select: { id: true, name: true, username: true, xp: true },
                orderBy: { name: 'asc' } 
            }
        }
    });

    if (!classData) redirect("/teacher/classes");

    return { classData };
}

// A tipagem agora reflete apenas a classData
export type PageData = NonNullable<Awaited<ReturnType<typeof getData>>>;

export default async function ClassDetailsPage({ params }: { params: { id: string } }) {
    const { classData } = await getData(params.id);

    // Passamos apenas os dados da turma para o componente cliente
    return <ClassDetailsClient classData={classData} />;
}
