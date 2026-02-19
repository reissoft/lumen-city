// app/student/play/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Trophy, ArrowRight, AlertTriangle } from "lucide-react"
import { submitQuizResult } from "@/app/actions"
import Link from 'next/link'

// Tipos
interface Question {
  text: string
  options: string[]
  correct: number
}

interface QuizData {
  title: string
  questions: Question[]
}

export default function PlayQuizPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/quiz/${id}`);
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Quiz não encontrado.");
            }
            const data = await res.json();
            setQuizData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchQuiz();
  }, [id]);

  const handleCheck = () => {
    if (selectedOption === null || !quizData) return;
    setIsChecked(true);
    if (selectedOption === quizData.questions[currentQ].correct) {
        setScore(prev => prev + 1);
    }
  }

  const handleNext = async () => {
    if (!quizData) return;

    if (currentQ < quizData.questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOption(null);
        setIsChecked(false);
    } else {
        setLoading(true);
        // A pontuação já foi atualizada no handleCheck da última questão
        const finalScore = Math.round((score / quizData.questions.length) * 100);
        
        const result = await submitQuizResult(id, finalScore);
        setResultMessage(result.message);
        setGameOver(true);
        setLoading(false);
    }
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-indigo-600">Carregando Jogo...</div>
  }

  if (error) {
    return (
        <div className="h-screen bg-slate-100 flex flex-col items-center justify-center text-red-600 p-4">
            <AlertTriangle className="w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Ocorreu um Erro</h1>
            <p className="text-slate-600 mb-8 text-center">{error}</p>
            <Link href="/student/city">
                <Button variant="secondary">Voltar para a Cidade</Button>
            </Link>
        </div>
    );
  }
  
  if (gameOver) {
    return (
        <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
            <Trophy className="w-24 h-24 text-yellow-400 mb-6 animate-bounce" />
            <h1 className="text-4xl font-bold mb-2">Quiz Finalizado!</h1>
            <p className="text-xl text-slate-300 mb-8 text-center max-w-md">{resultMessage}</p>
            <Link href="/student">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-lg px-8 py-6">
                    Voltar
                </Button>
            </Link>
        </div>
    )
  }
  
  if (!quizData) return null; // Não deve acontecer se o loading/error for tratado

  const progress = ((currentQ) / quizData.questions.length) * 100;
  const question = quizData.questions[currentQ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-2xl mx-auto border-x shadow-xl">
      <div className="p-6 pb-2">
        <h1 className="text-xl font-bold text-slate-700 mb-2">{quizData.title}</h1>
        <Progress value={progress} className="h-4" />
        <div className="mt-4 flex justify-between text-slate-500 font-medium">
            <span>Questão {currentQ + 1} de {quizData.questions.length}</span>
            <span>Score: {score}</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
            {question.text}
        </h2>
        <div className="space-y-3">
            {question.options.map((opt, index) => {
                let style = "border-2 border-slate-200 hover:border-indigo-300 bg-white";
                if (isChecked) {
                    if (index === question.correct) style = "border-green-500 bg-green-50 text-green-700 font-bold";
                    else if (index === selectedOption) style = "border-red-500 bg-red-50 text-red-700";
                    else style = "opacity-50";
                } else if (selectedOption === index) {
                    style = "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200";
                }
                return (
                    <button
                        key={index}
                        disabled={isChecked}
                        onClick={() => setSelectedOption(index)}
                        className={`w-full p-4 rounded-xl text-left text-lg transition-all duration-200 ${style}`}>
                        {opt}
                    </button>
                )
            })}
        </div>
      </div>

      <div className={`p-6 border-t ${isChecked ? (selectedOption === question.correct ? "bg-green-100" : "bg-red-100") : "bg-white"}`}>
        <div className="flex justify-between items-center">
            {isChecked ? (
                <>
                    <div className="font-bold text-lg">
                        {selectedOption === question.correct ? 
                            <span className="text-green-700 flex items-center gap-2"><CheckCircle /> Correto!</span> : 
                            <span className="text-red-700 flex items-center gap-2"><XCircle /> Incorreto</span>
                        }
                    </div>
                    <Button onClick={handleNext} size="lg">
                        Continuar <ArrowRight className="ml-2 w-4 h-4"/>
                    </Button>
                </>
            ) : (
                <Button 
                    onClick={handleCheck} 
                    disabled={selectedOption === null}
                    className="w-full text-lg py-6 bg-indigo-600 hover:bg-indigo-700">
                    Verificar
                </Button>
            )}
        </div>
      </div>
    </div>
  )
}
