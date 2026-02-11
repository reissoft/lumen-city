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
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { logout } from "../auth/actions"
import { LogOut, Users, CheckCircle2, TrendingUp, GraduationCap } from "lucide-react"

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
  const teacher = await getTeacherData()
  
  if (!teacher) return []
  
  return await prisma.activity.findMany({
    where: { teacherId: teacher.id }, 
    orderBy: { createdAt: 'desc' }
  })
}

export default async function TeacherDashboard() {
  const activities = await getActivities()

  // Analytics fixos para demo
  const stats = [
    { title: "Total de Alunos", value: "32", icon: Users, color: "text-blue-600" },
    { title: "Quizzes Realizados", value: "145", icon: CheckCircle2, color: "text-green-600" },
    { title: "Engajamento Médio", value: "87%", icon: TrendingUp, color: "text-purple-600" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      
      {/* Botão de Sair Flutuante */}
      <div className="absolute top-4 right-4">
        <form action={logout}>
          <Button variant="outline" size="sm" className="gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200">
            <LogOut size={16} /> Sair
          </Button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel do Mestre</h1>
            <p className="text-slate-500">Gerencie suas atividades e acompanhe o progresso.</p>
          </div>

          <div className="flex gap-3">
            {/* NOVO BOTÃO: MINHA TURMA */}
            <Link href="/teacher/students">
              <Button variant="outline" className="gap-2 bg-white hover:bg-slate-100 border-indigo-200 text-indigo-700">
                <GraduationCap size={18} /> Minha Turma
              </Button>
            </Link>

            {/* BOTÃO DE NOVA ATIVIDADE */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                  ✨ Nova Atividade
                </Button>
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
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <p className="text-xs text-slate-400 mt-1">+20.1% em relação ao mês passado</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lista de Atividades */}
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