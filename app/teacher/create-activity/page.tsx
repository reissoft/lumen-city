// app/teacher/create-activity/page.tsx
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { generateQuiz } from "@/app/actions"
import { ArrowLeft, Wand2, PlusCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CreateActivityPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isGenerating, startTransition] = useTransition()

  const handleGenerateQuiz = () => {
    if (!title) {
      alert("Por favor, insira um tema para o quiz.")
      return
    }
    
    const formData = new FormData()
    formData.append("topic", title)
    
    startTransition(async () => {
      try {
        await generateQuiz(formData)
        // O redirecionamento é feito pela server action, não precisamos fazer nada aqui
      } catch (error) {
        console.error(error)
        alert("Houve um erro ao gerar o quiz com IA. Tente novamente.")
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft size={16} />
          Voltar
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informações da Atividade</CardTitle>
            <CardDescription>
              Preencha os detalhes básicos da sua nova atividade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tema Principal</Label>
              <Input
                id="title"
                placeholder="Ex: Revolução Francesa, Ciclo da Água"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Uma breve explicação sobre o que os alunos irão aprender."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={`hover:border-indigo-500/50 transition-all ${isGenerating ? 'opacity-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wand2 className="text-indigo-600" />
                Gerar Quiz com IA
              </CardTitle>
              <CardDescription>
                Deixe nossa IA criar as perguntas com base no tema que você definiu.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleGenerateQuiz} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isGenerating}>
                {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Gerando...</> : 'Gerar Mágica ✨'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className={`hover:border-green-500/50 transition-all ${isGenerating ? 'opacity-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <PlusCircle className="text-green-600" />
                Criar Quiz Manualmente
              </CardTitle>
              <CardDescription>
                Crie cada pergunta e alternativa do zero para uma avaliação personalizada.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link 
                href={`/teacher/create-activity/manual?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`}
                className={`w-full ${isGenerating ? 'pointer-events-none' : ''}`}>
                <Button variant="secondary" className="w-full border-green-200 text-green-700" disabled={isGenerating}>
                  Começar a Criar
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
