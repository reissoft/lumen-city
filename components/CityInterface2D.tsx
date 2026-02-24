'use client'

import { useState, useCallback } from 'react';
import StudentHeader from '@/app/student/StudentHeader';
import City2DCanvas from '@/components/City2DCanvas';
import { BUILDING_CONFIG, CATEGORIES, BuildingCategory } from '@/app/config/buildings';
import { buyBuilding } from "@/app/actions";
import { Hammer, Leaf, Route, Star, X, MousePointer2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Tipos
interface Student {
    id: string;
    name: string;
    username: string;
    xp: number;
    level: number;
    resources: { gold: number; wood: number; energy: number; science: number; } | null;
}

interface Building {
    type: string;
    x: number;
    y: number;
}

interface CityInterface2DProps {
    student: Student;
    buildings: Building[];
}

const CATEGORY_ICONS: Record<BuildingCategory, any> = {
  construction: Hammer,
  nature: Leaf,
  infrastructure: Route,
  special: Star
}

export default function CityInterface2D({ student, buildings: initialBuildings }: CityInterface2DProps) {
    const [localBuildings, setLocalBuildings] = useState<Building[]>(initialBuildings || []);
    const [activeBuild, setActiveBuild] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<BuildingCategory>('construction');

    const handleTileClick = useCallback(async (x: number, y: number) => {
        if (!activeBuild) return; // Só constrói se um item estiver ativo

        const clickedBuilding = localBuildings.find(b => b.x === x && b.y === y);
        if (clickedBuilding) {
            alert("Este local já está ocupado!");
            return;
        }

        // Otimisticamente atualiza a UI
        const newBuilding = { type: activeBuild, x, y };
        setLocalBuildings(prev => [...prev, newBuilding]);

        try {
            // Chama a server action para salvar no banco
            await buyBuilding(activeBuild, x, y);
        } catch (error) {
            console.error("Falha ao construir:", error);
            // Se der erro, reverte a UI
            setLocalBuildings(prev => prev.filter(b => b !== newBuilding));
            alert("Não foi possível construir. Verifique seus recursos e tente novamente.");
        }

        // Desativa o modo de construção após um clique
        setActiveBuild(null);

    }, [activeBuild, localBuildings]);

    const filteredBuildings = Object.entries(BUILDING_CONFIG).filter(
        ([_, config]) => config.category === activeCategory
    );

    return (
        <div className="h-screen bg-gray-900 text-white flex flex-col">
            <header className="p-4 border-b border-gray-700">
                <StudentHeader studentName={student.name} />
            </header>
            
            <main className="flex-grow relative">
                <City2DCanvas cityData={localBuildings} onTileClick={handleTileClick} />
                
                {/* AVISO DE CONSTRUÇÃO */}
                {activeBuild && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-20 animate-bounce">
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
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-20 w-full max-w-5xl px-4 flex flex-col gap-2">
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
                                        isSelected ? "bg-slate-800 text-white border-t border-x border-slate-600" : "bg-slate-900/80 text-slate-400 hover:bg-slate-800"
                                    )}
                                ><Icon size={16} /> {label}</button>
                            )
                        })}
                    </div>

                    <div className="bg-slate-800/95 backdrop-blur border border-slate-600 p-2 rounded-2xl rounded-tl-none shadow-2xl flex items-center gap-2">
                        <div className="flex gap-2 overflow-x-auto flex-1 scroll-smooth py-2 px-1">
                            {filteredBuildings.length > 0 ? (
                                filteredBuildings.map(([key, config]) => {
                                    const isSelected = activeBuild === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setActiveBuild(isSelected ? null : key)}
                                            className={cn("relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-28 h-32 shrink-0 border-2", isSelected ? "bg-indigo-600 border-white" : "border-transparent hover:bg-slate-700 hover:border-slate-500")}>
                                            <img src={config.iconImage} alt={config.name} className={cn("w-16 h-16 rounded-md object-contain mb-2 transition-all")} />
                                            <span className={cn("text-xs font-bold text-center line-clamp-1 w-full", isSelected ? "text-white" : "text-slate-300")}>{config.name}</span>
                                            <span className="text-[11px] text-yellow-400 font-mono mt-1">{config.cost} Ouro</span>
                                        </button>
                                    )
                                })
                            ) : (
                                <div className="w-full text-center py-4"><p className="text-slate-500 text-sm">Nenhuma construção nesta categoria.</p></div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
