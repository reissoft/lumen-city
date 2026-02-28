'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { logout } from "../auth/actions";
import NotificationBell from '@/components/notifications/NotificationBell';
import VirtualFriend from '@/components/VirtualFriend';
import { useState, useEffect } from 'react';

export default function StudentHeader({ studentName }: { studentName: string }) {
  // Estado para armazenar os dados reais do aluno
  const [studentData, setStudentData] = useState({
    level: 1,
    xp: 0,
    gold: 0,
    className: 'Carregando...',
    activitiesAvailable: 0,
    activitiesCompleted: 0,
    levelProgress: 0,
    rankingPosition: 0
  });

  // Função para calcular o nível correto a partir do XP
  const getCorrectLevelFromXp = (xp: number): number => {
    if (xp < 100) return 1;
    const level = Math.floor(0.5 + 0.1 * Math.sqrt(25 + 2 * xp));
    return level;
  };

  // Função para calcular o progresso do nível
  const getLevelProgress = (xp: number, level: number): number => {
    const getTotalXpForLevelStart = (level: number): number => {
      if (level <= 1) return 0;
      const n = level - 1;
      const a1 = 100;
      const an = n * 100;
      return (n * (a1 + an)) / 2;
    };

    const xpForCurrentLevelStart = getTotalXpForLevelStart(level);
    const xpForNextLevelStart = getTotalXpForLevelStart(level + 1);
    const xpNeededForThisLevel = xpForNextLevelStart - xpForCurrentLevelStart;
    const currentLevelProgress = xp - xpForCurrentLevelStart;
    return xpNeededForThisLevel > 0 ? (currentLevelProgress / xpNeededForThisLevel) * 100 : 100;
  };

  // Carregar dados do aluno quando o componente for montado
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        // Fazer requisição para obter os dados do aluno
        const response = await fetch('/api/student-data');
        if (response.ok) {
          const data = await response.json();
          
          const level = getCorrectLevelFromXp(data.xp);
          const levelProgress = getLevelProgress(data.xp, level);
          
          setStudentData({
            level,
            xp: data.xp,
            gold: data.gold || 0,
            className: data.className || 'Sem turma',
            activitiesAvailable: data.activitiesAvailable || 0,
            activitiesCompleted: data.activitiesCompleted || 0,
            levelProgress,
            rankingPosition: data.rankingPosition || 0
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do aluno:', error);
      }
    };

    loadStudentData();
  }, []);

  // Contexto da página principal do aluno com dados reais
  const pageContext = {
    page: 'student/page',
    student: {
      name: studentName,
      level: studentData.level,
      xp: studentData.xp,
      gold: studentData.gold,
      className: studentData.className
    },
    pageData: {
      activities: {
        available: studentData.activitiesAvailable,
        completed: studentData.activitiesCompleted
      },
      progress: {
        levelProgress: Math.round(studentData.levelProgress)
      },
      ranking: {
        position: studentData.rankingPosition
      },
      tips: [
        'Complete atividades para ganhar XP e subir de nível!',
        'Visite sua cidade para coletar recursos e construir prédios.',
        'Participe do ranking da turma competindo com seus colegas.',
        'Use o chat para conversar com amigos e professores.'
      ]
    },
    availableActions: [
      'Entrar na Cidade',
      'Ver Ranking da Turma',
      'Iniciar Atividades',
      'Ver Mensagens',
      'Ajustar Configurações'
    ]
  };

  return (
    <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold">Portal do Aluno</h1>
            <p className="text-white/60">Bem-vindo(a) de volta, {studentName}!</p>
        </div>
        <div className="flex items-center gap-4">
            <NotificationBell />
            <Link href="/student/settings">
                <Button variant="outline" size="icon" className="font-semibold rounded-full bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors flex items-center gap-2">
                    <Settings size={16} />
                </Button>
            </Link>
            <form action={logout}>
                 <Button variant="outline" size="icon" className="font-semibold rounded-full bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors flex items-center gap-2">
                    <LogOut size={16} />
                </Button>
            </form>
        </div>
        <VirtualFriend studentName={studentName} pageContext={pageContext} />
    </header>
  );
}
