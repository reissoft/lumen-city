'use server';

import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

const updateStudentProfileSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").optional().or(z.literal('')),
    email: z.string().email("Formato de e-mail inválido.").optional().or(z.literal('')),
    newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres.").optional().or(z.literal('')),
    currentPassword: z.string().min(1, "A senha atual é obrigatória para qualquer alteração."),
}).refine(data => data.name || data.email || data.newPassword, {
    message: "Você deve preencher pelo menos um campo para atualizar: nome, e-mail ou nova senha.",
    path: ["name"], 
});

const updateVirtualFriendSchema = z.object({
    virtualFriendName: z.string().min(1, "O nome do amigo virtual é obrigatório.").max(50, "O nome deve ter no máximo 50 caracteres."),
    virtualFriendAvatar: z.string().min(1, "Você deve selecionar um avatar."),
});

export async function updateStudentProfile(prevState: any, formData: FormData) {
    const sessionUsername = cookies().get('lumen_session')?.value;
    if (!sessionUsername) {
        return { error: 'Aluno não autenticado. Por favor, faça login novamente.' };
    }

    const validatedFields = updateStudentProfileSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { name: newName, email: newEmail, newPassword, currentPassword } = validatedFields.data;

    try {
        const student = await prisma.student.findUnique({ where: { username: sessionUsername } });
        if (!student) {
            return { error: 'Aluno não encontrado.' };
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, student.password);
        if (!isPasswordCorrect) {
            return { error: { currentPassword: ['Senha atual incorreta.'] } };
        }

        const dataToUpdate: { name?: string; email?: string; password?: string } = {};

        if (newName && newName !== student.name) {
            dataToUpdate.name = newName;
        }

        // CORREÇÃO FINAL: A verificação de e-mail foi completamente removida.
        // O e-mail do aluno é um campo de contato e não precisa ser único no sistema.
        if (newEmail && newEmail !== student.email) {
            dataToUpdate.email = newEmail;
        }

        if (newPassword) {
            dataToUpdate.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(dataToUpdate).length > 0) {
            await prisma.student.update({
                where: { id: student.id },
                data: dataToUpdate,
            });
        } else {
            return { success: 'Nenhuma alteração detectada.' };
        }
        
        revalidatePath('/student/settings');
        return { success: 'Perfil atualizado com sucesso!' };

    } catch (error) {
        console.error('Erro ao atualizar perfil do aluno:', error);
        return { error: 'Ocorreu um erro no servidor. Tente novamente.' };
    }
}

export async function updateVirtualFriendSettings(prevState: any, formData: FormData) {
    const sessionUsername = cookies().get('lumen_session')?.value;
    if (!sessionUsername) {
        return { error: 'Aluno não autenticado. Por favor, faça login novamente.' };
    }

    const validatedFields = updateVirtualFriendSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { virtualFriendName, virtualFriendAvatar } = validatedFields.data;

    try {
        const student = await prisma.student.findUnique({ where: { username: sessionUsername } });
        if (!student) {
            return { error: 'Aluno não encontrado.' };
        }

        await prisma.student.update({
            where: { id: student.id },
            data: {
                virtualFriendName: virtualFriendName,
                virtualFriendAvatar: virtualFriendAvatar
            },
        });
        
        revalidatePath('/student/settings');
        return { success: 'Configurações do amigo virtual salvas com sucesso!' };

    } catch (error) {
        console.error('Erro ao atualizar configurações do amigo virtual:', error);
        return { error: 'Ocorreu um erro no servidor. Tente novamente.' };
    }
}
