
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
    
    // Dados do formulário atualizado
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const email = formData.get("email") as string || null;
    const guardianEmail = formData.get("guardianEmail") as string || null;
    const guardianPhone = formData.get("guardianPhone") as string || null;

    if (!classId || !name || !username || !password) {
        return { error: "Nome, usuário e senha são obrigatórios." };
    }

    try {
        const classExists = await prisma.class.findFirst({ where: { id: classId, teacherId: teacher.id } });
        if (!classExists) return { error: "Turma não encontrada." };

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.student.create({
            data: {
                name,
                username,
                password: hashedPassword,
                email,
                guardianEmail,
                guardianPhone,
                schoolId: teacher.schoolId, // Associa à escola do professor
                classes: { connect: { id: classId } }, // Associa diretamente à turma
            },
        });

        revalidatePath(`/teacher/classes/${classId}`);
        return { success: "Aluno criado e adicionado à turma!" };

    } catch (error: any) {
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0];
            if (field === 'username') {
                return { error: "Este nome de usuário já está em uso." };
            }
            if (field === 'email' && email) { // Apenas se um email foi fornecido
                return { error: "Um aluno com este email já existe." };
            }
        }
        console.error("Erro ao adicionar aluno à turma:", error);
        return { error: "Ocorreu um erro inesperado ao criar o aluno." };
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
