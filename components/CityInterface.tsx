'use client'

import { useState, useCallback } from 'react'
import CityScene from "./CityScene"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Coins, Hammer, Home, Zap, GraduationCap, TreeDeciduous, X, MousePointer2 } from "lucide-react"
import { buyBuilding } from "@/app/actions"
import { cn } from "@/lib/utils" // Utilitário padrão do Shadcn (ou use template literals se não tiver)

// Configuração dos Prédios para gerar os botões
const BUILDING_TYPES = [
  { id: 'house', name: 'Casa', cost: 50, icon: Home, color: 'bg-blue-600 hover:bg-blue-500' },
  { id: 'park', name: 'Parque', cost: 100, icon: TreeDeciduous, color: 'bg-green-600 hover:bg-green-500' },
  { id: 'school', name: 'Escola', cost: 150, icon: GraduationCap, color: 'bg-red-500 hover:bg-red-400' },
  { id: 'power', name: 'Energia', cost: 300, icon: Zap, color: 'bg-yellow-600 hover:bg-yellow-500' },
]

export default function CityInterface({ student, buildings }: { student: any, buildings: any[] }) {
  // Estado: Qual prédio está selecionado para construir? (null = nenhum)
  const [activeBuild, setActiveBuild] = useState<string | null>(null)
  const [isBuilding, setIsBuilding] = useState(false) // Feedback visual de loading

  // Ação ao clicar no Mapa 3D
  const handleTileClick = useCallback(async (x: number, y: number) => {
    // 1. Se NÃO tiver nada selecionado na barra, não faz nada (ou apenas seleciona visualmente)
    if (!activeBuild) return

    // 2. Verifica se o local está livre
    const isOccupied = buildings.some(b => b.x === x && b.y === y)
    
    if (isOccupied) {
      alert("Local ocupado!")
      return
    }

    // 3. CONSTRÓI!
    setIsBuilding(true)
    await buyBuilding(activeBuild, x, y)
    setIsBuilding(false)
    
    // Opcional: Deselecionar após construir? 
    // Comente a linha abaixo se quiser construir várias casas seguidas (modo "pintura")
    setActiveBuild(null) 

  }, [activeBuild, buildings])

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black select-none">
      
      {/* CENA 3D (Fundo) */}
      <CityScene buildings={buildings} onSelectTile={handleTileClick} />

      {/* --- HUD SUPERIOR (Recursos) --- */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none z-10">
        <div className="flex justify-between items-start">
          <div className="bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-700 pointer-events-auto">
            <h1 className="text-xl font-bold text-white">Lumen City</h1>
            <p className="text-xs text-slate-400">População: {buildings.length * 5}</p>
          </div>
          <div className="pointer-events-auto">
            <Badge className="bg-yellow-500 text-slate-900 text-lg px-4 py-2 border-2 border-white shadow-lg">
              <Coins className="w-5 h-5 mr-2" /> {student.resources?.gold ?? 0}
            </Badge>
          </div>
        </div>
      </div>

      {/* --- AVISO FLUTUANTE (Quando selecionado) --- */}
      {activeBuild && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-bounce">
          <Badge className="bg-indigo-600 text-white px-6 py-2 text-lg shadow-xl border-2 border-white">
            <MousePointer2 className="w-4 h-4 mr-2" />
            Clique no mapa para colocar: {BUILDING_TYPES.find(b => b.id === activeBuild)?.name}
          </Badge>
          <div className="text-center mt-2">
            <Button 
                variant="secondary" 
                size="sm" 
                className="pointer-events-auto shadow-lg opacity-90 hover:opacity-100"
                onClick={() => setActiveBuild(null)}
            >
                <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* --- BARRA DE CONSTRUÇÃO (Rodapé) --- */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-20 w-full max-w-3xl px-4">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-2xl shadow-2xl flex items-center justify-center gap-2 md:gap-4 overflow-x-auto">
            
            {BUILDING_TYPES.map((b) => {
                const isSelected = activeBuild === b.id
                return (
                    <button
                        key={b.id}
                        onClick={() => setActiveBuild(isSelected ? null : b.id)}
                        disabled={isBuilding}
                        className={`
                            relative group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-[80px]
                            ${isSelected 
                                ? 'bg-indigo-600 scale-110 shadow-lg -translate-y-2 ring-2 ring-white' 
                                : 'hover:bg-slate-800 hover:-translate-y-1'
                            }
                        `}
                    >
                        <div className={`
                            p-3 rounded-full mb-1 transition-colors
                            ${isSelected ? 'bg-white text-indigo-600' : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'}
                        `}>
                            <b.icon size={24} />
                        </div>
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            {b.name}
                        </span>
                        <span className="text-[10px] text-yellow-500 font-mono">
                            {b.cost} G
                        </span>
                    </button>
                )
            })}

        </div>
      </div>

    </div>
  )
}