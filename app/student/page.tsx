// app/student/page.tsx
import { PrismaClient, Activity } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Map, Trophy, Star, LogOut, BookOpen } from "lucide-react"
import Image from "next/image"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { logout } from "../auth/actions"

const prisma = new PrismaClient()

async function getStudentData() {
    const email = (await cookies()).get("lumen_session")?.value
    if (!email) redirect("/login")

    const student = await prisma.student.findUnique({
        where: { email: email },
        include: { resources: true }
    });

    // Usamos o tipo 'Activity' padrão do Prisma, que já é correto.
    const activities: Activity[] = await prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    return { student, activities };
}

export default async function StudentHub() {
  const { student, activities } = await getStudentData()
  
  if (!student) return <div>Erro no perfil.</div>

  const xpForNextLevel = 100;
  const currentLevelProgress = (student.xp % xpForNextLevel);
  const progressPercent = (currentLevelProgress / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">🦸‍♂️</div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Olá, {student.name}!</h1>
              <div className="flex items-center gap-2 text-slate-500">
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">Nível {student.level}</Badge>
                <span>{student.xp} XP Total</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase"><span>Progresso para Nível {student.level + 1}</span><span>{currentLevelProgress} / {xpForNextLevel} XP</span></div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <form action={logout}><Button variant="outline" size="sm" className="gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"><LogOut size={16} /> Sair</Button></form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/student/city" className="group"><Card className="h-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden"><div className="absolute top-0 right-0 p-10 opacity-10"><Map size={120} /></div><CardHeader><CardTitle className="flex items-center gap-2 text-2xl"><Map /> Minha Cidade</CardTitle></CardHeader><CardContent><p className="text-indigo-100 mb-6">Gerencie seus prédios, colete recursos e expanda seu império.</p><Button variant="secondary" className="w-full font-bold text-indigo-700">Entrar na Cidade</Button></CardContent></Card></Link>
          <Card className="bg-white hover:shadow-md transition-shadow"><CardHeader><CardTitle className="flex items-center gap-2 text-slate-800"><Trophy className="text-yellow-500" /> Ranking da Turma</CardTitle></CardHeader><CardContent><div className="space-y-4">{[1, 2, 3].map((pos) => (<div key={pos} className="flex items-center justify-between border-b pb-2 last:border-0"><div className="flex items-center gap-3"><span className={`font-bold w-6 ${pos === 1 ? 'text-yellow-500' : 'text-slate-400'}`}>#{pos}</span><span className="text-sm font-medium">Aluno Exemplo {pos}</span></div><span className="text-xs font-bold text-slate-400">{1500 - (pos * 100)} XP</span></div>))}
              </div></CardContent></Card>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Star className="text-orange-500" fill="currentColor" /> Missões Disponíveis</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {activities.map((activity) => {
              // A verificação abaixo é segura, pois `reviewMaterials` é do tipo `JsonValue`.
              const hasReviewMaterials = activity.reviewMaterials && Array.isArray(activity.reviewMaterials) && activity.reviewMaterials.length > 0;
              const activityPath = hasReviewMaterials ? `/student/activity/${activity.id}/review` : `/student/play/${activity.id}`;
              const buttonText = hasReviewMaterials ? "Revisar e Jogar" : "Jogar";
              const ButtonIcon = hasReviewMaterials ? BookOpen : Play;

              return (
                <Card key={activity.id} className="hover:border-indigo-300 transition-colors flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between"><Badge variant="outline" className="text-xs">{activity.type}</Badge><span className="text-xs text-slate-400">Dif. {activity.difficulty}</span></div>
                    <CardTitle className="text-lg mt-2 line-clamp-1">{activity.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10 flex-grow">{activity.description}</p>
                    <Link href={activityPath} className="mt-auto">
                      <Button className={`w-full gap-2 ${hasReviewMaterials ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                        <ButtonIcon size={16} /> {buttonText}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
