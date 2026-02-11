// app/teacher/activity/[id]/page.tsx
import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ArrowLeft, Trash2 } from "lucide-react"
import { deleteActivity } from "@/app/actions"

const prisma = new PrismaClient()

interface QuizPayload {
  questions: {
    text: string
    options: string[]
    correct: number
  }[]
}

// CORREÇÃO AQUI: params agora é Promise<{ id: string }>
export default async function ActivityDetail({ params }: { params: Promise<{ id: string }> }) {
  
  // CORREÇÃO AQUI: Fazemos o await antes de usar
  const { id } = await params

  const activity = await prisma.activity.findUnique({
    where: { id: id }
  })

  if (!activity) {
    return notFound()
  }

  const payload = activity.payload as unknown as QuizPayload

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center justify-between mb-6">
          <Link href="/teacher">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
          </Link>
          
          <form action={deleteActivity}>
             <input type="hidden" name="id" value={activity.id} />
             <Button variant="destructive" size="icon">
               <Trash2 className="w-4 h-4" />
             </Button>
          </form>
        </div>

        <div className="mb-8 space-y-2">
          <div className="flex gap-2 mb-2">
            <Badge>{activity.type}</Badge>
            <Badge variant="outline">Nível {activity.difficulty}</Badge>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">{activity.title}</h1>
          <p className="text-lg text-slate-600">{activity.description}</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">Gabarito & Perguntas</h2>
          
          {payload.questions?.map((q, index) => (
            <Card key={index} className="border-l-4 border-l-indigo-500">
              <CardHeader>
                <CardTitle className="text-lg flex gap-3">
                  <span className="bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  {q.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, optIndex) => {
                    const isCorrect = optIndex === q.correct
                    return (
                      <div 
                        key={optIndex}
                        className={`p-3 rounded-lg border text-sm flex items-center justify-between
                          ${isCorrect 
                            ? "bg-green-50 border-green-200 text-green-800 font-medium" 
                            : "bg-white border-slate-100 text-slate-600"
                          }
                        `}
                      >
                        {opt}
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}