'use client'

import { useState, useCallback } from 'react'
import CityScene from "./CityScene"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Coins, X, MousePointer2, Hammer, Leaf, Route, Star } from "lucide-react"
import { buyBuilding } from "@/app/actions"
import { BUILDING_CONFIG, CATEGORIES, BuildingCategory } from '@/app/config/buildings'
import { cn } from '@/lib/utils'

// Ícones para as categorias
const CATEGORY_ICONS: Record<BuildingCategory, any> = {
  construction: Hammer,
  nature: Leaf,
  infrastructure: Route,
  special: Star
}

export default function CityInterface({ student, buildings }: { student: any, buildings: any[] }) {
  const [activeBuild, setActiveBuild] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<BuildingCategory>('construction')
  const [isBuilding, setIsBuilding] = useState(false)

  const handleTileClick = useCallback(async (x: number, y: number) => {
    if (!activeBuild) return

    const isOccupied = buildings.some(b => b.x === x && b.y === y)
    if (isOccupied) {
      alert("Local ocupado!")
      return
    }

    setIsBuilding(true)
    await buyBuilding(activeBuild, x, y)
    setIsBuilding(false)
    // setActiveBuild(null) // Opcional: manter selecionado para construir vários
  }, [activeBuild, buildings])

  // Filtra os prédios baseados na categoria atual
  const filteredBuildings = Object.entries(BUILDING_CONFIG).filter(
    ([_, config]) => config.category === activeCategory
  )

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black select-none">
      
      <CityScene buildings={buildings} onSelectTile={handleTileClick} />

      {/* HUD SUPERIOR */}
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

      {/* AVISO DE CONSTRUÇÃO ATIVA */}
      {activeBuild && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-bounce">
          <Badge className="bg-indigo-600 text-white px-6 py-2 text-lg shadow-xl border-2 border-white flex items-center gap-2">
            <MousePointer2 className="w-4 h-4" />
            Construindo: {BUILDING_CONFIG[activeBuild]?.name}
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

      {/* MENU INFERIOR */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-20 w-full max-w-4xl px-4 flex flex-col gap-2">
        
        {/* ABAS DE CATEGORIA */}
        <div className="flex justify-center gap-2">
          {Object.entries(CATEGORIES).map(([key, label]) => {
            const isSelected = activeCategory === key
            const Icon = CATEGORY_ICONS[key as BuildingCategory]
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key as BuildingCategory)}
                className={cn(
                  "px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-all backdrop-blur",
                  isSelected 
                    ? "bg-slate-900/95 text-white border-t border-x border-slate-600" 
                    : "bg-slate-900/60 text-slate-400 hover:bg-slate-800"
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </div>

        {/* LISTA DE PRÉDIOS DA CATEGORIA */}
        <div className="bg-slate-900/95 backdrop-blur border border-slate-600 p-2 rounded-2xl rounded-tl-none shadow-2xl flex items-center justify-center gap-2 overflow-x-auto min-h-[110px]">
            {filteredBuildings.length > 0 ? (
              filteredBuildings.map(([key, config]) => {
                  const isSelected = activeBuild === key
                  return (
                      <button
                          key={key}
                          onClick={() => setActiveBuild(isSelected ? null : key)}
                          className={cn(
                              "relative group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-[90px]",
                              isSelected 
                                  ? "bg-indigo-600 scale-105 shadow-lg ring-2 ring-white" 
                                  : "hover:bg-slate-800 hover:-translate-y-1"
                          )}
                      >
                          <div className={cn(
                              "p-3 rounded-full mb-1 transition-colors",
                              isSelected ? "bg-white text-indigo-600" : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                          )}>
                              <config.icon size={24} />
                          </div>
                          <span className={cn("text-xs font-bold", isSelected ? "text-white" : "text-slate-400")}>
                              {config.name}
                          </span>
                          <span className="text-[10px] text-yellow-500 font-mono">
                              {config.cost} G
                          </span>
                      </button>
                  )
              })
            ) : (
              <p className="text-slate-500 text-sm py-4">Nenhum item nesta categoria ainda.</p>
            )}
        </div>
      </div>

    </div>
  )
}