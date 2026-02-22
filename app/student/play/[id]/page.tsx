// app/student/play/[id]/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Check, X, Trophy, ArrowRight, AlertTriangle, ChevronLeft, Loader2 } from "lucide-react"
import { submitQuizResult } from "@/app/actions"
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Types
interface Question {
  text: string
  options: string[]
  correct: number
}

interface QuizData {
  title: string
  questions: Question[]
}

const cardStyles = `bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg`;

export default function PlayQuizPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const searchParams = useSearchParams();

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
                const errorData = await res.json();
                throw new Error(errorData.error || "Quiz não encontrado ou não possui questões.");
            }
            const data = await res.json();
            if(!data.questions || data.questions.length === 0) {
                throw new Error("Este quiz não tem perguntas cadastradas.")
            }
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
        const finalScore = Math.round((score / quizData.questions.length) * 100);
        
        const from = searchParams.get('from');
        if (from !== 'teacher') {
            const result = await submitQuizResult(id, finalScore);
            setResultMessage(result.message);
        } else {
            setResultMessage(`Você completou o teste! Sua pontuação final foi ${finalScore}%. Esta nota não será salva.`);
        }

        setGameOver(true);
        setLoading(false);
    }
  }
  
  const returnPath = searchParams.get('from') === 'teacher' ? '/teacher' : '/student';
  const finalScore = useMemo(() => quizData ? Math.round((score / quizData.questions.length) * 100) : 0, [score, quizData]);

  // --- RENDER STATES ---
  if (loading && !gameOver) {
    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
            <div className="flex items-center gap-3 text-white/80">
                <Loader2 className="h-6 w-6 animate-spin"/>
                <p className="font-semibold text-lg">Carregando quiz...</p>
            </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
            <div className={`${cardStyles} max-w-lg w-full text-center p-8 relative`}>
                <AlertTriangle className="w-16 h-16 mb-4 text-red-400 mx-auto" />
                <h1 className="text-2xl font-bold mb-2">Ocorreu um Erro</h1>
                <p className="text-white/60 mb-8">{error}</p>
                <Link href={returnPath}>
                    <Button variant="outline" className="gap-2 rounded-full bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20"><ChevronLeft/> Voltar</Button>
                </Link>
            </div>
        </div>
    );
  }
  
  if (gameOver) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
            <div className={`${cardStyles} w-full max-w-md text-center p-8 md:p-12 relative animate-in fade-in zoom-in-95`}>
                <Trophy className="w-24 h-24 text-yellow-300 mx-auto animate-bounce mb-4" />
                <h1 className="text-4xl font-bold mb-2">Quiz Finalizado!</h1>
                <p className="text-7xl font-bold my-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400 animate-in fade-in delay-300 duration-500">{finalScore}%</p>
                <p className="text-white/70 mb-10 text-center">{resultMessage}</p>
                <Link href={returnPath}>
                    <Button size="lg" className="w-full font-bold text-lg rounded-full bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20">
                        Voltar ao Painel
                    </Button>
                </Link>
            </div>
        </div>
    )
  }
  
  if (!quizData) return null;

  const progress = ((currentQ + 1) / quizData.questions.length) * 100;
  const question = quizData.questions[currentQ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex flex-col justify-between items-center p-4 md:p-6">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
      
      {/* -- HEADER -- */}
      <header className={`${cardStyles} w-full max-w-4xl z-10 p-4`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h1 className='truncate text-lg font-bold flex-1'>{quizData.title}</h1>
              <div className="flex items-center gap-4 text-white/70 font-semibold">
                  <span>Questão {currentQ + 1}/{quizData.questions.length}</span>
                  <span>Score: {score}</span>
              </div>
          </div>
          {/* @ts-ignore */}
          <Progress value={progress} className="mt-4 h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-green-400 to-cyan-400"/>
      </header>

      {/* -- QUESTION -- */}
      <main className="w-full max-w-3xl flex-1 flex flex-col justify-center items-center my-8 z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center leading-tight">
              {question.text}
          </h2>
      </main>

      {/* -- OPTIONS -- */}
      <div className="w-full max-w-3xl space-y-3 z-10 mb-28"> 
          {question.options.map((opt, index) => {
              const isCorrect = index === question.correct;
              const isUserChoice = index === selectedOption;
              
              const optionStyle = cn(
                'w-full p-5 rounded-xl text-left text-lg font-semibold transition-all duration-300 border-2', 
                {
                  'bg-white/5 border-white/10 hover:border-blue-400/50 hover:bg-white/10': !isChecked, // Default state
                  'cursor-pointer': !isChecked,
                  'ring-4 ring-blue-500/30 border-blue-500 bg-blue-500/10': !isChecked && isUserChoice, // Selected state
                  'cursor-not-allowed opacity-50': isChecked && !isCorrect && !isUserChoice, // Faded out when checked
                  'bg-green-500/10 border-green-500 text-white': isChecked && isCorrect, // Correct answer
                  'bg-red-500/10 border-red-500': isChecked && !isCorrect && isUserChoice // Incorrect user choice
                }
              );

              return (
                  <button
                      key={index}
                      disabled={isChecked}
                      onClick={() => setSelectedOption(index)}
                      className={optionStyle}
                  >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {isChecked && isCorrect && <Check className="w-6 h-6 text-green-400"/>}
                        {isChecked && !isCorrect && isUserChoice && <X className="w-6 h-6 text-red-400"/>}
                      </div>
                  </button>
              )
          })}
      </div>

      {/* -- FOOTER -- */}
      <footer className={cn(
        `${cardStyles} fixed bottom-0 left-0 right-0 p-5 z-20`,
        {
          'border-t-green-500/20': isChecked && selectedOption === question.correct,
          'border-t-red-500/20': isChecked && selectedOption !== question.correct,
        }
      )}>
          <div className="flex justify-between items-center max-w-4xl mx-auto">
              {isChecked ? (
                  <div className="font-bold text-xl flex-1">
                      {selectedOption === question.correct ? 
                          <span className="text-green-300 flex items-center gap-2"><Check /> Correto!</span> : 
                          <span className="text-red-400 flex items-center gap-2"><X /> Incorreto</span>
                      }
                  </div>
              ) : <div className="flex-1"></div>} 

              <div className="flex-1 flex justify-end">
                {isChecked ? (
                  <Button onClick={handleNext} size="lg" className='font-bold rounded-full text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform'>
                      Continuar <ArrowRight className="ml-2 w-5 h-5"/>
                  </Button>
                ) : (
                  <Button 
                      onClick={handleCheck} 
                      disabled={selectedOption === null}
                      size="lg" className="w-full sm:w-auto font-bold rounded-full text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform disabled:from-gray-600 disabled:to-gray-700 disabled:scale-100 disabled:cursor-not-allowed">
                      Verificar
                  </Button>
                )}
              </div>
          </div>
      </footer>
    </div>
  )
}
