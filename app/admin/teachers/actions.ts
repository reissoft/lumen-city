'use server'

import { PrismaClient, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/utils'

const prisma = new PrismaClient()

// Esquema de validação para criação de professor
const createTeacherSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("Formato de e-mail inválido."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

// Esquema de validação para atualização de professor
const updateTeacherSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("Formato de e-mail inválido."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.").optional().or(z.literal('')),
});

async function getAdminSchoolId() {
    const email = cookies().get("lumen_session")?.value;
    if (!email) throw new Error("Administrador não autenticado.");

    const admin = await prisma.teacher.findUnique({
        where: { email },
        select: { schoolId: true, isSchoolAdmin: true },
    });

    if (!admin?.isSchoolAdmin || !admin.schoolId) {
        throw new Error("Acesso negado ou escola não encontrada.");
    }
    return admin.schoolId;
}

// --- AÇÃO DE CRIAR PROFESSOR ---
export async function createTeacher(prevState: any, formData: FormData) {
    const validatedFields = createTeacherSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { name, email, password } = validatedFields.data;

    try {
        const schoolId = await getAdminSchoolId();
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.teacher.create({
            data: {
                name,
                email,
                password: hashedPassword,
                schoolId,
                isSchoolAdmin: false,
            },
        });

        revalidatePath('/admin/teachers');
        return { success: true, errors: {} };

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { success: false, errors: { _form: ["Este e-mail já está em uso."] } };
        }
        return { success: false, errors: { _form: ["Não foi possível criar o professor."] } };
    }
}

// --- AÇÃO DE ATUALIZAR PROFESSOR ---
export async function updateTeacher(id: string, prevState: any, formData: FormData) {
    const validatedFields = updateTeacherSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { password, ...teacherData } = validatedFields.data;

    try {
        const schoolId = await getAdminSchoolId();
        let hashedPassword: string | undefined = undefined;

        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        await prisma.teacher.update({
            where: { id, schoolId },
            data: {
                ...teacherData,
                ...(hashedPassword && { password: hashedPassword }),
            },
        });

        revalidatePath('/admin/teachers');
        return { success: true, errors: {} };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { success: false, errors: { _form: ["Este e-mail já está em uso por outro usuário."] } };
        }
        return { success: false, errors: { _form: ["Não foi possível atualizar o professor."] } };
    }
}

// --- AÇÃO DE DELETAR PROFESSOR ---
export async function deleteTeacher(id: string) {
    try {
        const schoolId = await getAdminSchoolId();
        await prisma.teacher.delete({ 
            where: { id, schoolId }
        });
        revalidatePath('/admin/teachers');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Não foi possível deletar o professor." };
    }
}

// --- AÇÃO DE RESETAR E ENVIAR NOVA SENHA ---
export async function resetAndSendNewPassword(teacherId: string) {
    try {
        const schoolId = await getAdminSchoolId();
        const teacher = await prisma.teacher.findFirst({
            where: { id: teacherId, schoolId },
        });

        if (!teacher) {
            throw new Error("Professor não encontrado ou não pertence a esta escola.");
        }

        // 1. Gerar nova senha aleatória (8 caracteres)
        const newPassword = Math.random().toString(36).slice(-8);

        // 2. Criptografar a nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Atualizar o professor no banco de dados
        await prisma.teacher.update({
            where: { id: teacher.id },
            data: { password: hashedPassword },
        });
        
        // 4. Montar e enviar o e-mail
        const emailBody = `
            <h1>Recuperação de Senha</h1>
            <p>Olá, ${teacher.name}.</p>
            <p>Sua senha foi redefinida pelo administrador. Use a senha temporária abaixo para acessar sua conta:</p>
            <p style="font-size: 1.2rem; font-weight: bold; margin: 1rem 0;">${newPassword}</p>
            <p>Recomendamos que você altere esta senha após o primeiro login por uma de sua preferência.</p>
            <p>Atenciosamente,<br>Equipe Lumen</p>
        `;

        await sendEmail(teacher.email, "Sua Nova Senha de Acesso - Lumen", emailBody);

        return { success: true };

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        return { success: false, error: `Falha ao redefinir a senha: ${errorMessage}` };
    }
}
