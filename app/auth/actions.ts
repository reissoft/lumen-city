'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendEmail, sendWhatsApp } from '@/lib/utils';

const prisma = new PrismaClient();
const SESSION_COOKIE_NAME = 'lumen_session';
const ROLE_COOKIE_NAME = 'lumen_role';

export async function login(prevState: { message: string }, formData: FormData) {
    const role = formData.get('role') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!role || !username || !password) {
        return { message: 'Todos os campos são obrigatórios.' };
    }

    let redirectPath = '';

    try {
        if (role === 'admin' || role === 'teacher') {
            const user = await prisma.teacher.findUnique({ where: { email: username } });
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
                // Correção: Define o cookie de sessão com o email do professor/admin
                cookies().set(SESSION_COOKIE_NAME, user.email);
            } else {
                return { message: 'Credenciais inválidas.' };
            }
        } else if (role === 'student') {
            const user = await prisma.student.findUnique({ where: { username: username } });
            if (user && await bcrypt.compare(password, user.password)) {
                cookies().set(ROLE_COOKIE_NAME, 'student');
                // Correção: Define o cookie de sessão com o username do aluno
                cookies().set(SESSION_COOKIE_NAME, user.username);
                redirectPath = '/student';
            } else {
                return { message: 'Credenciais inválidas.' };
            }
        } else {
            return { message: 'Papel inválido selecionado.' };
        }
    } catch (error) {
        console.error(error);
        return { message: 'Ocorreu um erro no servidor.' };
    }

    redirect(redirectPath);
}

export async function logout() {
    cookies().delete(SESSION_COOKIE_NAME);
    cookies().delete(ROLE_COOKIE_NAME);
    redirect('/login');
}

export async function recoverPassword(identifier: string) {
    const sanitizedIdentifier = identifier.trim();
    if (!sanitizedIdentifier) {
        return { error: 'Por favor, informe o identificador (usuário, e-mail ou telefone).' };
    }

    try {
        let recoveryPerformed = false;
        const isEmail = sanitizedIdentifier.includes('@');

        if (isEmail) {
            const teacher = await prisma.teacher.findUnique({ where: { email: sanitizedIdentifier } });
            if (teacher) {
                recoveryPerformed = true;
                const newPassword = Math.random().toString(36).slice(-8);
                await prisma.teacher.update({
                    where: { id: teacher.id },
                    data: { password: await bcrypt.hash(newPassword, 10) },
                });
                const emailBody = `<h1>Recuperação de Senha</h1><p>Olá, ${teacher.name}.</p><p>Sua senha de professor/admin foi redefinida. Use a senha temporária abaixo para acessar sua conta:</p><p style="font-size: 1.2rem; font-weight: bold;">${newPassword}</p><hr style="margin: 1rem 0;"/>`;
                await sendEmail(teacher.email, "Recuperação de Senha de Professor - Lumen", emailBody);
            }

            const studentsByGuardianEmail = await prisma.student.findMany({ where: { guardianEmail: sanitizedIdentifier } });
            if (studentsByGuardianEmail.length > 0) {
                recoveryPerformed = true;
                for (const student of studentsByGuardianEmail) {
                    const newPassword = Math.random().toString(36).slice(-8);
                    await prisma.student.update({ 
                        where: { id: student.id }, 
                        data: { password: await bcrypt.hash(newPassword, 10) } 
                    });
                    const emailBody = `<h1>Recuperação de Acesso de Aluno</h1><p>Olá, ${student.guardianName || 'Responsável'}.</p><p>Recebemos uma solicitação para recuperar o acesso de um aluno vinculado a este e-mail. Seguem os dados para o(a) estudante <strong>${student.name}</strong>:</p><p>Usuário: <strong>${student.username}</strong></p><p>Nova Senha: <strong style="font-size: 1.2rem;">${newPassword}</strong></p><hr style="margin: 1rem 0;"/>`;
                    await sendEmail(student.guardianEmail!, `Dados de Acesso - ${student.name} | Lumen`, emailBody);
                }
            }
        }

        if (!isEmail) {
            const studentByUsername = await prisma.student.findUnique({ where: { username: sanitizedIdentifier } });
            if (studentByUsername) {
                recoveryPerformed = true;
                if (!studentByUsername.guardianEmail && !studentByUsername.guardianPhone) {
                    return { error: 'Este aluno não possui contatos de responsável para recuperação.' };
                }
                const newPassword = Math.random().toString(36).slice(-8);
                await prisma.student.update({ 
                    where: { id: studentByUsername.id }, 
                    data: { password: await bcrypt.hash(newPassword, 10) } 
                });
                const sentTo = [];
                if (studentByUsername.guardianEmail) { sentTo.push('e-mail'); }
                if (studentByUsername.guardianPhone) { sentTo.push('WhatsApp'); }
                return { success: `Nova senha para o aluno ${studentByUsername.username} foi enviada para o ${sentTo.join(' e ')} do responsável.` };
            }
        }

        const numericIdentifier = sanitizedIdentifier.replace(/\D/g, '');
        if (!isEmail && numericIdentifier.length > 9) {
            const studentsByGuardianPhone = await prisma.student.findMany({ where: { guardianPhone: numericIdentifier } });
            if (studentsByGuardianPhone.length > 0) {
                recoveryPerformed = true;
                for (const student of studentsByGuardianPhone) {
                   const newPassword = Math.random().toString(36).slice(-8);
                    await prisma.student.update({ 
                        where: { id: student.id }, 
                        data: { password: await bcrypt.hash(newPassword, 10) } 
                    });
                    const whatsappMessage = `Recuperação de Acesso - Lumen\nOlá, ${student.guardianName || 'Responsável'}.\nDados para o(a) estudante *${student.name}*:\n*Usuário:* ${student.username}\n*Nova Senha:* ${newPassword}`;
                    await sendWhatsApp(student.guardianPhone!, whatsappMessage);
                }
            }
        }
        
        if (recoveryPerformed) {
            return { success: 'Operação concluída. Se um ou mais contas foram encontradas, os dados de acesso foram enviados para os contatos associados.' };
        }

        return { error: 'Nenhum usuário, responsável ou aluno encontrado com este identificador.' };

    } catch (error) {
        console.error("Erro na recuperação de senha:", error);
        return { error: 'Ocorreu um erro no servidor. Tente novamente.' };
    }
}
