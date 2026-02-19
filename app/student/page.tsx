// app/student/page.tsx
import { PrismaClient, Activity } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Map as MapIcon, Trophy, Star, LogOut, BookOpen } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { logout } from "../auth/actions"

const prisma = new PrismaClient()

const getTotalXpForLevelStart = (level: number): number => {
    if (level <= 1) return 0;
    const n = level - 1;
    const a1 = 100;
    const an = n * 100;
    return (n * (a1 + an)) / 2;
};

const getCorrectLevelFromXp = (xp: number): number => {
    if (xp < 100) return 1;
    const level = Math.floor(0.5 + 0.1 * Math.sqrt(25 + 2 * xp));
    return level;
};

async function getStudentData() {
    const email = (await cookies()).get("lumen_session")?.value;
    if (!email) redirect("/login");

    const student = await prisma.student.findUnique({
        where: { email: email },
        include: { 
            resources: true,
            classes: true,
        }
    });

    if (!student) {
        return { student: null, activities: [], attemptsMap: new Map(), ranking: [] };
    }

    const studentClassIds = student.classes.map(c => c.id);

    let ranking = [];
    if (studentClassIds.length > 0) {
        ranking = await prisma.student.findMany({
            where: {
                classes: {
                    some: { id: { in: studentClassIds } },
                },
            },
            orderBy: { xp: 'desc' },
            select: { id: true, name: true, xp: true, },
            take: 10,
        });
    }

    const activityAttempts = await prisma.activityAttempt.findMany({
        where: { studentId: student.id },
    });
    
    let activities: Activity[] = [];
    if (studentClassIds.length > 0) {
        activities = await prisma.activity.findMany({
            where: {
                classes: {
                    some: { id: { in: studentClassIds } }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    
    const attemptsMap = new Map<string, number>();
    activityAttempts.forEach(attempt => {
        const existingScore = attemptsMap.get(attempt.activityId) || 0;
        if (attempt.score > existingScore) {
            attemptsMap.set(attempt.activityId, attempt.score);
        }
    });

    return { student, activities, attemptsMap, ranking };
}

export default async function StudentHub() {
  const { student, activities, attemptsMap, ranking } = await getStudentData()
  
  if (!student) return <div>Erro no perfil.</div>

  const correctLevel = getCorrectLevelFromXp(student.xp);
  const xpForCurrentLevelStart = getTotalXpForLevelStart(correctLevel);
  const xpForNextLevelStart = getTotalXpForLevelStart(correctLevel + 1);
  const xpNeededForThisLevel = xpForNextLevelStart - xpForCurrentLevelStart;
  const currentLevelProgress = student.xp - xpForCurrentLevelStart;
  const progressPercent = xpNeededForThisLevel > 0 ? (currentLevelProgress / xpNeededForThisLevel) * 100 : 100;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">🦸‍♂️</div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Olá, {student.name}!</h1>
              <div className="flex items-center gap-2 text-slate-500">
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">Nível {correctLevel}</Badge>
                <span>{student.xp} XP Total</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase"><span>Progresso para Nível {correctLevel + 1}</span><span>{currentLevelProgress} / {xpNeededForThisLevel} XP</span></div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <form action={logout}><Button variant="outline" size="sm" className="gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"><LogOut size={16} /> Sair</Button></form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/student/city" className="group"><Card className="h-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden"><div className="absolute top-0 right-0 p-10 opacity-10"><MapIcon size={120} /></div><CardHeader><CardTitle className="flex items-center gap-2 text-2xl"><MapIcon /> Minha Cidade</CardTitle></CardHeader><CardContent><p className="text-indigo-100 mb-6">Gerencie seus prédios, colete recursos e expanda seu império.</p><Button variant="secondary" className="w-full font-bold text-indigo-700">Entrar na Cidade</Button></CardContent></Card></Link>
          
          {/* --- CARD DO RANKING COM ESTILO INLINE --- */}
          <Card className="bg-white hover:shadow-md transition-shadow"><CardHeader><CardTitle className="flex items-center gap-2 text-slate-800"><Trophy className="text-yellow-500" /> Ranking da Turma</CardTitle></CardHeader><CardContent><div className="space-y-3">
            {ranking.length > 0 ? (
              ranking.map((rankedStudent, index) => (
                <div key={rankedStudent.id} className={`flex items-center gap-3 text-sm border-b border-slate-100 pb-2 last:border-0 ${rankedStudent.id === student.id ? 'bg-indigo-50 p-1 -m-1 rounded-lg' : ''}`}>
                  <span className={`w-6 text-center font-bold ${index === 0 ? "text-yellow-500" : (index === 1 ? "text-slate-400" : (index === 2 ? "text-orange-400" : "text-slate-400"))}`}>#{index + 1}</span>
                  <span style={{ flex: '1 1 0%' }} className={`${rankedStudent.id === student.id ? 'font-bold' : ''}`}>{rankedStudent.name}</span>
                  <span className="text-slate-500 font-semibold">{rankedStudent.xp} XP</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">O ranking aparecerá quando outros alunos entrarem na turma.</p>
            )}
          </div></CardContent></Card>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Star className="text-orange-500" fill="currentColor" /> Missões Disponíveis</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {activities.length > 0 ? (
              activities.map((activity) => {
                const bestScore = attemptsMap.get(activity.id);
                const hasReviewMaterials = activity.reviewMaterials && Array.isArray(activity.reviewMaterials) && activity.reviewMaterials.length > 0;
                const activityPath = hasReviewMaterials ? `/student/activity/${activity.id}/review` : `/student/play/${activity.id}`;
                const buttonText = hasReviewMaterials ? "Revisar e Jogar" : "Jogar";
                const ButtonIcon = hasReviewMaterials ? BookOpen : Play;

                return (
                  <Card key={activity.id} className="hover:border-indigo-300 transition-colors flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                        {bestScore !== undefined && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 font-semibold flex items-center gap-1">
                            <Trophy size={12} className="text-green-600" />
                            {bestScore}%
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2 line-clamp-1">{activity.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10 flex-grow">{activity.description}</p>
                      <Link href={activityPath} className="mt-auto">
                        <Button className={`w-full gap-2 ${hasReviewMaterials ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 hover:bg-slate-800"}`}>
                          <ButtonIcon size={16} /> {buttonText}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-3 bg-white p-8 rounded-xl text-center text-slate-500 shadow-sm border border-slate-100">
                <p>Nenhuma atividade disponível para suas turmas no momento.</p>
                <p className="text-sm mt-2">Fale com seu professor para mais informações!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
