'use server'
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function login(formData: FormData) {
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string
  const cookieStore = cookies()
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

  if (!identifier || !password) {
    redirect("/login?error=campos_vazios")
  }

  const cookieOptions = { 
    expires, 
    httpOnly: true, 
    path: '/',
    secure: true, 
    sameSite: 'none' as const
  };

  // Se o identificador contém "@", é um professor
  if (identifier.includes('@')) {
    const teacher = await prisma.teacher.findUnique({ where: { email: identifier } })
    
    if (teacher) {
      const isPasswordValid = await bcrypt.compare(password, teacher.password)
      if (isPasswordValid) {
        cookieStore.set("lumen_session", teacher.email, cookieOptions)
        cookieStore.set("lumen_role", 'teacher', cookieOptions)
        redirect("/teacher")
      }
    }
  } 
  // Caso contrário, é um aluno fazendo login com username
  else {
    const student = await prisma.student.findUnique({ where: { username: identifier } })
    
    if (student) {
      const isPasswordValid = await bcrypt.compare(password, student.password)
      if (isPasswordValid) {
        cookieStore.set("lumen_session", student.username, cookieOptions) // Salva o USERNAME na sessão
        cookieStore.set("lumen_role", 'student', cookieOptions)
        redirect("/student")
      }
    }
  }

  // Se chegou até aqui, o usuário não foi encontrado ou a senha estava errada.
  redirect("/login?error=credenciais_invalidas")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("lumen_session")
  cookieStore.delete("lumen_role")
  redirect("/login")
}
