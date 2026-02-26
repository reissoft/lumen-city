// app/teacher/create-activity/page.tsx
"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { generateQuiz } from "@/app/actions"
import { getTeacherClasses } from "./actions"
import { ArrowLeft, PlusCircle, Users, Bot, PencilLine } from "lucide-react"
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
  const [expiresAt, setExpiresAt] = useState("")
  const [isGenerating, startTransition] = useTransition()
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  useEffect(() => {
    async function fetchClasses() {
      const fetchedClasses = await getTeacherClasses();
      setClasses(fetchedClasses);
    }
    fetchClasses();
  }, []);

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
    formData.append("classIds", JSON.stringify(selectedClasses));
    if (expiresAt) formData.append("expiresAt", expiresAt);

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

  const canProceed = !isGenerating && title.trim() !== "" && selectedClasses.length > 0;

  const cardStyles = `bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg transition-all`;
  const disabledOverlay = !canProceed ? 'opacity-40 pointer-events-none' : 'opacity-100';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
        <div className="container mx-auto p-4 md:p-8 relative space-y-10">
            
            <Link href="/teacher" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 rounded-full px-4 py-2 text-sm transition-colors">
                <ArrowLeft size={16} /> Voltar ao Painel
            </Link>

            <header>
                <h1 className="text-4xl font-bold">Criar Nova Atividade</h1>
                <p className="text-white/60 mt-1">Defina um tema, escolha as turmas e o método de criação.</p>
            </header>

            {/* 1. TEMA E TURMAS */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
                 <section className={`${cardStyles} p-6 md:p-8`}>
                    <Label htmlFor="title" className="block text-lg font-bold text-white mb-3">1. Defina um Tema</Label>
                    <Input
                        id="title"
                        placeholder="Ex: A Célula Animal, Brasil Colônia..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white/5 border-2 border-white/20 rounded-lg p-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition"
                        disabled={isGenerating}
                    />
                    <div className="mt-4">
                      <Label htmlFor="expiresAt" className="block text-sm font-semibold text-white/80 mb-1">Data de Expiração (opcional)</Label>
                      <Input
                        id="expiresAt"
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        disabled={isGenerating}
                        className="w-full bg-white/5 border-2 border-white/20 rounded-lg p-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition"
                      />
                    </div>
                </section>

                <section className={`${cardStyles} p-6 md:p-8`}>
                    <header className="mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2"><Users size={20}/> 2. Selecionar Turmas</h2>
                        <p className="text-sm text-white/50">Escolha para quais turmas esta atividade será visível.</p>
                    </header>
                    <div className="space-y-3 max-h-32 overflow-y-auto pr-2">
                        {classes.length > 0 ? (
                        classes.map(cls => (
                            <div key={cls.id} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                            <Checkbox 
                                id={`class-${cls.id}`} 
                                onCheckedChange={() => handleClassSelection(cls.id)}
                                checked={selectedClasses.includes(cls.id)}
                                className="border-white/30 data-[state=checked]:bg-blue-500"
                            />
                            <Label htmlFor={`class-${cls.id}`} className="font-normal text-white/90 cursor-pointer">{cls.name}</Label>
                            </div>
                        ))
                        ) : (
                        <p className="text-sm text-white/50">Nenhuma turma encontrada.</p>
                        )}
                    </div>
                </section>
            </div>


            {/* 2. OPÇÕES DE CRIAÇÃO */}
            <div>
                 <h2 className="text-2xl font-bold text-center mb-2">3. Escolha como Criar</h2>
                 <p className="text-white/60 text-center mb-6">Use nossa IA para criar um quiz rápido ou crie as perguntas manualmente.</p>
                 <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${disabledOverlay}`}>
                    <div className={`${cardStyles} hover:border-blue-500/50`}>
                        <QuizGeneratorCard 
                        topic={title}
                        isGenerating={isGenerating}
                        handleGeneration={handleGenerateQuiz}
                        />
                    </div>

                    <div className={`${cardStyles} flex flex-col p-6 md:p-8 hover:border-green-500/50`}>
                        <header className="flex-grow">
                           <div className="flex items-center gap-3 mb-2">
                               <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <PencilLine className="text-green-400" />
                               </div>
                                <h3 className="text-xl font-bold">Criar Quiz Manualmente</h3>
                           </div>
                           <p className="text-white/60 ml-1">
                            Elabore cada pergunta e resposta para um controle total sobre o conteúdo.
                           </p>
                        </header>
                        <footer className="mt-6">
                        <Link 
                            href={`/teacher/create-activity/manual?title=${encodeURIComponent(title)}&classIds=${JSON.stringify(selectedClasses)}${expiresAt ? `&expiresAt=${encodeURIComponent(expiresAt)}` : ''}`}
                            className={`${!canProceed ? 'pointer-events-none' : ''}`}>
                            <Button variant="secondary" className="w-full font-bold bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors" disabled={!canProceed}>
                            Começar a Criar
                            </Button>
                        </Link>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
