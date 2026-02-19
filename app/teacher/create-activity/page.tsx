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
import { generateQuiz } from "@/app/actions"
import { ArrowLeft, PlusCircle } from "lucide-react"
import Link from "next/link"
import dynamic from 'next/dynamic'

// Importação dinâmica do componente cliente com SSR desativado.
const QuizGeneratorCard = dynamic(() => import('./QuizGeneratorCard'), { ssr: false });

export default function CreateActivityPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isGenerating, startTransition] = useTransition()

  // A lógica de geração de quiz permanece aqui, mas agora recebe o texto extraído.
  const handleGenerateQuiz = (contextText: string) => {
    if (!title) {
      alert("Por favor, insira um tema para o quiz.")
      return
    }
    
    const formData = new FormData()
    formData.append("topic", title)
    if (contextText) {
      formData.append("contextText", contextText)
    }
    
    startTransition(async () => {
      try {
        await generateQuiz(formData)
      } catch (error) {
        console.error(error)
        alert("Houve um erro ao gerar o quiz com IA. Tente novamente.")
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-6 gap-2">
            <Link href="/teacher"><ArrowLeft size={16} /> Voltar</Link>
        </Button>

        {/* O campo de título agora fica fora, controlando ambos os cards */}
        <div className="mb-8">
            <Label htmlFor="title" className="text-lg font-semibold">Tema Principal da Atividade</Label>
            <Input
                id="title"
                placeholder="Ex: A Célula Animal, História do Brasil Colônia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 text-base p-4"
                disabled={isGenerating}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* O componente cliente é renderizado aqui */}
          <QuizGeneratorCard 
            topic={title}
            isGenerating={isGenerating}
            handleGeneration={handleGenerateQuiz}
          />

          {/* Card de Criação Manual (sem alterações significativas) */}
          <Card className={`hover:border-green-500/50 transition-all ${isGenerating ? 'opacity-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <PlusCircle className="text-green-600" />
                Criar Quiz Manualmente
              </CardTitle>
              <CardDescription>
                Use o tema definido acima e crie cada pergunta do zero.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link 
                href={`/teacher/create-activity/manual?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`}
                className={`w-full ${isGenerating || !title ? 'pointer-events-none' : ''}`}>
                <Button variant="secondary" className="w-full border-green-200 text-green-700" disabled={isGenerating || !title}>
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
