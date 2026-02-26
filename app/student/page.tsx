// app/student/page.tsx
import React, { useState } from "react"
import { PrismaClient, Activity } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Play, Map as MapIcon, Trophy, Star, LogOut, BookOpen, Coins, Users, Settings, User, Building, Edit, AlertTriangle } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { logout } from "../auth/actions"
import Image from "next/image"
// 1. Importar o novo cabeçalho de cliente
import StudentHeader from './StudentHeader';
import ActivitiesSection from './ActivitiesSection';

const prisma = new PrismaClient()

type ActivityWithTeacher = Activity & { teacher: { name: string } | null } & { expiresAt?: string | null };

const getTotalXpForLevelStart = (level: number): number => {
    if (level <= 1) return 0;
    const n = level - 1;
    const a1 = 100;
    const an = n * 100;
    return (n * (a1 + an)) / 2;
};

const getCorrectLevelFromXp = (xp: number): number => {
    if (xp < 100) return 1;
    const level = Math.floor(0.5 + 0.1 * Math.sqrt(25 + 2 * xp));
    return level;
};

async function getStudentData() {
    const sessionValue = cookies().get("lumen_session")?.value;
    if (!sessionValue) redirect("/login");

    const student = await prisma.student.findUnique({
        where: { username: sessionValue }, 
        include: { 
            resources: true,
            class: { select: { name: true, id: true } } 
        }
    });

    if (!student) {
         return { student: null, activities: [], attemptsMap: new Map(), ranking: [] };
    }
    
    return getStudentDataByStudent(student);
}

async function getStudentDataByStudent(student: any) {
    const studentClassId = student.class?.id; 
{/* @ts-ignore */}
    let ranking = [];
    if (studentClassId) { 
        ranking = await prisma.student.findMany({
            where: { classId: studentClassId },
            orderBy: { xp: 'desc' },
            select: { id: true, name: true, xp: true, },
            take: 5,
        });
    }

    const activityAttempts = await prisma.activityAttempt.findMany({ where: { studentId: student.id } });
    
    let activities: ActivityWithTeacher[] = [];
    if (studentClassId) { 
        const raw = await prisma.activity.findMany({
            where: { classes: { some: { id: studentClassId } } },
            orderBy: { createdAt: 'desc' },
            include: {
                teacher: { select: { name: true } }
            }
        });
        // convert Date to string for serialization
        activities = raw.map(act => ({
            ...act,
            expiresAt: act.expiresAt ? act.expiresAt.toISOString() : null
        } as any));
    }
    
    const attemptsMap = new Map<string, number>();
    activityAttempts.forEach(attempt => {
        const existingScore = attemptsMap.get(attempt.activityId) || 0;
        if (attempt.score > existingScore) {
            attemptsMap.set(attempt.activityId, attempt.score);
        }
    });
{/* @ts-ignore */}
    return { student, activities, attemptsMap, ranking };
}

const cardStyles = `bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg transition-all`;


export default async function StudentHub() {
  const { student, activities, attemptsMap, ranking } = await getStudentData()
  
  if (!student) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-4">
        <p className="mb-4">Erro ao carregar seu perfil.</p>
        <Link href="/login">
            <Button className="bg-blue-500 hover:bg-blue-600">Fazer Login</Button>
        </Link>
    </div>
  );

  const correctLevel = getCorrectLevelFromXp(student.xp);
  const xpForCurrentLevelStart = getTotalXpForLevelStart(correctLevel);
  const xpForNextLevelStart = getTotalXpForLevelStart(correctLevel + 1);
  const xpNeededForThisLevel = xpForNextLevelStart - xpForCurrentLevelStart;
  const currentLevelProgress = student.xp - xpForCurrentLevelStart;
  const progressPercent = xpNeededForThisLevel > 0 ? (currentLevelProgress / xpNeededForThisLevel) * 100 : 100;

  const goldAmount = student.resources?.gold || 0;
  const className = student.class?.name || "Sem turma";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
      <div className="container mx-auto p-4 md:p-8 relative space-y-10">
        
        {/* 2. Usar o novo componente de cabeçalho */}
        <StudentHeader studentName={student.name || 'Aluno(a)'} />

        <section className={`${cardStyles} p-6`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl shadow-lg">🦸</div>
              <div>
                <h2 className="text-3xl font-bold text-white">Nível {correctLevel}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70 mt-2">
                  <div className="flex items-center gap-1.5 font-medium"><Users size={14} />{className}</div>
                  <div className="flex items-center gap-1.5 font-medium"><Coins size={14} className="text-yellow-400"/>{goldAmount} Moedas</div>
                  <div className="flex items-center gap-1.5 font-medium text-cyan-400"><Star size={14} className="fill-cyan-400" />{student.xp} XP Total</div>
                </div>
              </div>
            </div>
             <div className="w-full md:w-auto flex-shrink-0 md:max-w-xs">
                <div className="text-xs font-semibold text-white/50 uppercase mb-2">
                    <div>Progresso p/ Nível {correctLevel + 1}</div>
                    <div className="text-right text-base font-bold text-white">{currentLevelProgress} / {xpNeededForThisLevel} XP</div>
                </div>
                {/* @ts-ignore */}
                <Progress value={progressPercent} className="h-3 w-full bg-white/10" indicatorClassName="bg-gradient-to-r from-green-400 to-cyan-400"/>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Link href="/student/city" className="group lg:col-span-2">
            <div className={`${cardStyles} h-full p-8 flex flex-col justify-between items-start relative overflow-hidden hover:border-blue-500/50`}>
                <div className="absolute -top-10 -right-10 text-white/5"><Building size={180}/></div>
                <header>
                    <h3 className="text-2xl font-bold flex items-center gap-3 text-white"><MapIcon /> Minha Cidade</h3>
                    <p className="text-white/60 my-3">Gerencie seus prédios, colete recursos e expanda seu império.</p>
                </header>
                <Button className="font-bold bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors group-hover:bg-blue-500 group-hover:border-blue-500/50">Entrar na Cidade</Button>
            </div>
          </Link>
          
           <aside className={`${cardStyles} p-6`}>
                <h3 className="font-bold text-lg flex items-center gap-2 text-white mb-4"><Trophy className="text-yellow-400" /> Ranking da Turma</h3>
                <div className="space-y-3">
                {ranking.length > 0 ? (
                    ranking.map((rankedStudent, index) => (
                    <div key={rankedStudent.id} className={`flex items-center gap-3 text-sm rounded-lg ${rankedStudent.id === student.id ? 'bg-blue-500/20 p-2 -m-2' : ''}`}>
                        <span className={`w-6 text-center font-bold ${index === 0 ? "text-yellow-300" : (index === 1 ? "text-slate-300" : (index === 2 ? "text-orange-400" : "text-white/50"))}`}>#{index + 1}</span>
                        <span className={`flex-1 text-white/90 ${rankedStudent.id === student.id ? 'font-bold' : ''}`}>{rankedStudent.name}</span>
                        <span className="text-white/70 font-semibold">{rankedStudent.xp} XP</span>
                    </div>
                    ))
                ) : (
                    <p className="text-sm text-white/50 text-center py-4">O ranking aparecerá aqui.</p>
                )}
                </div>
            </aside>
        </div>

        <ActivitiesSection activities={activities} attemptsMap={attemptsMap} />

      </div>
    </div>
  )
}
