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

    // Pega os detalhes da turma e os alunos que já estão nela
    const classData = await prisma.class.findUnique({
        where: { id: classId, teacherId: teacher.id },
        include: {
            students: { orderBy: { name: 'asc' } }
        }
    });

    if (!classData) redirect("/teacher/classes");

    // Pega todos os alunos da escola que NÃO estão na turma atual
    const studentsInClassIds = classData.students.map(student => student.id);
    const availableStudents = await prisma.student.findMany({
        where: {
            schoolId: teacher.schoolId,
            id: { notIn: studentsInClassIds },
            classes: {
                none: {}
            }
        },
        orderBy: { name: 'asc' }
    });

    return { classData, availableStudents };
}

// Tipagem para os dados
export type PageData = NonNullable<Awaited<ReturnType<typeof getData>>>;

export default async function ClassDetailsPage({ params }: { params: { id: string } }) {
    const { classData, availableStudents } = await getData(params.id);

    return <ClassDetailsClient classData={classData} availableStudents={availableStudents} />;
}
