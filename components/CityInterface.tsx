'use client'

import { useState, useCallback } from 'react'
import CityScene from "./CityScene"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Coins, Hammer, Home, Zap, GraduationCap, TreeDeciduous, X, MousePointer2 } from "lucide-react"
import { buyBuilding } from "@/app/actions"
import { BUILDING_CONFIG } from '@/app/config/buildings'
import { cn } from '@/lib/utils'
//import { BUILDING_CONFIG, BuildingType } from "@/config/buildings"

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
            
            <div className="flex gap-4 overflow-x-auto">
    {Object.entries(BUILDING_CONFIG).map(([key, config]) => {
        const isSelected = activeBuild === key
        return (
            <button
                key={key}
                onClick={() => setActiveBuild(isSelected ? null : key)}
                className={cn("p-4 rounded-xl...", isSelected && "bg-indigo-600")}
            >
                <config.icon size={24} />
                <span className="text-xs font-bold">{config.name}</span>
                <span className="text-[10px] text-yellow-500">{config.cost} G</span>
            </button>
        )
    })}
</div>

        </div>
      </div>

    </div>
  )
}