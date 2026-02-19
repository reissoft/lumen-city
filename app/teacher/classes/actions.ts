// app/teacher/classes/actions.ts
"use server"

import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --- FUNÇÕES DE AUTENTICAÇÃO E SEGURANÇA ---

async function getTeacherFromSession() {
    const cookieStore = cookies();
    const email = cookieStore.get("lumen_session")?.value;
    if (!email) redirect("/login");

    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) redirect("/login");

    return teacher;
}

// --- AÇÕES RELACIONADAS A TURMAS ---

export async function createClass(prevState: any, formData: FormData) {
    const teacher = await getTeacherFromSession();
    const className = formData.get("name") as string;

    if (!className || className.trim() === "") {
        return { error: "O nome da turma não pode estar vazio." };
    }

    await prisma.class.create({
        data: {
            name: className,
            teacherId: teacher.id,
        },
    });

    revalidatePath("/teacher/classes");
    redirect("/teacher/classes");
}

// --- AÇÕES RELACIONADAS A ALUNOS NA TURMA ---

export async function addStudentToClass(prevState: any, formData: FormData) {
    const teacher = await getTeacherFromSession();
    const classId = formData.get("classId") as string;
    const name = formData.get("studentName") as string;
    const email = formData.get("studentEmail") as string;
    const password = formData.get("studentPassword") as string;

    if (!classId || !name || !email || !password) {
        return { error: "Todos os campos são obrigatórios." };
    }

    try {
        const classExists = await prisma.class.findFirst({ where: { id: classId, teacherId: teacher.id } });
        if (!classExists) return { error: "Turma não encontrada." };

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.student.create({
            data: {
                name,
                email,
                password: hashedPassword,
                schoolId: teacher.schoolId,
                classes: { connect: { id: classId } },
            },
        });

        revalidatePath(`/teacher/classes/${classId}`);
        return { success: "Aluno adicionado com sucesso!" };

    } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
             return { error: "Um aluno com este email já existe." };
        }
        console.error("Erro ao adicionar aluno:", error);
        return { error: "Ocorreu um erro inesperado." };
    }
}

export async function assignStudentToClass(prevState: any, formData: FormData) {
    const teacher = await getTeacherFromSession();
    const classId = formData.get("classId") as string;
    const studentId = formData.get("studentId") as string;

    if (!classId || !studentId) {
        return { error: "Por favor, selecione um aluno." };
    }

    try {
        const classExists = await prisma.class.findFirst({ where: { id: classId, teacherId: teacher.id } });
        if (!classExists) return { error: "Turma não encontrada." };

        const studentExists = await prisma.student.findFirst({ where: { id: studentId, schoolId: teacher.schoolId } });
        if (!studentExists) return { error: "Aluno não encontrado ou não pertence à sua escola." };

        await prisma.class.update({
            where: { id: classId, teacherId: teacher.id },
            data: { students: { connect: { id: studentId } } },
        });

        revalidatePath(`/teacher/classes/${classId}`);
        return { success: "Aluno adicionado à turma com sucesso." };

    } catch (error) {
        console.error("Erro ao designar aluno à turma:", error);
        return { error: "Ocorreu um erro inesperado." };
    }
}

export async function removeStudentFromClass(prevState: any, formData: FormData) {
    const teacher = await getTeacherFromSession();
    const classId = formData.get("classId") as string;
    const studentId = formData.get("studentId") as string;

    if (!classId || !studentId) {
        return { error: "IDs da turma e do aluno são necessários." };
    }

    try {
        await prisma.class.update({
            where: { id: classId, teacherId: teacher.id },
            data: { students: { disconnect: { id: studentId } } },
        });

        revalidatePath(`/teacher/classes/${classId}`);
        return { success: "Aluno removido da turma com sucesso." };

    } catch (error) {
        console.error("Erro ao remover aluno da turma:", error);
        return { error: "Ocorreu um erro inesperado." };
    }
}
