'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendEmail, sendWhatsApp } from '@/lib/utils';

const prisma = new PrismaClient();
const SESSION_COOKIE_NAME = 'lumen_session';
const ROLE_COOKIE_NAME = 'lumen_role';

// --- FUNÇÃO DE LOGIN (EXISTENTE E SEM ALTERAÇÃO) ---
export async function login(prevState: { message: string }, formData: FormData) {
    const role = formData.get('role') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!role || !username || !password) {
        return { message: 'Todos os campos são obrigatórios.' };
    }

    let user: any = null;
    let redirectPath = '';

    try {
        if (role === 'admin' || role === 'teacher') {
            user = await prisma.teacher.findUnique({ where: { email: username } });
            if (user && await bcrypt.compare(password, user.password)) {
                if (role === 'admin' && user.isSchoolAdmin) {
                    cookies().set(ROLE_COOKIE_NAME, 'admin');
                    redirectPath = '/admin'; 
                } 
                else if (role === 'teacher' && !user.isSchoolAdmin) {
                    cookies().set(ROLE_COOKIE_NAME, 'teacher');
                    redirectPath = '/teacher';
                } 
                else {
                    return { message: 'Papel selecionado inválido para este usuário.' };
                }
            } else {
                return { message: 'Credenciais inválidas.' };
            }
        } else if (role === 'student') {
            user = await prisma.student.findUnique({ where: { username: username } });
            if (user && await bcrypt.compare(password, user.password)) {
                cookies().set(ROLE_COOKIE_NAME, 'student');
                redirectPath = '/student';
            } else {
                return { message: 'Credenciais inválidas.' };
            }
        } else {
            return { message: 'Papel inválido selecionado.' };
        }

        cookies().set(SESSION_COOKIE_NAME, username);

    } catch (error) {
        console.error(error);
        return { message: 'Ocorreu um erro no servidor.' };
    }

    redirect(redirectPath);
}

// --- FUNÇÃO DE LOGOUT (EXISTENTE E SEM ALTERAÇÃO) ---
export async function logout() {
    cookies().delete(SESSION_COOKIE_NAME);
    cookies().delete(ROLE_COOKIE_NAME);
    redirect('/login');
}

