// app/teacher/create-activity/manual/page.tsx
"use client"

import { useState, useEffect, useTransition, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react"
import { createManualQuiz } from "@/app/actions"
import { Textarea } from "@/components/ui/textarea"

interface Question {
  id: number
  text: string
  options: { id: number; text: string }[]
  correctAnswerId: number
}

function ManualQuizCreatorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [classIds, setClassIds] = useState<string[]>([]) // Estado para os IDs das turmas
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now(),
      text: "",
      options: [{ id: 1, text: "" }, { id: 2, text: "" }, { id: 3, text: "" }, { id: 4, text: "" }],
      correctAnswerId: 1,
    },
  ])
  const [isSaving, startTransition] = useTransition()

  // Efeito para buscar parâmetros da URL
  useEffect(() => {
    setTitle(searchParams.get("title") || "")
    const idsParam = searchParams.get("classIds");
    if (idsParam) {
      try {
        const parsedIds = JSON.parse(idsParam);
        if(Array.isArray(parsedIds)) {
          setClassIds(parsedIds);
        }
      } catch (error) {
        console.error("Erro ao processar os IDs das turmas da URL:", error);
        // Opcional: redirecionar ou mostrar um erro se os IDs forem cruciais
      }
    }
  }, [searchParams])

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
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.id === optionId ? { ...opt, text } : opt
              ),
            }
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
  
  const handleSubmit = () => {
    if (!title.trim()) {
      alert("O título do quiz é obrigatório.");
      return;
    }
    if (questions.some(q => !q.text.trim() || q.options.some(opt => !opt.text.trim()))) {
      alert("Todas as perguntas e opções devem ser preenchidas.");
      return;
    }
    if (classIds.length === 0) {
        alert("Erro: Nenhuma turma selecionada. Por favor, volte e selecione ao menos uma turma.");
        return;
    }

    const formattedQuestions = questions.map(q => ({
      text: q.text,
      options: q.options.map(opt => opt.text),
      correct: q.options.findIndex(opt => opt.id === q.correctAnswerId),
    }));

    startTransition(() => {
      // Passa os classIds para a server action
      createManualQuiz(title, description, formattedQuestions, classIds);
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
           <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                <ArrowLeft size={16} />
                Voltar
            </Button>
            <h1 className="text-2xl font-bold text-slate-800">Criador de Quiz Manual</h1>
            <div /> 
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle>Informações do Quiz</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div>
                <Label htmlFor="quiz-title">Título do Quiz</Label>
                <Input
                  id="quiz-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Dê um nome para a sua atividade"
                  readOnly // O título vem da página anterior
                />
            </div>
            <div>
                <Label htmlFor="quiz-description">Descrição (Opcional)</Label>
                <Textarea
                  id="quiz-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Uma breve explicação sobre a atividade"
                />
            </div>
          </CardContent>
        </Card>

        {questions.map((q, index) => (
          <Card key={q.id} className="mb-4 relative">
            <CardHeader>
              <CardTitle className="text-lg">Questão {index + 1}</CardTitle>
                 {questions.length > 1 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => removeQuestion(q.id)}
                    >
                        <Trash2 size={18} />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={q.text}
                onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                placeholder={`Digite o enunciado da questão ${index + 1}`}
              />
              <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <Input
                      value={opt.text}
                      onChange={(e) => handleOptionChange(q.id, opt.id, e.target.value)}
                      placeholder={`Opção ${opt.id}`}
                      className={q.correctAnswerId === opt.id ? "border-green-500" : ""}
                    />
                    <Button 
                      variant={q.correctAnswerId === opt.id ? "default" : "outline"} 
                      onClick={() => setCorrectAnswer(q.id, opt.id)}
                      className={`${q.correctAnswerId === opt.id ? "bg-green-600 hover:bg-green-700" : ""} whitespace-nowrap`}
                    >
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
            <Button onClick={handleSubmit} className="gap-2 bg-blue-600 hover:bg-blue-700" disabled={isSaving || classIds.length === 0}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save size={16} /> Salvar Quiz</>}
            </Button>
        </div>
      </div>
    </div>
  )
}

export default function ManualQuizCreator() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ManualQuizCreatorContent />
        </Suspense>
    )
}
