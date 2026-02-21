
// app/admin/teachers/page.tsx (Server Component)

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { PrismaClient } from '@prisma/client'
import TeachersClientPage from './teachers-client-page'

const prisma = new PrismaClient()

export default async function AdminTeachersPage() {
  const email = cookies().get("lumen_session")?.value
  if (!email) {
    redirect("/login")
  }

  const admin = await prisma.teacher.findUnique({
    where: { email },
    select: { id: true, isSchoolAdmin: true, schoolId: true },
  })

  if (!admin?.isSchoolAdmin || !admin.schoolId) {
    // Se não for admin da escola, redireciona para a área do professor comum
    redirect("/teacher") 
  }

  // Busca todos os professores da mesma escola, exceto o admin logado
  const teachers = await prisma.teacher.findMany({
    where: { 
      schoolId: admin.schoolId,
      id: {
        not: admin.id
      }
    },
    orderBy: { name: 'asc' }, // CORRIGIDO: Ordenar por nome
  })

  return <TeachersClientPage teachers={teachers} />
}
