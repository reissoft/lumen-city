// app/teacher/create-activity/manual/page.tsx
"use client"

import { useState, useEffect, useTransition, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Save, Loader2, Check } from "lucide-react"
import { createManualQuiz } from "@/app/actions"
import { Textarea } from "@/components/ui/textarea"

interface Question {
  id: number
  text: string
  options: { id: number; text: string }[]
  correctAnswerId: number
}

const cardStyles = `bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg`;
const inputStyles = `w-full bg-white/5 border-2 border-white/20 rounded-lg p-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition`;

function ManualQuizCreatorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [classIds, setClassIds] = useState<string[]>([])
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now(),
      text: "",
      options: [{ id: 1, text: "" }, { id: 2, text: "" }, { id: 3, text: "" }, { id: 4, text: "" }],
      correctAnswerId: 1,
    },
  ])
  const [isSaving, startTransition] = useTransition()

  useEffect(() => {
    setTitle(searchParams.get("title") || "")
    const idsParam = searchParams.get("classIds");
    if (idsParam) {
      try {
        const parsedIds = JSON.parse(idsParam);
        if(Array.isArray(parsedIds)) setClassIds(parsedIds);
      } catch (error) {
        console.error("Erro ao processar os IDs das turmas da URL:", error);
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
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, text } : q)))
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
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, correctAnswerId: optionId } : q)))
  }
  
  const handleSubmit = () => {
    // Validations...
    startTransition(() => {
      const formattedQuestions = questions.map(q => ({
        text: q.text,
        options: q.options.map(opt => opt.text),
        correct: q.options.findIndex(opt => opt.id === q.correctAnswerId),
      }));
      createManualQuiz(title, description, formattedQuestions, classIds);
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
        <div className="container mx-auto p-4 md:p-8 relative space-y-10">

            <header className="flex items-center justify-between">
                 <Button variant="outline" onClick={() => router.back()} className="font-semibold rounded-full bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors flex items-center gap-2 py-2 px-4">
                    <ArrowLeft size={16} /> Voltar
                </Button>
                <h1 className="text-2xl font-bold">Criador de Quiz Manual</h1>
                <div/>
            </header>

            <section className={`${cardStyles} p-6 md:p-8 space-y-4`}>
                 <div>
                    <Label htmlFor="quiz-title" className="block text-md font-bold text-white mb-2">Título da Atividade</Label>
                    <Input id="quiz-title" value={title} readOnly className={`${inputStyles} cursor-default bg-white/10`} />
                </div>
                <div>
                    <Label htmlFor="quiz-description" className="block text-md font-bold text-white mb-2">Descrição (Opcional)</Label>
                    <Textarea id="quiz-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Uma breve explicação sobre o quiz..." className={`${inputStyles} min-h-[80px]`}/>
                </div>
            </section>

            {questions.map((q, index) => (
            <section key={q.id} className={`${cardStyles} p-6 md:p-8 relative`}>
                <header className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Questão {index + 1}</h2>
                    {questions.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-full">
                            <Trash2 size={18} />
                        </Button>
                    )}
                </header>
                <div className="space-y-4">
                <Textarea value={q.text} onChange={(e) => handleQuestionTextChange(q.id, e.target.value)} placeholder={`Digite o enunciado da questão ${index + 1}`} className={`${inputStyles} min-h-[100px] text-base`}/>
                <div className="space-y-3 pt-3">
                    {q.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-3">
                        <Input value={opt.text} onChange={(e) => handleOptionChange(q.id, opt.id, e.target.value)} placeholder={`Opção ${opt.id}`} className={`${inputStyles} ${q.correctAnswerId === opt.id ? 'border-green-400/50 ring-2 ring-green-500/30' : ''}`}/>
                        <Button onClick={() => setCorrectAnswer(q.id, opt.id)} variant="outline" className={`font-semibold rounded-full backdrop-blur-md transition-colors flex items-center gap-2 py-3 px-4 ${q.correctAnswerId === opt.id ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>
                           {q.correctAnswerId === opt.id && <Check size={16}/>} Correta
                        </Button>
                    </div>
                    ))}
                </div>
                </div>
            </section>
            ))}

            <footer className="flex justify-between items-center mt-6">
                <Button onClick={addQuestion} variant="outline" className="font-semibold rounded-full bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors flex items-center gap-2 py-3 px-4" disabled={isSaving}>
                    <Plus size={16} /> Adicionar Questão
                </Button>
                <Button onClick={handleSubmit} className="font-bold py-4 px-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform flex items-center gap-2" disabled={isSaving || classIds.length === 0}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save size={16} /> Salvar Quiz Completo</>}
                </Button>
            </footer>
        </div>
    </div>
  )
}

export default function ManualQuizCreator() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin"/>
            </div>
        }>
            <ManualQuizCreatorContent />
        </Suspense>
    )
}
