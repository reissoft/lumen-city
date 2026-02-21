// app/admin/classes/page.tsx

import { PrismaClient, Student } from '@prisma/client';
import AdminClassesPageClient from './client-page';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

async function getClasses(schoolId: string) {
    return await prisma.class.findMany({
        where: { 
            schoolId: schoolId
        },
        include: {
            teachers: true,
            // Modificação: Em vez de contar, agora incluímos os dados dos alunos
            students: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

async function getTeachers(schoolId: string) {
    return await prisma.teacher.findMany({
        where: { schoolId: schoolId },
        orderBy: {
            name: 'asc',
        },
    });
}

export default async function AdminClassesPage() {
    const cookieStore = cookies();
    const sessionEmail = cookieStore.get('lumen_session')?.value;
    
    if (!sessionEmail) {
        redirect('/login');
    }

    const user = await prisma.teacher.findUnique({
        where: { email: sessionEmail },
        select: { isSchoolAdmin: true, schoolId: true },
    });

    if (!user?.isSchoolAdmin || !user.schoolId) {
        redirect('/login');
    }

    const classes = await getClasses(user.schoolId);
    const teachers = await getTeachers(user.schoolId);

    return <AdminClassesPageClient classes={classes} teachers={teachers} />;
}
