import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import CityInterface from "@/components/CityInterface" 

const prisma = new PrismaClient()

async function getStudentData() {
  const email = (await cookies()).get("lumen_session")?.value
  if (!email) redirect("/login")

  return await prisma.student.findUnique({
    where: { email: email },
    include: { resources: true }
  })
}

export default async function CityPage() {
  const student = await getStudentData()
  if (!student) return <div>Erro ao carregar perfil.</div>

  const cityData = (student.cityData as any) || { buildings: [] }
  const buildings = cityData.buildings || []

  // Conecta o Backend (Server) com o Frontend Interativo (Client)
  return <CityInterface student={student} buildings={buildings} />
}