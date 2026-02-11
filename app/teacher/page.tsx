// app/teacher/page.tsx
import { PrismaClient } from "@prisma/client"
import { generateQuiz } from "../actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import Link from "next/link"
// CORREÇÃO DAS IMPORTAÇÕES (Use os caminhos oficiais)
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { logout } from "../auth/actions" // Importe a ação
import { LogOut } from "lucide-react"    // Importe o ícone

const prisma = new PrismaClient()

async function getTeacherData() {
    const cookieStore = await cookies()
    const email = cookieStore.get("lumen_session")?.value
    
    if (!email) redirect("/login")

    return await prisma.teacher.findUnique({
      where: { email: email },
    })
}

async function getActivities() {
  // CORREÇÃO AQUI: Adicionado 'await' porque getTeacherData é assíncrona
  const teacher = await getTeacherData()
  
  if (!teacher) return []
  
  return await prisma.activity.findMany({
    // CORREÇÃO LINHA 40: Adicionado .id
    where: { teacherId: teacher.id }, 
    orderBy: { createdAt: 'desc' }
  })
}

export default async function TeacherDashboard() {
  const activities = await getActivities()

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel do Mestre</h1>
            <p className="text-slate-500">Gerencie suas atividades e acompanhe o progresso.</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">✨ Nova Atividade com IA</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Quiz com IA</DialogTitle>
                <DialogDescription>
                  Digite um tema e a IA criará perguntas, opções e respostas automaticamente.
                </DialogDescription>
              </DialogHeader>
              
              <form action={generateQuiz} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="topic" className="text-right">Tema</Label>
                  <Input id="topic" name="topic" placeholder="Ex: Fotossíntese, 2ª Guerra..." className="col-span-3" required />
                </div>
                <DialogFooter>
                  <Button type="submit">Gerar Mágica ✨</Button>
                </DialogFooter>
              </form>

            </DialogContent>
          </Dialog>
        </div>
<div className="absolute top-4 right-4">
  <form action={logout}>
    <Button variant="outline" size="sm" className="gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200">
      <LogOut size={16} /> Sair
    </Button>
  </form>
</div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2">{activity.type}</Badge>
                  <span className="text-xs text-slate-400">Nível {activity.difficulty}</span>
                </div>
                <CardTitle className="text-lg">{activity.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {activity.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/teacher/activity/${activity.id}`} className="w-full block">
                   <Button variant="secondary" className="w-full">Ver Detalhes</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}