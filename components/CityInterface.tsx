'use client'

import { useState, useCallback, useEffect } from 'react'
import CityScene from "./CityScene"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// 1. ADICIONEI OS ÍCONES NOVOS AQUI (Pencil, Check)
import { Coins, X, MousePointer2, Hammer, Leaf, Route, Star, RotateCw, Trash2, Loader2, Users, Briefcase, Smile, ShieldAlert, MapPin, Pencil, Check } from "lucide-react"

// 2. IMPORTANTE: Certifique-se que updateCityName existe no actions.ts
import { buyBuilding, demolishBuildingAction, rotateBuildingAction, updateCityName } from "@/app/actions"
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

  // --- NOVO: LÓGICA DE NOME DA CIDADE ---
  // Pega o nome do JSON resources ou usa o padrão
  const initialName = student.resources?.cityName || "Lumen City";
  
  // Estados para edição
  const [tempCityName, setTempCityName] = useState(initialName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  // FUNÇÃO DE SALVAR O NOME
  const handleSaveName = async () => {
    if (!tempCityName || tempCityName.trim() === "") return;
    
    setIsSavingName(true);

    try {
        // Chama o Backend passando o ID do aluno
        await updateCityName(student.id, tempCityName);

        // Atualiza localmente (Otimismo)
        if (!student.resources) student.resources = {};
        student.resources.cityName = tempCityName; 
        
        setIsEditingName(false);
    } catch (error) {
        console.error("Erro ao salvar nome:", error);
    } finally {
        setIsSavingName(false);
    }
  };
  // --------------------------------------

  const handleAssetsLoaded = useCallback(() => {
     setTimeout(() => {
         setIsLoading(false);
     }, 300);
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
  
  return (
    <div className="w-full h-screen relative overflow-hidden bg-black select-none">
      
      {/* TELA DE LOADING */}
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
        onAssetsLoaded={handleAssetsLoaded}
      />
      
    {/* HUD SUPERIOR */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none z-10">
        
        {/* NOME DA CIDADE (AGORA É EDITÁVEL) */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto z-20">
            <div className={cn(
                "backdrop-blur-md px-8 py-2 rounded-full border-b-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] flex flex-col items-center transition-all duration-300",
                isEditingName 
                    ? "bg-slate-900 border-indigo-500 scale-110" 
                    : "bg-slate-950/80 border-indigo-500/50 hover:bg-slate-900 hover:border-indigo-400 group cursor-pointer"
            )}>
                <span className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase mb-0.5">
                    Prefeito: {student?.name || "Jogador"}
                </span>

                {isEditingName ? (
                    /* MODO EDIÇÃO */
                    <div className="flex items-center gap-2 mt-1">
                        <input 
                            autoFocus
                            type="text" 
                            value={tempCityName}
                            onChange={(e) => setTempCityName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveName();
                                if (e.key === 'Escape') {
                                    setTempCityName(initialName);
                                    setIsEditingName(false);
                                }
                            }}
                            className="bg-transparent border-b border-white/20 text-center text-xl font-black text-white tracking-widest outline-none w-48 placeholder-slate-600"
                            maxLength={20}
                        />
                        <button onClick={handleSaveName} disabled={isSavingName} className="p-1 hover:bg-green-500/20 rounded-full text-green-400 transition-colors">
                            {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => {
                            setTempCityName(initialName);
                            setIsEditingName(false);
                        }} className="p-1 hover:bg-red-500/20 rounded-full text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    /* MODO VISUALIZAÇÃO */
                    <div 
                        onClick={() => {
                            setTempCityName(student.resources?.cityName || "Lumen City");
                            setIsEditingName(true);
                        }}
                        className="flex items-center gap-3 group-hover:scale-105 transition-transform"
                    >
                        <MapPin className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
                        <h1 className="text-2xl font-black text-white tracking-widest uppercase" style={{textShadow: "0 2px 10px rgba(0,0,0,0.5)"}}>
                            {student.resources?.cityName || "Lumen City"}
                        </h1>
                        <Pencil className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>
        </div>

        {/* CONTAINER FLEX PARA LATERAIS */}
        <div className="flex justify-between items-start w-full relative z-10">
          
          {/* LADO ESQUERDO: PAINEL DE STATUS */}
          <div className="bg-slate-900/90 backdrop-blur p-3 rounded-xl border border-slate-700 pointer-events-auto flex gap-6 text-white shadow-xl mt-2">
            <div className="flex flex-col items-center min-w-[60px]">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <Users size={12} /> População
                </div>
                <span className="text-lg font-bold">{stats.population}</span>
            </div>
            <div className="flex flex-col items-center min-w-[60px]">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <Smile size={12} /> Felicidade
                </div>
                <span className={cn("text-lg font-bold", stats.happiness < 50 ? "text-red-500" : "text-emerald-400")}>
                    {stats.happiness}%
                </span>
            </div>
            {stats.unemployed > 0 && (
                <div className="flex flex-col items-center min-w-[60px]">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <Briefcase size={12} /> Desemprego
                    </div>
                    <span className="text-lg font-bold text-yellow-500">
                        {(stats.unemployed / (stats.population || 1) * 100).toFixed(0)}%
                    </span>
                </div>
            )}
             <div className="flex flex-col items-center min-w-[60px]">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <ShieldAlert size={12} /> Segurança
                </div>
                <span className={cn("text-lg font-bold", stats.securityLevel < 50 ? "text-red-500" : "text-blue-400")}>
                    {stats.securityLevel}%
                </span>
            </div>
          </div>

          {/* LADO DIREITO: DINHEIRO */}
          <div className="pointer-events-auto mt-2">
            <Badge className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-lg px-6 py-2 border-2 border-white/20 shadow-lg shadow-amber-900/20 transition-transform hover:scale-105 cursor-default">
              <Coins className="w-5 h-5 mr-2 fill-slate-900/20" /> 
              {student.resources?.gold ?? 0}
            </Badge>
          </div>
        </div>
      </div>


        {/* MENU DE SELEÇÃO */}
        {selectedBuildingId && selectedConfig && !activeBuild && (
            inEditMode = true,
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-200 pointer-events-auto">
                <Badge className="bg-white text-slate-900 px-4 py-1 text-sm font-bold shadow-xl border-2 border-slate-200 mb-2">
                    {selectedConfig.name}
                </Badge>
                <div className="flex gap-2">
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
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-auto">
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
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-4 flex flex-col gap-2 animate-in slide-in-from-bottom-10 pointer-events-auto">
              {/* Abas de Categoria */}
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

            {/* Container Principal da Lista */}
            <div className="bg-slate-900/95 backdrop-blur border border-slate-600 p-2 rounded-2xl rounded-tl-none shadow-2xl flex items-center gap-2">
                
                <button
                  onClick={() => { const el = document.getElementById('buildScroll'); if(el) el.scrollBy({left: -200, behavior: 'smooth'}) }}
                  className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors shrink-0"
                >
                    <span className="text-2xl pb-1 block">&#8249;</span>
                </button>

                <div 
                    id="buildScroll" 
                    className="flex gap-2 overflow-x-auto flex-1 scroll-smooth py-2 px-1" 
                    style={{scrollbarWidth:'none', msOverflowStyle:'none'}}
                >
                    {filteredBuildings.length > 0 ? (
                    filteredBuildings.map(([key, config]) => {
                        const isSelected = activeBuild === key
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveBuild(isSelected ? null : key)}
                                className={cn(
                                    "relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-28 h-32 shrink-0 border border-transparent",
                                    isSelected ? "bg-indigo-600 scale-105 shadow-lg ring-2 ring-white" : "hover:bg-slate-800 hover:border-slate-700"
                                )}
                            >
                                {config.iconImage ? (
                                    <img
                                        src={config.iconImage}
                                        alt={config.name}
                                        className={cn("w-16 h-16 rounded-md object-contain mb-2 transition-all", isSelected ? "ring-2 ring-white/50" : "opacity-90 group-hover:opacity-100")}
                                    />
                                ) : (
                                    <div className={cn("p-3 rounded-full mb-2 transition-colors", isSelected ? "bg-white text-indigo-600" : "bg-slate-800 text-slate-300 group-hover:bg-slate-700")}>
                                        <config.icon size={28} />
                                    </div>
                                )}
                                <span className={cn("text-xs font-bold text-center line-clamp-1 w-full", isSelected ? "text-white" : "text-slate-400")}>{config.name}</span>
                                <span className="text-[10px] text-yellow-500 font-mono mt-1">{config.cost} G</span>
                            </button>
                        )
                    })
                    ) : (
                    <div className="w-full text-center py-4">
                        <p className="text-slate-500 text-sm">Nenhum item nesta categoria ainda.</p>
                    </div>
                    )}
                </div>

                <button
                  onClick={() => { const el = document.getElementById('buildScroll'); if(el) el.scrollBy({left: 200, behavior: 'smooth'}) }}
                  className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  <span className="text-2xl pb-1 block">&#8250;</span>
                </button>
            </div>
        </div>
      )}
    </div>
  )
}