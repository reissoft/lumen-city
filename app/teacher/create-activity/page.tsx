// app/teacher/create-activity/page.tsx
"use client"

import { useState, useTransition, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { generateQuiz } from "@/app/actions"
import { getTeacherClasses } from "./actions"
import { ArrowLeft, PlusCircle, Users } from "lucide-react"
import Link from "next/link"
import dynamic from 'next/dynamic'

const QuizGeneratorCard = dynamic(() => import('./QuizGeneratorCard'), { ssr: false });

type Class = {
  id: string;
  name: string;
};

export default function CreateActivityPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [isGenerating, startTransition] = useTransition()
  
  // Estados para as turmas
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // Buscar turmas quando o componente montar
  useEffect(() => {
    async function fetchClasses() {
      const fetchedClasses = await getTeacherClasses();
      setClasses(fetchedClasses);
    }
    fetchClasses();
  }, []);

  // Manipulador para seleção de turmas
  const handleClassSelection = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId) 
        : [...prev, classId]
    );
  };

  const handleGenerateQuiz = (contextText: string, additionalNotes: string) => {
    if (!title || selectedClasses.length === 0) {
      alert("Por favor, insira um tema e selecione pelo menos uma turma.")
      return
    }
    
    const formData = new FormData()
    formData.append("topic", title)
    formData.append("classIds", JSON.stringify(selectedClasses)); // Envia os IDs das turmas

    if (contextText) {
      formData.append("contextText", contextText)
    }
    if (additionalNotes) {
      formData.append("additionalNotes", additionalNotes)
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

  const canProceed = !isGenerating && title && selectedClasses.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-6 gap-2">
            <Link href="/teacher"><ArrowLeft size={16} /> Voltar</Link>
        </Button>

        {/* 1. TEMA PRINCIPAL */}
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

        {/* 2. SELEÇÃO DE TURMAS */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Users /> Selecionar Turmas</CardTitle>
            <CardDescription>Escolha para quais turmas esta atividade será disponibilizada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {classes.length > 0 ? (
              classes.map(cls => (
                <div key={cls.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`class-${cls.id}`} 
                    onCheckedChange={() => handleClassSelection(cls.id)}
                    checked={selectedClasses.includes(cls.id)}
                  />
                  <Label htmlFor={`class-${cls.id}`} className="font-normal">{cls.name}</Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Nenhuma turma encontrada.</p>
            )}
          </CardContent>
        </Card>

        {/* 3. OPÇÕES DE CRIAÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Wrapper div para controlar o estado desabilitado */}
          <div className={!canProceed ? 'opacity-50 pointer-events-none' : ''}>
            <QuizGeneratorCard 
              topic={title}
              isGenerating={isGenerating}
              handleGeneration={handleGenerateQuiz}
            />
          </div>

          <Card className={`hover:border-green-500/50 transition-all ${!canProceed ? 'opacity-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <PlusCircle className="text-green-600" />
                Criar Quiz Manualmente
              </CardTitle>
              <CardDescription>
                Use o tema e turmas definidos acima e crie cada pergunta.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link 
                href={`/teacher/create-activity/manual?title=${encodeURIComponent(title)}&classIds=${JSON.stringify(selectedClasses)}`}
                className={`w-full ${!canProceed ? 'pointer-events-none' : ''}`}>
                <Button variant="secondary" className="w-full border-green-200 text-green-700" disabled={!canProceed}>
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
