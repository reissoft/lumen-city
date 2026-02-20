// app/admin/classes/actions.ts

'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

type FormState = { error?: string | null; success?: string | null; };

async function getAdminUser() {
    const cookieStore = cookies();
    const sessionEmail = cookieStore.get('lumen_session')?.value;
    if (!sessionEmail) return null;

    const user = await prisma.teacher.findUnique({
        where: { email: sessionEmail },
        select: { isSchoolAdmin: true, schoolId: true },
    });

    if (user?.isSchoolAdmin && user.schoolId) {
        return user;
    }
    return null;
}

export async function createClass(prevState: FormState, formData: FormData): Promise<FormState> {
    const admin = await getAdminUser();
    if (!admin) {
        return { error: 'Não autorizado: você precisa ser um administrador.' };
    }

    const name = formData.get('name') as string;
    const teacherIds = formData.getAll('teacherIds') as string[];

    if (!name || teacherIds.length === 0) {
        return { error: 'Nome da turma e pelo menos um professor são obrigatórios.' };
    }

    try {
        await prisma.class.create({
            data: {
                name: name,
                schoolId: admin.schoolId,
                teachers: {
                    connect: teacherIds.map(id => ({ id }))
                }
            },
        });

        revalidatePath('/admin/classes');
        return { success: 'Turma criada com sucesso!' };

    } catch (error) {
        console.error(error);
        return { error: 'Não foi possível criar a turma.' };
    }
}

export async function updateClass(prevState: FormState, formData: FormData): Promise<FormState> {
    const admin = await getAdminUser();
    if (!admin) {
        return { error: 'Não autorizado.' };
    }

    const classId = formData.get('classId') as string;
    const name = formData.get('name') as string;
    const newTeacherIds = formData.getAll('teacherIds') as string[];

    if (!classId || !name || newTeacherIds.length === 0) {
        return { error: 'Nome da turma e ao menos um professor são necessários.' };
    }

    try {
        const classToUpdate = await prisma.class.findFirst({
            where: { id: classId, schoolId: admin.schoolId },
            include: { teachers: { select: { id: true } } },
        });

        if (!classToUpdate) {
            return { error: 'Turma não encontrada ou você não tem permissão para editá-la.' };
        }

        const currentTeacherIds = classToUpdate.teachers.map(t => t.id);

        const teachersToConnect = newTeacherIds.filter(id => !currentTeacherIds.includes(id));
        const teachersToDisconnect = currentTeacherIds.filter(id => !newTeacherIds.includes(id));

        await prisma.class.update({
            where: { id: classId },
            data: {
                name: name,
                teachers: {
                    connect: teachersToConnect.map(id => ({ id })),
                    disconnect: teachersToDisconnect.map(id => ({ id }))
                }
            },
        });

        revalidatePath('/admin/classes');
        revalidatePath(`/admin/classes/${classId}`);
        return { success: 'Turma atualizada com sucesso!' };

    } catch (error) {
        console.error(error);
        return { error: 'Não foi possível atualizar a turma.' };
    }
}

export async function deleteClass(id: string) {
    const admin = await getAdminUser();
    if (!admin) {
        throw new Error('Unauthorized');
    }

    const classToDelete = await prisma.class.findFirst({
        where: { id: id, schoolId: admin.schoolId },
    });

    if (!classToDelete) {
        throw new Error('Turma não encontrada ou você não tem permissão para deletá-la.');
    }

    await prisma.class.delete({ where: { id } });
    revalidatePath('/admin/classes');
}
