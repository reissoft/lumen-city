// app/admin/settings/actions.ts
"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const settingsSchema = z.object({
    schoolId: z.string(),
    schoolName: z.string().min(3, "O nome da escola deve ter pelo menos 3 caracteres."),
    adminId: z.string(),
    adminName: z.string().min(3, "O nome do administrador deve ter pelo menos 3 caracteres."),
    adminEmail: z.string().email("Formato de e-mail inválido."),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres.").optional(),
    confirmPassword: z.string().optional(),
})
.refine(data => {
    // Se um dos campos de senha for preenchido, todos devem ser
    if (data.currentPassword || data.newPassword || data.confirmPassword) {
        return !!data.currentPassword && !!data.newPassword && !!data.confirmPassword;
    }
    return true;
}, {
    message: "Preencha todos os campos de senha para alterá-la.",
    path: ["_form"],
})
.refine(data => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
});


export async function updateSettings(prevState: any, formData: FormData) {
    const validatedFields = settingsSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { 
        schoolId, schoolName, 
        adminId, adminName, adminEmail,
        currentPassword, newPassword 
    } = validatedFields.data;

    try {
        // Inicia a transação
        await prisma.$transaction(async (tx) => {
            // 1. Atualiza os dados da escola e do admin (exceto senha)
            await tx.school.update({
                where: { id: schoolId },
                data: { name: schoolName },
            });

            await tx.teacher.update({
                where: { id: adminId },
                data: {
                    name: adminName,
                    email: adminEmail,
                },
            });

            // 2. Se a senha estiver sendo alterada, faz a verificação e atualização
            if (currentPassword && newPassword) {
                const admin = await tx.teacher.findUnique({
                    where: { id: adminId }
                });

                if (!admin) {
                    throw new Error("Administrador não encontrado.");
                }

                const passwordMatches = await bcrypt.compare(currentPassword, admin.password);

                if (!passwordMatches) {
                   throw new Error("A senha atual está incorreta.");
                }

                const hashedPassword = await bcrypt.hash(newPassword, 10);

                await tx.teacher.update({
                    where: { id: adminId },
                    data: { password: hashedPassword },
                });
            }
        });

        revalidatePath("/admin/settings");
        return { success: true, errors: {} };

    } catch (error: any) {
        return { 
            success: false,
            errors: { _form: [error.message || "Ocorreu um erro ao salvar as configurações."] } 
        };
    }
}