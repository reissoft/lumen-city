'use server'

import { PrismaClient, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

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
                isSchoolAdmin: false, // Professores criados por aqui nunca são administradores
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
        const schoolId = await getAdminSchoolId(); // Valida a permissão
        let hashedPassword: string | undefined = undefined;

        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        await prisma.teacher.update({
            where: { id, schoolId }, // Garante que o admin só pode editar professores da sua escola
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
            where: { id, schoolId } // Garante que o admin só pode deletar professores da sua escola
        });
        revalidatePath('/admin/teachers');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Não foi possível deletar o professor." };
    }
}
