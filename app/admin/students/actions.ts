'use server'

import { PrismaClient, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const prisma = new PrismaClient()


// --- AÇÃO DE CRIAR ALUNO ---

export async function createStudent(prevState: any, formData: FormData) {
    const schema = z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        username: z.string().min(1, "Nome de usuário é obrigatório"),
        guardianName: z.string().optional(), // Novo campo
        guardianEmail: z.string().email("Email do responsável inválido").optional().or(z.literal('')),
        guardianPhone: z.string().optional(),
        notes: z.string().optional(), // Novo campo
    });

    const validatedFields = schema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten().fieldErrors);
        return { error: 'Dados inválidos. Verifique os campos.' };
    }
    
    const data = validatedFields.data;

    try {
        // TODO: Pegar o schoolId do professor logado
        await prisma.student.create({
            data: {
                ...data,
                password: Math.random().toString(36).substring(2, 8), // Senha provisória
                schoolId: "3822e1a2-cb34-4b10-815a-9359a117fefe",
            },
        });

        revalidatePath('/admin/students');
        return { success: 'Aluno criado com sucesso!' };

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002' && error.meta?.target === 'Student_username_key') {
                 return { error: 'Este nome de usuário já está em uso.' };
            }
             if (error.code === 'P2002' && error.meta?.target === 'Student_email_key') {
                 return { error: 'Este email já está em uso.' };
            }
        }

        return { error: 'Não foi possível criar o aluno.' };
    }
}


// --- AÇÃO DE DELETAR ALUNO ---

export async function deleteStudent(id: string) {
    try {
        await prisma.student.delete({ where: { id } })
        revalidatePath('/admin/students')
        return { success: "Aluno deletado com sucesso!" }
    } catch (error) {
        return { error: "Não foi possível deletar o aluno." }
    }
}

// --- AÇÃO DE ATUALIZAR ALUNO ---

export async function updateStudent(id: string, prevState: any, formData: FormData) {
    const schema = z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        username: z.string().min(1, "Nome de usuário é obrigatório"),
        guardianName: z.string().optional(), // Novo campo
        guardianEmail: z.string().email("Email do responsável inválido").optional().or(z.literal('')),
        guardianPhone: z.string().optional(),
        notes: z.string().optional(), // Novo campo
    });

    const validatedFields = schema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: 'Dados inválidos para atualização.' };
    }

    try {
        await prisma.student.update({
            where: { id },
            data: validatedFields.data,
        });

        revalidatePath('/admin/students');
        return { success: 'Aluno atualizado com sucesso!' };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002' && error.meta?.target === 'Student_username_key') {
                return { error: 'Este nome de usuário já está em uso.' };
            }
            if (error.code === 'P2002' && error.meta?.target === 'Student_guardianEmail_key') {
                return { error: 'Este email de responsável já está em uso.' };
            }
        }
        return { error: 'Não foi possível atualizar o aluno.' };
    }
}
