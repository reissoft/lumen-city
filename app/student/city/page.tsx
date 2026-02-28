// app/student/city/page.tsx

import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import CityInterface from "@/components/CityInterface"
import VirtualFriend from "@/components/VirtualFriend"

const prisma = new PrismaClient()

async function getStudentData() {
    const sessionUsername = cookies().get('lumen_session')?.value;
    const userRole = cookies().get('lumen_role')?.value;

    if (!sessionUsername || userRole !== 'student') {
        redirect('/login');
    }

  return await prisma.student.findUnique({
    where: { username: sessionUsername },
    include: { resources: true }
  })
}

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

export default async function CityPage() {
  const student = await getStudentData()
  if (!student) return <div>Erro ao carregar perfil.</div>

  const cityData = (student.cityData as any) || { buildings: [] }
  const buildings = cityData.buildings || []

  // Calcular dados do aluno para o contexto
  const level = getCorrectLevelFromXp(student.xp);
  const levelProgress = getLevelProgress(student.xp, level);

  // Contexto da página da cidade do aluno
  const pageContext = {
    page: 'student/city/page',
    student: {
      name: student.name || 'Aluno(a)',
      level: level,
      xp: student.xp,
      gold: student.resources?.gold || 0,
      className: 'Carregando...' // Não disponível no contexto da cidade
    },
    pageData: {
      city: {
        buildings: buildings.length,
        resources: {
          gold: student.resources?.gold || 0,
          materials: student.resources?.wood || 0 // Usando wood como materials
        },
        level: Math.floor(buildings.length / 5) + 1, // Nível baseado no número de prédios
        population: buildings.reduce((acc: number, building: any) => acc + (building.population || 0), 0)
      },
      missions: {
        available: 3, // Missões fixas por enquanto
        completed: 1  // Missões fixas por enquanto
      },
      tips: [
        'Construa prédios para aumentar a população da sua cidade.',
        'Colete recursos visitando sua cidade regularmente.',
        'Melhore prédios existentes para obter mais benefícios.',
        'Complete missões para ganhar recompensas extras.'
      ]
    },
    availableActions: [
      'Construir Prédio',
      'Melhorar Prédio',
      'Visitar Amigos',
      'Completar Missões',
      'Voltar ao Painel'
    ]
  };

  // Conecta o Backend (Server) com o Frontend Interativo (Client)
  return (
    <div className="relative">
      <CityInterface student={student} buildings={buildings} />
      <VirtualFriend studentName={student.name} pageContext={pageContext} />
    </div>
  )
}
