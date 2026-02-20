
'use server'
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function createStudent(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string | null;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const guardianEmail = formData.get('guardianEmail') as string | null;
  const guardianPhone = formData.get('guardianPhone') as string | null;

  // 1. Obter o professor logado para associar o aluno à escola correta
  const teacherEmail = cookies().get('lumen_session')?.value;
  if (!teacherEmail) {
    // Lidar com o caso de professor não logado
    throw new Error('Professor não autenticado.');
  }

  const teacher = await prisma.teacher.findUnique({
    where: { email: teacherEmail },
    select: { schoolId: true },
  });

  if (!teacher) {
    throw new Error('Professor não encontrado.');
  }

  // 2. Criptografar a senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Criar o estudante no banco de dados
  try {
    await prisma.student.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        guardianEmail,
        guardianPhone,
        schoolId: teacher.schoolId, // Associar à escola do professor
        // Outros valores padrão (level, xp, etc.) serão aplicados pelo Prisma schema
      },
    });
  } catch (error: any) {
    // Tratar possíveis erros, como username ou email duplicado
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'username') {
        return redirect('/teacher/students?error=username_exists');
      } else if (field === 'email') {
        return redirect('/teacher/students?error=email_exists');
      }
    }
    // Outros erros
    throw error;
  }

  // 4. Revalidar a página para mostrar o novo aluno e redirecionar
  revalidatePath('/teacher/students');
  redirect('/teacher/students');
}
