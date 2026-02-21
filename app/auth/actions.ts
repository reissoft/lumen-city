// app/auth/actions.ts

'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

    let user: any = null;
    let redirectPath = '';

    try {
        if (role === 'admin' || role === 'teacher') {
            user = await prisma.teacher.findUnique({ where: { email: username } });
            if (user && await bcrypt.compare(password, user.password)) {
                // Lógica de autorização explícita para admin
                if (role === 'admin' && user.isSchoolAdmin) {
                    cookies().set(ROLE_COOKIE_NAME, 'admin');
                    redirectPath = '/admin'; 
                } 
                // Lógica para professor comum
                else if (role === 'teacher' && !user.isSchoolAdmin) {
                    cookies().set(ROLE_COOKIE_NAME, 'teacher');
                    redirectPath = '/teacher';
                } 
                // Se tentou logar como admin mas não é, ou como professor mas é admin
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

        // Se a autenticação foi bem-sucedida, define o cookie da sessão
        cookies().set(SESSION_COOKIE_NAME, username);

    } catch (error) {
        console.error(error);
        return { message: 'Ocorreu um erro no servidor.' };
    }

    // Se o login foi bem-sucedido, redireciona para o painel apropriado
    redirect(redirectPath);
}

export async function logout() {
    cookies().delete(SESSION_COOKIE_NAME);
    cookies().delete(ROLE_COOKIE_NAME);
    redirect('/login');
}
