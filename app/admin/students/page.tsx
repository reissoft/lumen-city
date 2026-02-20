
// app/admin/students/page.tsx (Server Component)

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { PrismaClient } from '@prisma/client'
import AdminStudentsPageClient from './students-client-page'

const prisma = new PrismaClient()

export default async function AdminStudentsPage() {
  const email = cookies().get("lumen_session")?.value
  if (!email) {
    redirect("/login")
  }

  const teacher = await prisma.teacher.findUnique({
    where: { email },
    select: { isSchoolAdmin: true, schoolId: true },
  })

  if (!teacher?.isSchoolAdmin || !teacher.schoolId) {
    redirect("/teacher") 
  }

  const students = await prisma.student.findMany({
    where: { schoolId: teacher.schoolId },
    include: {
        class: true // <<< MUDANÇA AQUI: de `classes` para `class`
    },
    orderBy: { createdAt: 'desc' },
  })

  // Busca todas as turmas da escola. A lógica de associação de turmas e escolas ainda precisa ser definida.
  // Por enquanto, vamos buscar todas as turmas existentes.
  const classes = await prisma.class.findMany({
      // where: { schoolId: teacher.schoolId }, // TODO: Adicionar schoolId ao modelo Class
      orderBy: { name: 'asc' }
  });

  return <AdminStudentsPageClient students={students} classes={classes} />
}
