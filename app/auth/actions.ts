// app/auth/actions.ts
'use server'

import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Preparar o Cookie Store
  const cookieStore = await cookies()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 dia

  // 1. Verificar se é Professor
  const teacher = await prisma.teacher.findUnique({ where: { email } })
  
  if (teacher) {
    if (teacher.password !== password) {
        // CORREÇÃO: Redireciona em vez de retornar objeto
        redirect("/login?error=senha_incorreta") 
    }
    const cookieOptions = { 
      expires, 
      httpOnly: true, 
      path: '/',
      secure: true,             // Obrigatório para o IDX
      sameSite: 'none' as const // A mágica que permite o cookie no Iframe do IDX!
  };
    cookieStore.set("lumen_session", teacher.email, cookieOptions)
    cookieStore.set("lumen_role", 'teacher', cookieOptions)
    
    redirect("/teacher")
  }

  // 2. Verificar se é Aluno
  const student = await prisma.student.findUnique({ where: { email } })
  
  if (student) {
    if (student.password !== password) {
        // CORREÇÃO: Redireciona em vez de retornar objeto
        redirect("/login?error=senha_incorreta")
    }
    const cookieOptions = { 
      expires, 
      httpOnly: true, 
      path: '/',
      secure: true,             // Obrigatório para o IDX
      sameSite: 'none' as const // A mágica que permite o cookie no Iframe do IDX!
  };
    cookieStore.set("lumen_session", student.email, cookieOptions)
    cookieStore.set("lumen_role", 'student', cookieOptions)
    
    redirect("/student")
  }

  // Se não achou ninguém
  redirect("/login?error=usuario_nao_encontrado")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("lumen_session")
  cookieStore.delete("lumen_role")
  redirect("/login")
}