'use server';

import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

// Esquema de validação com Zod (agora incluindo o nome)
const updateProfileSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").optional().or(z.literal('')),
    email: z.string().email("Formato de e-mail inválido.").optional().or(z.literal('')),
    newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres.").optional().or(z.literal('')),
    currentPassword: z.string().min(1, "A senha atual é obrigatória para qualquer alteração."),
}).refine(data => data.name || data.email || data.newPassword, {
    message: "Você deve preencher pelo menos um campo para atualizar: nome, e-mail ou nova senha.",
    path: ["name"], // Ponto de erro principal se nenhum campo for preenchido
});

export async function updateProfile(prevState: any, formData: FormData) {
    const sessionEmail = cookies().get('lumen_session')?.value;
    if (!sessionEmail) {
        return { error: 'Usuário não autenticado. Por favor, faça login novamente.' };
    }

    const validatedFields = updateProfileSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        // Aplaina os erros para facilitar a exibição no formulário
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { name: newName, email: newEmail, newPassword, currentPassword } = validatedFields.data;

    try {
        const teacher = await prisma.teacher.findUnique({ where: { email: sessionEmail } });
        if (!teacher) {
            return { error: 'Professor não encontrado.' };
        }

        // 1. Verificar a senha atual é crucial para autorizar qualquer mudança
        const isPasswordCorrect = await bcrypt.compare(currentPassword, teacher.password);
        if (!isPasswordCorrect) {
            return { error: { currentPassword: ['Senha atual incorreta.'] } };
        }

        const dataToUpdate: { name?: string; email?: string; password?: string } = {};

        // 2. Preparar atualização de nome (se fornecido e diferente)
        if (newName && newName !== teacher.name) {
            dataToUpdate.name = newName;
        }

        // 3. Preparar atualização de e-mail (se fornecido e diferente)
        if (newEmail && newEmail !== teacher.email) {
            // Verifica se o novo e-mail já está em uso por outro professor
            const emailExists = await prisma.teacher.findUnique({ where: { email: newEmail } });
            if (emailExists) {
                return { error: { email: ['Este e-mail já está em uso por outra conta.'] } };
            }
            dataToUpdate.email = newEmail;
        }

        // 4. Preparar atualização de senha (se fornecida)
        if (newPassword) {
            dataToUpdate.password = await bcrypt.hash(newPassword, 10);
        }

        // 5. Executar a atualização no banco de dados se houver algo a mudar
        if (Object.keys(dataToUpdate).length > 0) {
            await prisma.teacher.update({
                where: { id: teacher.id },
                data: dataToUpdate,
            });
        } else {
            // Se nenhum dado novo foi fornecido, não há necessidade de erro, apenas informe.
            return { success: 'Nenhuma alteração detectada. Seu perfil não foi modificado.' };
        }

        // 6. Atualizar o cookie de sessão se o e-mail (que é a chave da sessão) foi alterado
        if (dataToUpdate.email) {
            cookies().set('lumen_session', dataToUpdate.email);
        }

        return { success: 'Perfil atualizado com sucesso!' };

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { error: 'Ocorreu um erro inesperado no servidor. Por favor, tente novamente.' };
    }
}
