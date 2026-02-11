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
import Link from "next/link" // <--- CORREÇÃO 1: Import oficial

const prisma = new PrismaClient()

async function getActivities() {
  // Adicionei um fallback caso o seed não tenha rodado ou o email esteja diferente
  const teacher = await prisma.teacher.findFirst({ 
    where: { email: 'admin@reissoft.com' } 
  })
  
  if (!teacher) return []
  
  return await prisma.activity.findMany({
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

          {/* O MODAL DE CRIAÇÃO COM IA */}
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
                {/* CORREÇÃO 2: O Botão DEVE ficar DENTRO do Link */}
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