// --- FUNÇÃO DE RECUPERAÇÃO DE ACESSO (CORRIGIDA E COMPLETA) ---
export async function recoverPassword(identifier: string) {
    const sanitizedIdentifier = identifier.trim();
    if (!sanitizedIdentifier) {
        return { error: 'Por favor, informe o identificador (usuário, e-mail ou telefone).' };
    }

    try {
        // 1. Tentar como Professor/Admin via E-mail
        const teacher = await prisma.teacher.findUnique({ where: { email: sanitizedIdentifier } });
        if (teacher) {
            const newPassword = Math.random().toString(36).slice(-8);
            await prisma.teacher.update({
                where: { id: teacher.id },
                data: { password: await bcrypt.hash(newPassword, 10) },
            });
            const emailBody = `<h1>Recuperação de Senha</h1><p>Olá, ${teacher.name}.</p><p>Sua senha foi redefinida. Use a senha temporária abaixo para acessar sua conta:</p><p style="font-size: 1.2rem; font-weight: bold;">${newPassword}</p><p>Recomendamos que você altere esta senha após o login.</p><p>Atenciosamente,<br>Equipe Lumen</p>`;
            await sendEmail(teacher.email, "Recuperação de Senha - Lumen", emailBody);
            return { success: `Uma nova senha foi enviada para o e-mail cadastrado.` };
        }

        // 2. Tentar como Aluno via Nome de Usuário
        const studentByUsername = await prisma.student.findUnique({ where: { username: sanitizedIdentifier } });
        if (studentByUsername) {
            if (!studentByUsername.guardianEmail && !studentByUsername.guardianPhone) {
                return { error: 'Este aluno não possui contatos de responsável para recuperação.' };
            }

            const newPassword = Math.random().toString(36).slice(-8);
            await prisma.student.update({ 
                where: { id: studentByUsername.id }, 
                data: { password: await bcrypt.hash(newPassword, 10) } 
            });

            const sentTo = [];
            if (studentByUsername.guardianEmail) {
                const emailBody = `<h1>Recuperação de Senha</h1><p>Olá, ${studentByUsername.guardianName || 'Responsável'}.</p><p>Dados de acesso para o(a) estudante ${studentByUsername.name}:</p><p>Usuário: <strong>${studentByUsername.username}</strong></p><p>Senha: <strong style="font-size: 1.2rem; font-weight: bold;">${newPassword}</strong></p><p>Atenciosamente,<br>Equipe Lumen</p>`;
                await sendEmail(studentByUsername.guardianEmail, `Recuperação de Senha - ${studentByUsername.name} | Lumen`, emailBody);
                sentTo.push('e-mail');
            }
            if (studentByUsername.guardianPhone) {
                const whatsappMessage = `Recuperação de Senha - Lumen\nOlá, ${studentByUsername.guardianName || 'Responsável'}.\nDados de acesso para o(a) estudante ${studentByUsername.name}:\n*Usuário:* ${studentByUsername.username}\n*Senha:* ${newPassword}`;
                await sendWhatsApp(studentByUsername.guardianPhone, whatsappMessage);
                sentTo.push('WhatsApp');
            }
            return { success: `Nova senha enviada para o ${sentTo.join(' e ')} do responsável.` };
        }

        // 3. Tentar via E-mail do Responsável
        const studentsByGuardianEmail = await prisma.student.findMany({ where: { guardianEmail: sanitizedIdentifier } });
        if (studentsByGuardianEmail.length > 0) {
            for (const student of studentsByGuardianEmail) {
                const newPassword = Math.random().toString(36).slice(-8);
                await prisma.student.update({ 
                    where: { id: student.id }, 
                    data: { password: await bcrypt.hash(newPassword, 10) } 
                });
                const emailBody = `<h1>Recuperação de Acesso</h1><p>Olá, ${student.guardianName || 'Responsável'}.</p><p>Recebemos uma solicitação para recuperar o acesso. Seguem os dados para o(a) estudante <strong>${student.name}</strong>:</p><p>Usuário: <strong>${student.username}</strong></p><p>Nova Senha: <strong style="font-size: 1.2rem;">${newPassword}</strong></p><hr style="margin: 1rem 0;"/>`;
                await sendEmail(student.guardianEmail!, `Dados de Acesso - ${student.name} | Lumen`, emailBody);
            }
            return { success: `Os dados de acesso dos alunos vinculados a este e-mail foram enviados.` };
        }

        // 4. Tentar via Telefone do Responsável (removendo não-numéricos)
        const numericIdentifier = sanitizedIdentifier.replace(/\D/g, '');
        if (numericIdentifier.length > 9) { // Checagem básica de telefone
            const studentsByGuardianPhone = await prisma.student.findMany({ where: { guardianPhone: numericIdentifier } });
            if (studentsByGuardianPhone.length > 0) {
                for (const student of studentsByGuardianPhone) {
                    const newPassword = Math.random().toString(36).slice(-8);
                    await prisma.student.update({ 
                        where: { id: student.id }, 
                        data: { password: await bcrypt.hash(newPassword, 10) } 
                    });
                    const whatsappMessage = `Recuperação de Acesso - Lumen\nOlá, ${student.guardianName || 'Responsável'}.\nDados para o(a) estudante *${student.name}*:\n*Usuário:* ${student.username}\n*Nova Senha:* ${newPassword}`;
                    await sendWhatsApp(student.guardianPhone!, whatsappMessage);
                }
                return { success: `Os dados de acesso dos alunos vinculados a este telefone foram enviados via WhatsApp.` };
            }
        }

        return { error: 'Nenhum usuário ou responsável encontrado com este identificador.' };

    } catch (error) {
        console.error("Erro na recuperação de senha:", error);
        return { error: 'Ocorreu um erro no servidor. Tente novamente.' };
    }
}
