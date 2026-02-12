'use client'

import { useState, useCallback, useEffect } from 'react'
import CityScene from "./CityScene"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Coins, X, MousePointer2, Hammer, Leaf, Route, Star, RotateCw, Trash2, Loader2 } from "lucide-react"
import { demolishBuildingAction, rotateBuildingAction } from "@/app/actions"
import { BUILDING_CONFIG, CATEGORIES, BuildingCategory } from '@/app/config/buildings'
import { cn } from '@/lib/utils'

// ... (CATEGORY_ICONS e BuildingData Interfaces iguais ao seu) ...
const CATEGORY_ICONS: Record<BuildingCategory, any> = {
  construction: Hammer,
  nature: Leaf,
  infrastructure: Route,
  special: Star
}

interface BuildingData {
  id: number
  type: string
  x: number
  y: number
  rotation?: number
}

let inEditMode = false;

export default function CityInterface({ student, buildings: initialBuildings }: { student: any, buildings: any[] }) {
  const [localBuildings, setLocalBuildings] = useState<BuildingData[]>(initialBuildings || []);
  const [activeBuild, setActiveBuild] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<BuildingCategory>('construction')
  const [isBuilding, setIsBuilding] = useState(false)
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);

  // --- LOADING SCREEN STATE ---
  const [isLoading, setIsLoading] = useState(true);

  // Callback chamado pelo CityScene quando o PlayCanvas terminar de baixar os assets
  const handleAssetsLoaded = useCallback(() => {
     // Pequeno delay para garantir que a renderização do frame ocorreu
     setTimeout(() => {
         setIsLoading(false);
     }, 300);
  }, []);

  // Sync inicial para garantir que os dados do banco entrem no estado
  useEffect(() => {
    if (initialBuildings && initialBuildings.length > 0) {
        setLocalBuildings(initialBuildings);
    }
  }, [initialBuildings]);


  const handleTileClick = useCallback(async (x: number, y: number) => {
    // ... (Sua lógica idêntica de handleTileClick) ...
    const clickedBuilding = localBuildings.find(b => b.x === x && b.y === y);
    if (activeBuild) {
      if (clickedBuilding) { alert("Local ocupado!"); return; }
      setIsBuilding(true);
      const newBuilding = { id: Date.now(), type: activeBuild, x, y, rotation: 0 };
      setLocalBuildings([...localBuildings, newBuilding]);
      setIsBuilding(false);
      return;
    }
    if (clickedBuilding) {
      setSelectedBuildingId(clickedBuilding.id);
    } else {
      if(!inEditMode) setSelectedBuildingId(null);
    }
  }, [activeBuild, localBuildings]);


  const handleRotate = async () => {
    if (!selectedBuildingId) return;
    
    // CORREÇÃO DOS PARÊNTESES NA LÓGICA DE ROTAÇÃO
    const currentRot = localBuildings.find(b => b.id === selectedBuildingId)?.rotation || 0;
    const newRotation = (currentRot + 90) % 360;

    setLocalBuildings(prev => prev.map(b => 
        b.id === selectedBuildingId ? { ...b, rotation: newRotation } : b
    ));
    await rotateBuildingAction(selectedBuildingId, newRotation);
  };

  const handleDelete = async () => {
      if (!selectedBuildingId) return;
      if (confirm("Demolir este prédio?")) {
          await demolishBuildingAction(selectedBuildingId);
          setLocalBuildings(prev => prev.filter(b => b.id !== selectedBuildingId));
          setSelectedBuildingId(null);
      }
  }

  const selectedBuildingData = localBuildings.find(b => b.id === selectedBuildingId);
  const selectedConfig = selectedBuildingData ? BUILDING_CONFIG[selectedBuildingData.type as keyof typeof BUILDING_CONFIG] : null;

  const filteredBuildings = Object.entries(BUILDING_CONFIG).filter(
    ([_, config]) => config.category === activeCategory
  )

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black select-none">
      
      {/* --- TELA DE LOADING --- */}
      <div className={cn(
          "absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-700 pointer-events-none",
          isLoading ? "opacity-100" : "opacity-0"
      )}>
          <div className="flex flex-col items-center gap-4 animate-pulse">
              <h1 className="text-4xl font-bold text-white tracking-widest">LUMEN CITY</h1>
              <div className="flex items-center gap-2 text-indigo-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm font-medium uppercase tracking-widest">Construindo Mundo...</span>
              </div>
          </div>
      </div>

      {/* CENA 3D */}
      <CityScene 
        buildings={localBuildings} 
        onSelectTile={handleTileClick} 
        activeBuild={activeBuild} 
        selectedBuildingId={selectedBuildingId}
        onCancelBuild={() => setActiveBuild(null)}
        
        // Passa a função de remover o loading
        onAssetsLoaded={handleAssetsLoaded}
      />

      {/* ... (O RESTO DO SEU HUD E BOTÕES PERMANECE IGUAL) ... */}
      
      {/* HUD SUPERIOR */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none z-10">
        <div className="flex justify-between items-start">
          <div className="bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-700 pointer-events-auto">
            <h1 className="text-xl font-bold text-white">Lumen City</h1>
            <p className="text-xs text-slate-400">População: {localBuildings.length * 5}</p>
          </div>
          <div className="pointer-events-auto">
            <Badge className="bg-yellow-500 text-slate-900 text-lg px-4 py-2 border-2 border-white shadow-lg">
              <Coins className="w-5 h-5 mr-2" /> {student.resources?.gold ?? 0}
            </Badge>
          </div>
        </div>
      </div>

      {/* MENU DE SELEÇÃO */}
      {selectedBuildingId && selectedConfig && !activeBuild && (
          inEditMode = true,
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-200">
              <Badge className="bg-white text-slate-900 px-4 py-1 text-sm font-bold shadow-xl border-2 border-slate-200 mb-2">
                  {selectedConfig.name}
              </Badge>
              <div className="flex gap-2 pointer-events-auto">
                  <Button onClick={handleRotate} className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 shadow-xl border-2 border-white transition-transform hover:scale-110">
                      <RotateCw className="w-6 h-6 text-white" />
                  </Button>
                  <Button onClick={handleDelete} className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-500 shadow-xl border-2 border-white transition-transform hover:scale-110">
                      <Trash2 className="w-5 h-5 text-white" />
                  </Button>
                  <Button onClick={() => {setSelectedBuildingId(null);inEditMode = false;}} className="h-12 w-12 rounded-full bg-slate-700 hover:bg-slate-600 shadow-xl border-2 border-white transition-transform hover:scale-110">
                      <X className="w-6 h-6 text-white" />
                  </Button>
              </div>
          </div>
      )}

      {/* AVISO DE CONSTRUÇÃO */}
      {activeBuild && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-bounce">
          <Badge className="bg-indigo-600 text-white px-6 py-2 text-lg shadow-xl border-2 border-white flex items-center gap-2">
            <MousePointer2 className="w-4 h-4" />
            Construindo: {BUILDING_CONFIG[activeBuild as keyof typeof BUILDING_CONFIG]?.name}
          </Badge>
          <div className="text-center mt-2">
            <Button variant="secondary" size="sm" className="pointer-events-auto shadow-lg opacity-90 hover:opacity-100" onClick={() => setActiveBuild(null)}>
                <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* MENU INFERIOR */}
      {!selectedBuildingId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-20 w-full max-w-4xl px-4 flex flex-col gap-2 animate-in slide-in-from-bottom-10">
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
                    isSelected ? "bg-slate-900/95 text-white border-t border-x border-slate-600" : "bg-slate-900/60 text-slate-400 hover:bg-slate-800"
                    )}
                >
                    <Icon size={16} /> {label}
                </button>
                )
            })}
            </div>
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
                                isSelected ? "bg-indigo-600 scale-105 shadow-lg ring-2 ring-white" : "hover:bg-slate-800 hover:-translate-y-1"
                            )}
                        >
                            <div className={cn("p-3 rounded-full mb-1 transition-colors", isSelected ? "bg-white text-indigo-600" : "bg-slate-800 text-slate-300 group-hover:bg-slate-700")}>
                                <config.icon size={24} />
                            </div>
                            <span className={cn("text-xs font-bold", isSelected ? "text-white" : "text-slate-400")}>{config.name}</span>
                            <span className="text-[10px] text-yellow-500 font-mono">{config.cost} G</span>
                        </button>
                    )
                })
                ) : (
                <p className="text-slate-500 text-sm py-4">Nenhum item nesta categoria ainda.</p>
                )}
            </div>
        </div>
      )}
    </div>
  )
}