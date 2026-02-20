
// app/admin/students/page.tsx (Server Component)

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { PrismaClient, Prisma } from '@prisma/client'
import AdminStudentsPageClient from './students-client-page' // Importando o client component

const prisma = new PrismaClient()

// A função da página é async, permitindo buscas de dados no servidor
export default async function AdminStudentsPage() {
  const email = cookies().get("lumen_session")?.value
  if (!email) {
    redirect("/login")
  }

  // Validação de permissão do administrador
  const teacher = await prisma.teacher.findUnique({
    where: { email },
    select: { isSchoolAdmin: true, schoolId: true },
  })

  if (!teacher?.isSchoolAdmin || !teacher.schoolId) {
    redirect("/teacher") 
  }

  // Busca os alunos da escola do administrador, incluindo as turmas
  const students = await prisma.student.findMany({
    where: { schoolId: teacher.schoolId },
    include: {
        classes: true
    },
    orderBy: { createdAt: 'desc' },
  })

  // Busca todas as turmas da escola para usar no filtro
  const classes = await prisma.class.findMany({
      where: { teacher: { schoolId: teacher.schoolId } },
      orderBy: { name: 'asc' }
  });

  // Renderiza o Client Component, passando alunos e turmas como props
  return <AdminStudentsPageClient students={students} classes={classes} />
}
