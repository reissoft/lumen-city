'use server'

import { PrismaClient, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { sendEmail, sendWhatsApp } from '@/lib/utils'

const prisma = new PrismaClient()

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

const studentSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    username: z.string().min(1, "Nome de usuário é obrigatório"),
    guardianName: z.string().optional(),
    guardianEmail: z.string().email("Email do responsável inválido").optional().or(z.literal('')),
    guardianPhone: z.string().optional(),
    notes: z.string().optional(),
    classId: z.string().optional().or(z.literal('')),
});

// --- AÇÃO DE CRIAR ALUNO (MODIFICADA) ---
export async function createStudent(prevState: any, formData: FormData) {
    const validatedFields = studentSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: 'Dados inválidos. Verifique os campos.' };
    }
    
    const { classId, ...studentData } = validatedFields.data;

    try {
        const schoolId = await getAdminSchoolId();
        // 1. Gerar senha em texto plano
        const newPassword = Math.random().toString(36).substring(2, 8);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 2. Criar o aluno no banco
        const newStudent = await prisma.student.create({
            data: {
                ...studentData,
                password: hashedPassword,
                schoolId,
                classId: classId || null,
            },
        });

        // 3. Enviar notificações (se houver contato)
        try {
            if (newStudent.guardianEmail) {
                const emailBody = `<h1>Bem-vindo(a) à Lumen!</h1><p>Olá, ${newStudent.guardianName || 'Responsável'}.</p><p>Seu filho(a), ${newStudent.name}, foi cadastrado(a) em nossa plataforma. Seguem os dados para o primeiro acesso:</p><p>Usuário: <strong>${newStudent.username}</strong></p><p>Senha: <strong style="font-size: 1.2rem; font-weight: bold;">${newPassword}</strong></p><p>Recomendamos que você altere esta senha após o primeiro login.</p><p>Atenciosamente,<br>Equipe Lumen</p>`;
                await sendEmail(newStudent.guardianEmail, `Bem-vindo(a) à Lumen - Acesso de ${newStudent.name}`, emailBody);
            }
            if (newStudent.guardianPhone) {
                const whatsappMessage = `Bem-vindo(a) à Lumen!\nOlá, ${newStudent.guardianName || 'Responsável'}. O acesso para o(a) estudante ${newStudent.name} foi criado.\n\n*Usuário:* ${newStudent.username}\n*Senha:* ${newPassword}\n\nGuarde esses dados para acessar a plataforma.`;
                await sendWhatsApp(newStudent.guardianPhone, whatsappMessage);
            }
        } catch (notificationError) {
            console.error("Falha ao enviar notificação de boas-vindas:", notificationError);
            // Não retorna erro para o usuário, pois o aluno foi criado.
        }

        revalidatePath('/admin/students');
        return { success: 'Aluno criado com sucesso! Credenciais enviadas ao responsável.' };

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { error: 'Este nome de usuário já está em uso.' };
        }
        console.error("Erro ao criar aluno:", error);
        return { error: 'Não foi possível criar o aluno.' };
    }
}

// --- OUTRAS AÇÕES (SEM ALTERAÇÃO) ---
export async function updateStudent(id: string, prevState: any, formData: FormData) {
    const validatedFields = studentSchema.omit({ username: true }).safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return { error: 'Dados inválidos para atualização.' };
    const { classId, ...studentData } = validatedFields.data;
    try {
        const schoolId = await getAdminSchoolId();
        await prisma.student.update({
            where: { id, schoolId },
            data: { ...studentData, classId: classId || null },
        });
        revalidatePath('/admin/students');
        revalidatePath('/admin/classes');
        return { success: 'Aluno atualizado com sucesso!' };
    } catch (error) { return { error: 'Não foi possível atualizar o aluno.' }; }
}
export async function deleteStudent(id: string) {
    try {
        const schoolId = await getAdminSchoolId();
        await prisma.student.delete({ where: { id, schoolId } });
        revalidatePath('/admin/students');
        return { success: "Aluno deletado com sucesso!" };
    } catch (error) { return { error: "Não foi possível deletar o aluno." }; }
}
export async function toggleStudentActiveStatus(id: string, currentState: boolean) {
    try {
        const schoolId = await getAdminSchoolId();
        await prisma.student.update({ where: { id, schoolId }, data: { isActive: !currentState } });
        revalidatePath('/admin/students');
        return { success: `Aluno ${!currentState ? "ativado" : "desativado"} com sucesso!` };
    } catch (error) { return { error: "Não foi possível alterar o status do aluno." }; }
}
export async function resetAndSendNewPasswordViaEmail(studentId: string) {
    try {
        const schoolId = await getAdminSchoolId();
        const student = await prisma.student.findFirst({ where: { id: studentId, schoolId } });
        if (!student) throw new Error("Aluno não encontrado.");
        if (!student.guardianEmail) return { success: false, error: "Este aluno não possui um e-mail de responsável." };

        const newPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.student.update({ where: { id: student.id }, data: { password: hashedPassword } });
        
        const emailBody = `<h1>Acesso à plataforma Lumen</h1><p>Olá, ${student.guardianName || 'Responsável'}.</p><p>Os dados de acesso para o(a) estudante ${student.name} foram atualizados. Use a senha temporária abaixo para o primeiro login:</p><p>Usuário: <strong>${student.username}</strong></p><p>Senha: <strong style="font-size: 1.2rem; font-weight: bold;">${newPassword}</strong></p><p>Recomendamos que você altere esta senha após o login.</p><p>Atenciosamente,<br>Equipe Lumen</p>`;
        await sendEmail(student.guardianEmail, `Novos Dados de Acesso - ${student.name} | Lumen`, emailBody);
        return { success: true };
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Ocorreu um erro.";
        return { success: false, error: `Falha ao redefinir via e--mail: ${msg}` };
    }
}
export async function resetAndSendNewPasswordViaWhatsApp(studentId: string) {
    try {
        const schoolId = await getAdminSchoolId();
        const student = await prisma.student.findFirst({ where: { id: studentId, schoolId } });
        if (!student) throw new Error("Aluno não encontrado.");
        if (!student.guardianPhone) return { success: false, error: "Este aluno não possui um telefone de responsável." };

        const newPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.student.update({ where: { id: student.id }, data: { password: hashedPassword } });

        const message = `Olá, ${student.guardianName || 'Responsável'}. A senha de acesso para o(a) estudante ${student.name} na plataforma Lumen foi redefinida.\n\n*Usuário:* ${student.username}\n*Senha:* ${newPassword}\n\nAcesse a plataforma para fazer o login.`;
        
        await sendWhatsApp(student.guardianPhone, message);

        return { success: true };
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Ocorreu um erro.";
        return { success: false, error: `Falha ao enviar via WhatsApp: ${msg}` };
    }
}
