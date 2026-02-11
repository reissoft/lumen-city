// app/student/page.tsx
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Map, Trophy, Star, LogOut, User } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { logout } from "@/app/auth/actions"


const prisma = new PrismaClient()

async function getStudentData() {
  const email = (await cookies()).get("lumen_session")?.value
  if (!email) redirect("/login")

  const student = await prisma.student.findUnique({
    where: { email: email },
    include: { resources: true }
  })
  
  if (!student) redirect("/login")

  // 1. Buscar Atividades Pendentes/Novas
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6
  })

  // 2. BUSCAR RANKING REAL (TOP 5)
  const leaderboard = await prisma.student.findMany({
    take: 5,
    orderBy: { xp: 'desc' },
    select: { id: true, name: true, xp: true, level: true }
  })

  return { student, activities, leaderboard }
}

export default async function StudentHub() {
  const { student, activities, leaderboard } = await getStudentData()
  
  // Lógica de Nível (Ex: Nível sobe a cada 1000 XP)
  // Fórmula simples: Nível = 1 + floor(XP / 1000)
  // Progresso da barra = (XP % 1000) / 10
  const xpPerLevel = 1000
  const currentLevelProgress = student.xp % xpPerLevel
  const progressPercent = (currentLevelProgress / xpPerLevel) * 100
  const nextLevelXp = (Math.floor(student.xp / xpPerLevel) + 1) * xpPerLevel

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      
      {/* Botão Sair Mobile/Desktop */}
      <div className="absolute top-4 right-4 z-10">
        <form action={logout}>
           <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50">
             <LogOut size={20} />
           </Button>
        </form>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 1. CABEÇALHO DO HERÓI */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          {/* Background decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none" />
          
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-lg">
              {/* Usa a inicial do nome como avatar */}
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Olá, {student.name.split(' ')[0]}!</h1>
              <div className="flex items-center gap-2 text-slate-500 mt-1">
                <Badge className="bg-indigo-600 hover:bg-indigo-700">Nível {Math.floor(student.xp / 1000) + 1}</Badge>
                <span className="text-sm font-medium">{student.xp} XP Total</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/3 space-y-2 mt-6 md:mt-0 relative z-10">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Próximo Nível</span>
              <span>{currentLevelProgress} / {xpPerLevel} XP</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-slate-100" />
            <p className="text-xs text-right text-slate-400">Faltam {xpPerLevel - currentLevelProgress} XP</p>
          </div>
        </div>

        {/* 2. MENU PRINCIPAL (GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARTÃO DA CIDADE (Destaque Maior) */}
          <Link href="/student/city" className="group md:col-span-2">
            <Card className="h-full bg-slate-900 text-white border-none hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer relative overflow-hidden">
              {/* Imagem de fundo ou gradiente */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900 opacity-90" />
              <Map className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-3xl">
                  🏙️ Minha Cidade
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-indigo-100 mb-8 max-w-md text-lg">
                  Você tem <span className="text-yellow-400 font-bold">{student.resources?.gold} Ouro</span> para gastar. 
                  Construa novos prédios e expanda seu território.
                </p>
                <Button className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8">
                  Entrar na Cidade
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* 🏆 RANKING REAL */}
          <Card className="bg-white hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
                <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Top Alunos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-2">
                {leaderboard.map((user, index) => {
                  const isMe = user.id === student.id
                  return (
                    <div 
                      key={user.id} 
                      className={`flex items-center justify-between p-2 rounded-lg transition-colors
                        ${isMe ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                            index === 1 ? 'bg-slate-200 text-slate-700' : 
                            index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-50 text-slate-400'}
                        `}>
                          #{index + 1}
                        </div>
                        <span className={`text-sm ${isMe ? 'font-bold text-indigo-700' : 'font-medium text-slate-700'}`}>
                          {isMe ? 'Você' : user.name.split(' ')[0]}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{user.xp} XP</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. MISSÕES (QUIZZES) */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Star className="text-orange-500 fill-orange-500" size={20} /> Missões Disponíveis
          </h2>
          
          {activities.length === 0 ? (
             <div className="text-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                Nenhuma missão disponível no momento. Aproveite para cuidar da sua cidade!
             </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {activities.map((activity) => (
                <Card key={activity.id} className="hover:border-indigo-300 transition-colors group cursor-pointer bg-white">
                  <Link href={`/student/play/${activity.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="bg-slate-50">{activity.type}</Badge>
                        <span className="text-xs font-mono text-slate-400">XP+++</span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">
                        {activity.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">
                        {activity.description}
                      </p>
                      <Button className="w-full bg-slate-100 text-slate-900 hover:bg-indigo-600 hover:text-white transition-all gap-2">
                        <Play size={16} fill="currentColor" /> Jogar Agora
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}