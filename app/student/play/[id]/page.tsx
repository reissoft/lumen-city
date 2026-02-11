// app/student/play/[id]/page.tsx
'use client'

import { useState, useEffect, use } from 'react' // Importe o 'use' para React 19/Next 15
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress" // Se der erro, instale: npx shadcn-ui@latest add progress
import { CheckCircle, XCircle, Trophy, ArrowRight } from "lucide-react"
import { submitQuizResult } from "@/app/actions"
import Link from 'next/link'

// Tipos
interface Question {
  text: string
  options: string[]
  correct: number
}

// Simulando um fetch (em prod usaríamos useEffect para buscar do server)
// Para facilitar, vamos passar o ID e buscar via server action depois, 
// mas aqui vou fazer um fetch simples no client para agilizar o MVP.
async function getQuizData(id: string) {
    // Nota: Em Client Components, idealmente usamos API Route ou passamos dados via props.
    // Hack rápido para MVP: Vamos assumir que recebemos os dados ou criar uma API Route.
    // POR ENQUANTO: Para não complicar criando API Routes agora, 
    // vou pedir para você COPIAR o JSON de um quiz que você gerou e colar aqui embaixo
    // ou vamos fazer o fetch correto. Vamos fazer o fetch correto:
    
    const res = await fetch(`/api/quiz/${id}`) // Vamos criar essa rota no passo 3
    if (!res.ok) return null
    return res.json()
}

export default function GameInterface({ params }: { params: Promise<{ id: string }> }) {
  // Desembrulha a promise params
  const { id } = use(params)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isChecked, setIsChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [resultMessage, setResultMessage] = useState("")

  // Busca o Quiz ao carregar
  useEffect(() => {
    fetch(`/api/quiz/${id}`)
        .then(res => res.json())
        .then(data => {
            setQuestions(data.payload.questions)
            setLoading(false)
        })
        .catch(err => console.error("Erro ao carregar quiz:", err))
  }, [id])

  const handleCheck = () => {
    if (selectedOption === null) return
    setIsChecked(true)
    
    // Verifica acerto
    if (selectedOption === questions[currentQ].correct) {
        setScore(prev => prev + 1)
    }
  }

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
        // Próxima pergunta
        setCurrentQ(prev => prev + 1)
        setSelectedOption(null)
        setIsChecked(false)
    } else {
        // Fim do Jogo
        setLoading(true)
        const finalScore = Math.round(((score + (selectedOption === questions[currentQ].correct ? 0 : 0)) / questions.length) * 100)
        
        // Salva no Server
        const result = await submitQuizResult(id, finalScore)
        setResultMessage(result.message)
        setGameOver(true)
        setLoading(false)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center text-indigo-600">Carregando Jogo...</div>

  if (gameOver) {
    return (
        <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
            <Trophy className="w-24 h-24 text-yellow-400 mb-6 animate-bounce" />
            <h1 className="text-4xl font-bold mb-2">Quiz Finalizado!</h1>
            <p className="text-xl text-slate-300 mb-8">{resultMessage}</p>
            
            <Link href="/teacher"> 
                {/* Link temporário para voltar, depois será para o painel do aluno */}
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-lg px-8 py-6">
                    Voltar para a Cidade
                </Button>
            </Link>
        </div>
    )
  }

  const progress = ((currentQ) / questions.length) * 100
  const question = questions[currentQ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-2xl mx-auto border-x shadow-xl">
      {/* Barra de Progresso */}
      <div className="p-6 pb-2">
        <Progress value={progress} className="h-4" />
        <div className="mt-4 flex justify-between text-slate-500 font-medium">
            <span>Questão {currentQ + 1} de {questions.length}</span>
            <span>Score: {score}</span>
        </div>
      </div>

      {/* Área da Pergunta */}
      <div className="flex-1 p-6 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
            {question.text}
        </h2>

        <div className="space-y-3">
            {question.options.map((opt, index) => {
                let style = "border-2 border-slate-200 hover:border-indigo-300 bg-white"
                
                if (isChecked) {
                    if (index === question.correct) style = "border-green-500 bg-green-50 text-green-700 font-bold"
                    else if (index === selectedOption) style = "border-red-500 bg-red-50 text-red-700"
                    else style = "opacity-50"
                } else if (selectedOption === index) {
                    style = "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200"
                }

                return (
                    <button
                        key={index}
                        disabled={isChecked}
                        onClick={() => setSelectedOption(index)}
                        className={`w-full p-4 rounded-xl text-left text-lg transition-all duration-200 ${style}`}
                    >
                        {opt}
                    </button>
                )
            })}
        </div>
      </div>

      {/* Barra Inferior de Ação */}
      <div className={`p-6 border-t ${isChecked ? (selectedOption === question.correct ? "bg-green-100" : "bg-red-100") : "bg-white"}`}>
        <div className="flex justify-between items-center">
            {isChecked ? (
                <>
                    <div className="font-bold text-lg">
                        {selectedOption === question.correct ? 
                            <span className="text-green-700 flex items-center gap-2"><CheckCircle /> Correto!</span> : 
                            <span className="text-red-700 flex items-center gap-2"><XCircle /> Ops... Era a outra.</span>
                        }
                    </div>
                    <Button onClick={handleNext} size="lg" className={selectedOption === question.correct ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
                        Continuar <ArrowRight className="ml-2 w-4 h-4"/>
                    </Button>
                </>
            ) : (
                <Button 
                    onClick={handleCheck} 
                    disabled={selectedOption === null}
                    className="w-full text-lg py-6 bg-indigo-600 hover:bg-indigo-700"
                >
                    Verificar
                </Button>
            )}
        </div>
      </div>
    </div>
  )
}