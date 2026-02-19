// app/teacher/activity/[id]/edit/page.tsx
"use client"

import { useState, useEffect, useTransition, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { getActivityById, updateQuiz } from "@/app/actions"
import { toast } from "sonner"

// Estruturas de dados
interface DbQuestion {
  text: string
  options: string[]
  correct: number
}

interface QuestionState {
  id: number
  text: string
  options: { id: number; text: string }[]
  correctAnswerId: number
}

function EditQuizPageContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<QuestionState[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, startTransition] = useTransition()

  useEffect(() => {
    if (searchParams.get("created") === "true") {
      toast.success("Atividade criada com sucesso!");
      // Remove o parâmetro da URL para não mostrar o toast novamente
      router.replace(`/teacher/`, { scroll: false });
    }

    if (!id) return

    getActivityById(id)
      .then((activity) => {
        if (activity) {
          setTitle(activity.title)
          setDescription(activity.description || "")
          const activityQuestions = (activity.payload as any)?.questions || []
          const formattedQuestions: QuestionState[] = activityQuestions.map((q: DbQuestion, index: number) => ({
            id: Date.now() + index,
            text: q.text,
            options: q.options.map((optText, optIndex) => ({ id: optIndex + 1, text: optText })),
            correctAnswerId: q.correct + 1,
          }));
          setQuestions(formattedQuestions)
        }
      })
      .catch(err => {
          console.error(err)
          toast.error("Não foi possível carregar a atividade.")
          router.push('/teacher')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, router, searchParams])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: "",
        options: [{ id: 1, text: "" }, { id: 2, text: "" }, { id: 3, text: "" }, { id: 4, text: "" }],
        correctAnswerId: 1,
      },
    ])
  }

  const removeQuestion = (questionId: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== questionId))
    }
  }

  const handleQuestionTextChange = (questionId: number, text: string) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, text } : q))
    )
  }

  const handleOptionChange = (questionId: number, optionId: number, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt) => opt.id === optionId ? { ...opt, text } : opt) }
          : q
      )
    )
  }

  const setCorrectAnswer = (questionId: number, optionId: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, correctAnswerId: optionId } : q
      )
    )
  }
  
  const handleSubmit = async () => {
    if (!title.trim()) {
        toast.warning("O título é obrigatório.");
        return;
    }

    const formattedQuestions = questions.map(q => ({
      text: q.text,
      options: q.options.map(opt => opt.text),
      correct: q.correctAnswerId - 1,
    }));

    startTransition(() => {
      // A Server Action cuida do redirect. NENHUM try/catch ou .catch deve ser usado aqui.
      updateQuiz(id, title, description, formattedQuestions);
    });
  }

  if (loading) {
      return (
        <div className="flex flex-col justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            <p className="text-slate-500 mt-2">Carregando atividade...</p>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
           <Button variant="ghost" onClick={() => router.push('/teacher')} className="gap-2">
                <ArrowLeft size={16} />
                Voltar para o Painel
            </Button>
            <h1 className="text-2xl font-bold text-slate-800">Editar Quiz</h1>
            <div /> 
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div>
                <Label htmlFor="quiz-title">Título do Quiz</Label>
                <Input id="quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dê um nome para a sua atividade" disabled={isSaving} />
            </div>
            <div>
                <Label htmlFor="quiz-description">Descrição</Label>
                <Textarea id="quiz-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Uma breve explicação sobre o quiz" disabled={isSaving} />
            </div>
          </CardContent>
        </Card>

        {questions.map((q, index) => (
          <Card key={q.id} className="mb-4 relative">
            <CardHeader>
              <CardTitle className="text-lg">Questão {index + 1}</CardTitle>
                 {questions.length > 1 && (
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeQuestion(q.id)} disabled={isSaving}>
                        <Trash2 size={18} />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea value={q.text} onChange={(e) => handleQuestionTextChange(q.id, e.target.value)} placeholder={`Digite o enunciado da questão ${index + 1}`} disabled={isSaving} />
              <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <Input value={opt.text} onChange={(e) => handleOptionChange(q.id, opt.id, e.target.value)} placeholder={`Opção ${opt.id}`} className={q.correctAnswerId === opt.id ? "border-green-500" : ""} disabled={isSaving} />
                    <Button variant={q.correctAnswerId === opt.id ? "default" : "outline"} onClick={() => setCorrectAnswer(q.id, opt.id)} className={`${q.correctAnswerId === opt.id ? "bg-green-600 hover:bg-green-700" : ""} whitespace-nowrap`} disabled={isSaving}>
                        É a correta
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-between mt-6">
           <Button onClick={addQuestion} variant="outline" className="gap-2" disabled={isSaving}>
                <Plus size={16} />
                Adicionar Questão
            </Button>
            <Button onClick={handleSubmit} className="gap-2 bg-blue-600 hover:bg-blue-700" disabled={isSaving || loading}>
                 {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save size={16} /> Salvar Alterações</>}
            </Button>
        </div>
      </div>
    </div>
  )
}

// Envolvemos o componente principal com Suspense para que o `useSearchParams` funcione corretamente.
export default function EditQuizPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <EditQuizPageContent />
        </Suspense>
    );
}
