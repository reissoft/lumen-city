'use client'

import { useState, useCallback, useEffect } from 'react'
import CityScene from "./CityScene"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, MousePointer2, Hammer, Leaf, Route, Star, RotateCw, Trash2, Loader2 } from "lucide-react"
import { Users, Briefcase, Smile, ShieldAlert } from 'lucide-react';
import { buyBuilding, demolishBuildingAction, rotateBuildingAction } from "@/app/actions"
import { BUILDING_CONFIG, CATEGORIES, BuildingCategory } from '@/app/config/buildings'
import { cn } from '@/lib/utils'
import { useCityStats } from '@/app/hooks/useCityStats';

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
  const [isLoading, setIsLoading] = useState(true);

  const handleAssetsLoaded = useCallback(() => {
     setTimeout(() => setIsLoading(false), 300);
  }, []);

  useEffect(() => {
    if (initialBuildings && initialBuildings.length > 0) {
        setLocalBuildings(initialBuildings);
    }
  }, [initialBuildings]);

  const handleTileClick = useCallback(async (x: number, y: number) => {
    const clickedBuilding = localBuildings.find(b => b.x === x && b.y === y);
    if (activeBuild) {
      if (clickedBuilding) { alert("Local ocupado!"); return; }
      setIsBuilding(true);
      const newBuilding = { id: Date.now(), type: activeBuild, x, y, rotation: 0 };
      setLocalBuildings([...localBuildings, newBuilding]);
      setIsBuilding(false);
      await buyBuilding(activeBuild, x, y);
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

  const stats = useCityStats(localBuildings);
  
  // Funções para controlar a flag global
  const setPointerOverUI = (isOver: boolean) => {
    if (typeof window !== 'undefined') {
      window.isPointerOverUI = isOver;
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black select-none">
      {/* CENA 3D */}
      <CityScene 
        buildings={localBuildings} 
        onSelectTile={handleTileClick} 
        activeBuild={activeBuild} 
        selectedBuildingId={selectedBuildingId}
        onCancelBuild={() => setActiveBuild(null)}
        onAssetsLoaded={handleAssetsLoaded}
      />

      {/* --- TELA DE LOADING --- */}
      <div 
        onMouseEnter={() => setPointerOverUI(true)}
        onMouseLeave={() => setPointerOverUI(false)}
        className={cn(
          "absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-700 pointer-events-auto",
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
          <div className="flex flex-col items-center gap-4 animate-pulse">
              <h1 className="text-4xl font-bold text-white tracking-widest">LUMEN CITY</h1>
              <div className="flex items-center gap-2 text-indigo-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm font-medium uppercase tracking-widest">Construindo Mundo...</span>
              </div>
          </div>
      </div>
      
      {/* HUD SUPERIOR */}
      <div 
        onMouseEnter={() => setPointerOverUI(true)}
        onMouseLeave={() => setPointerOverUI(false)}
        className="absolute top-0 left-0 w-full p-6 pointer-events-auto z-10"
      >
          <div className="flex justify-between items-start">
            <div className="bg-slate-900/90 backdrop-blur p-4 rounded-xl border border-slate-700 flex gap-6 text-white shadow-xl">
              <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold"><Users size={14} /> População</div>
                  <span className="text-xl font-bold">{stats.population}</span>
              </div>
              <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold"><Smile size={14} /> Felicidade</div>
                  <span className={cn("text-xl font-bold", stats.happiness < 50 ? "text-red-500" : "text-green-400")}>{stats.happiness}%</span>
              </div>
              <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold"><Briefcase size={14} /> Desemprego</div>
                  <span className={cn("text-xl font-bold", stats.unemployed > 0 ? "text-yellow-500" : "text-slate-200")}>{stats.unemployed}</span>
              </div>
              <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold"><ShieldAlert size={14} /> Segurança</div>
                  <span className="text-xl font-bold">{stats.securityLevel}%</span>
              </div>
            </div>
          </div>
      </div>

      {/* MENU DE SELEÇÃO */}
      {selectedBuildingId && selectedConfig && !activeBuild && (
          inEditMode = true,
          <div 
            onMouseEnter={() => setPointerOverUI(true)}
            onMouseLeave={() => setPointerOverUI(false)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-30 flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-200"
          >
              <Badge className="bg-white text-slate-900 px-4 py-1 text-sm font-bold shadow-xl border-2 border-slate-200 mb-2">
                  {selectedConfig.name}
              </Badge>
              <div className="flex gap-2">
                  <Button onClick={handleRotate} className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 shadow-xl border-2 border-white transition-transform hover:scale-110"><RotateCw className="w-6 h-6 text-white" /></Button>
                  <Button onClick={handleDelete} className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-500 shadow-xl border-2 border-white transition-transform hover:scale-110"><Trash2 className="w-5 h-5 text-white" /></Button>
                  <Button onClick={() => {setSelectedBuildingId(null);inEditMode = false;}} className="h-12 w-12 rounded-full bg-slate-700 hover:bg-slate-600 shadow-xl border-2 border-white transition-transform hover:scale-110"><X className="w-6 h-6 text-white" /></Button>
              </div>
          </div>
      )}

      {/* AVISO DE CONSTRUÇÃO */}
      {activeBuild && (
        <div 
          onMouseEnter={() => setPointerOverUI(true)}
          onMouseLeave={() => setPointerOverUI(false)}
          className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-auto z-20 animate-bounce"
        >
          <Badge className="bg-indigo-600 text-white px-6 py-2 text-lg shadow-xl border-2 border-white flex items-center gap-2">
            <MousePointer2 className="w-4 h-4" />
            Construindo: {BUILDING_CONFIG[activeBuild as keyof typeof BUILDING_CONFIG]?.name}
          </Badge>
          <div className="text-center mt-2">
            <Button variant="secondary" size="sm" className="shadow-lg opacity-90 hover:opacity-100" onClick={() => setActiveBuild(null)}>
                <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* MENU INFERIOR */}
      {!selectedBuildingId && (
        <div 
          onMouseEnter={() => setPointerOverUI(true)}
          onMouseLeave={() => setPointerOverUI(false)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-20 w-full max-w-5xl px-4 flex flex-col gap-2 animate-in slide-in-from-bottom-10"
        >
            <div className="flex justify-center gap-2">
              {Object.entries(CATEGORIES).map(([key, label]) => {
                  const isSelected = activeCategory === key;
                  const Icon = CATEGORY_ICONS[key as BuildingCategory];
                  return (
                    <button
                        key={key}
                        onClick={() => setActiveCategory(key as BuildingCategory)}
                        className={cn(
                        "px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-all backdrop-blur",
                        isSelected ? "bg-slate-900/95 text-white border-t border-x border-slate-600" : "bg-slate-900/60 text-slate-400 hover:bg-slate-800"
                        )}
                    ><Icon size={16} /> {label}</button>
                  )
              })}
            </div>

            <div className="bg-slate-900/95 backdrop-blur border border-slate-600 p-2 rounded-2xl rounded-tl-none shadow-2xl flex items-center gap-2">
                <button onClick={() => { const el = document.getElementById('buildScroll'); if(el) el.scrollBy({left: -200, behavior: 'smooth'}) }} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors shrink-0"><span className="text-2xl pb-1 block">&#8249;</span></button>
                <div id="buildScroll" className="flex gap-2 overflow-x-auto flex-1 scroll-smooth py-2 px-1" style={{scrollbarWidth:'none', msOverflowStyle:'none'}}>
                    {filteredBuildings.length > 0 ? (
                      filteredBuildings.map(([key, config]) => {
                          const isSelected = activeBuild === key;
                          return (
                              <button
                                  key={key}
                                  onClick={() => setActiveBuild(isSelected ? null : key)}
                                  className={cn("relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-28 h-32 shrink-0 border border-transparent", isSelected ? "bg-indigo-600 scale-105 shadow-lg ring-2 ring-white" : "hover:bg-slate-800 hover:border-slate-700")}>
                                  {config.iconImage ? (
                                      <img src={config.iconImage} alt={config.name} className={cn("w-16 h-16 rounded-md object-contain mb-2 transition-all", isSelected ? "ring-2 ring-white/50" : "opacity-90 group-hover:opacity-100")} />
                                  ) : (
                                      <div className={cn("p-3 rounded-full mb-2 transition-colors", isSelected ? "bg-white text-indigo-600" : "bg-slate-800 text-slate-300 group-hover:bg-slate-700")}><config.icon size={28} /></div>
                                  )}
                                  <span className={cn("text-xs font-bold text-center line-clamp-1 w-full", isSelected ? "text-white" : "text-slate-400")}>{config.name}</span>
                                  <span className="text-[10px] text-yellow-500 font-mono mt-1">{config.cost} G</span>
                              </button>
                          )
                      })
                    ) : (
                      <div className="w-full text-center py-4"><p className="text-slate-500 text-sm">Nenhum item nesta categoria ainda.</p></div>
                    )}
                </div>
                <button onClick={() => { const el = document.getElementById('buildScroll'); if(el) el.scrollBy({left: 200, behavior: 'smooth'}) }} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors shrink-0"><span className="text-2xl pb-1 block">&#8250;</span></button>
            </div>
        </div>
      )}
    </div>
  )
}
