// app/auth/actions.ts
'use server' // <--- ESSA LINHA É OBRIGATÓRIA NA PRIMEIRA LINHA

import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Preparar o Cookie Store (Next.js 15 exige await)
  const cookieStore = await cookies()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 dia

  // 1. Verificar se é Professor
  const teacher = await prisma.teacher.findUnique({ where: { email } })
  
  if (teacher) {
    if (teacher.password !== password) return { error: "Senha incorreta" }
    
    // Define cookies DIRETAMENTE aqui para não perder o contexto
    cookieStore.set("lumen_session", teacher.email, { expires, httpOnly: true })
    cookieStore.set("lumen_role", 'teacher', { expires, httpOnly: true })
    
    // Redireciona (isso deve ser a última coisa)
    redirect("/teacher")
  }

  // 2. Verificar se é Aluno
  const student = await prisma.student.findUnique({ where: { email } })
  
  if (student) {
    if (student.password !== password) return { error: "Senha incorreta" }
    
    // Define cookies DIRETAMENTE aqui
    cookieStore.set("lumen_session", student.email, { expires, httpOnly: true })
    cookieStore.set("lumen_role", 'student', { expires, httpOnly: true })
    
    redirect("/student")
  }

  return { error: "Usuário não encontrado" }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("lumen_session")
  cookieStore.delete("lumen_role")
  redirect("/login")
}