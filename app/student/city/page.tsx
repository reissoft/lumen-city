// app/student/city/page.tsx
import { PrismaClient } from "@prisma/client"
import { buyBuilding } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Zap, BookOpen, Trees, Coins, Hammer } from "lucide-react"
import Image from "next/image"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

// Configuração do Grid (6x6)
const GRID_SIZE = 6


async function getStudentData() {
    const email = (await cookies()).get("lumen_session")?.value
    if (!email) redirect("/login") // Se não tiver cookie, manda pro login
  return await prisma.student.findUnique({
    where: { email: email }, // Usa o email dinâmico
    include: { resources: true }
  })
}


export default async function CityBuilder() {
  const student = await getStudentData()
  if (!student || !student.resources) return <div>Erro ao carregar aluno.</div>

  // Tipagem segura do JSON
  const cityData = (student.cityData as any) || { buildings: [] }
  const buildings = cityData.buildings || []

  // Função helper para renderizar ícone baseado no tipo
  const getIcon = (type: string) => {
  // Mapeamento dos tipos para os caminhos das imagens
  const assets: Record<string, string> = {
    house: '/assets/house.png',
    school: '/assets/school.png',
    park: '/assets/park.png',
    power: '/assets/power.png'
  }
  
  const src = assets[type]

  // Se não tiver imagem (fallback), retorna null ou um div colorido
  if (!src) return <div className="w-8 h-8 bg-slate-500 rounded-full" />

  return (
    <div className="relative w-full h-full">
        {/* O 'object-contain' garante que a imagem não distorça */}
        <Image 
            src={src} 
            alt={type}
            fill
            className="object-contain drop-shadow-xl hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 64px, 96px"
        />
    </div>
  )
}

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 overflow-hidden">
      
      {/* 1. HUD (Cabeçalho de Recursos) */}
      <div className="flex justify-between items-center max-w-4xl mx-auto mb-8 bg-slate-800/80 p-4 rounded-xl backdrop-blur border border-slate-700">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
             Lumen City
          </h1>
          <p className="text-xs text-slate-400">Prefeito: {student.name}</p>
        </div>
        
        <div className="flex gap-4">
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/50 px-3 py-1 text-lg">
            <Coins className="w-4 h-4 mr-2" /> {student.resources.gold}
          </Badge>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/50 px-3 py-1 text-lg">
            XP {student.xp}
          </Badge>
        </div>
      </div>

      {/* 2. O TABULEIRO (Grid Isométrico Falso) */}
      <div className="flex justify-center my-12 perspective-1000">
        <div 
            className="grid gap-2 p-4 bg-slate-800 rounded-xl shadow-2xl border-4 border-slate-700"
            style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                transform: "rotateX(20deg) rotateZ(0deg)", // Efeito leve de profundidade
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE
            const y = Math.floor(index / GRID_SIZE)
            
            // Verifica se tem prédio nesta coordenada
            const building = buildings.find((b: any) => b.x === x && b.y === y)

            return (
              <div key={index} className="relative group">
                <div className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center transition-all duration-300
                    ${building 
                        ? "bg-slate-700 shadow-lg -translate-y-1 border-b-4 border-slate-900" 
                        : "bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 border-dashed"
                    }
                `}>
                  {building ? getIcon(building.type) : <div className="w-2 h-2 rounded-full bg-slate-700" />}
                </div>

                {/* Hover para Construir (Só aparece se vazio) */}
                {!building && (
                  <div className="absolute inset-0 bg-slate-900/90 hidden group-hover:flex flex-col items-center justify-center z-10 rounded-lg gap-1">
                    <form action={buyBuilding.bind(null, 'house', x, y)}>
                        <button className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-500 text-white w-full">House (50)</button>
                    </form>
                    <form action={buyBuilding.bind(null, 'park', x, y)}>
                        <button className="text-xs bg-green-600 px-2 py-1 rounded hover:bg-green-500 text-white w-full">Park (100)</button>
                    </form>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Rodapé Explicativo */}
      <div className="text-center text-slate-500 text-sm mt-8">
        <p>💡 Passe o mouse sobre um quadrado vazio para construir.</p>
        <p>Complete Quizzes para ganhar mais ouro!</p>
      </div>

    </div>
  )
}