// app/student/city/page.tsx

import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import CityInterface from "@/components/CityInterface"
import VirtualFriend from "@/components/VirtualFriend"

const prisma = new PrismaClient()

async function getStudentData() {
    const sessionUsername = cookies().get('lumen_session')?.value;
    const userRole = cookies().get('lumen_role')?.value;

    if (!sessionUsername || userRole !== 'student') {
        redirect('/login');
    }

  return await prisma.student.findUnique({
    where: { username: sessionUsername },
    include: { resources: true }
  })
}

export default async function CityPage() {
  const student = await getStudentData()
  if (!student) return <div>Erro ao carregar perfil.</div>

  const cityData = (student.cityData as any) || { buildings: [] }
  const buildings = cityData.buildings || []

  // Conecta o Backend (Server) com o Frontend Interativo (Client)
  return (
    <div className="relative">
      <CityInterface student={student} buildings={buildings} />
      <VirtualFriend studentName={student.name} />
    </div>
  )
}