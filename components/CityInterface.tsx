'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import CityScene from "./CityScene"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, MousePointer2, Hammer, Leaf, Route, Star, RotateCw, Trash2, Loader2, Smartphone, Maximize, Minimize, ChevronDown, ChevronUp, Sun, Moon, Play, Pause, Calendar, Bell, Sparkles } from "lucide-react"
import { Users, Briefcase, Smile, ShieldAlert } from 'lucide-react';
import { buyBuilding, demolishBuildingAction, rotateBuildingAction, getServerDayConfig, rewardCampaignCoins } from "@/app/actions"
import { BUILDING_CONFIG, CATEGORIES, BuildingCategory } from '@/app/config/buildings'
import { toast } from "sonner";
import { cn } from '@/lib/utils'
import { useCityStats } from '@/app/hooks/useCityStats';
import { Input } from './ui/input'

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

export default function CityInterface({ student, buildings: initialBuildings, readOnly = false }: { student: any, buildings: any[], readOnly?: boolean }) {
  const canEdit = !readOnly;
  const [localBuildings, setLocalBuildings] = useState<BuildingData[]>(initialBuildings || []);
  const [activeBuild, setActiveBuild] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<BuildingCategory>('construction')
  const [isBuilding, setIsBuilding] = useState(false)
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const [buildRotation, setBuildRotation] = useState(0);

  // Controle do relógio do jogo
  const [gameTime, setGameTime] = useState(8);
  const [gameDay, setGameDay] = useState<number>(1);
  const [isTimePaused, setIsTimePaused] = useState(false); 

  // Busca o Dia real do servidor
  useEffect(() => {
    async function fetchGameDay() {
      try {
        const config = await getServerDayConfig();
        const timeElapsed = config.currentServerTime - config.cityStartDate;
        const daysPassed = Math.floor(timeElapsed / config.MS_PER_DAY);
        setGameDay(Math.max(1, daysPassed + 1));
      } catch (error) {
        console.error("Falha ao sincronizar o dia com o servidor:", error);
      }
    }
    fetchGameDay();
  }, []);

  // Aparência do Conselheiro
  const [advisorName, setAdvisorName] = useState('Conselheiro');
  const [advisorAvatar, setAdvisorAvatar] = useState('empty'); 

  // --- ESTADOS DA CAMPANHA DE ESTUDO (LIGADOS AO BANCO) ---
  const [activeQuest, setActiveQuest] = useState<{ question: string, studyMaterial: string, campaignId: string, rewardCoins: number } | null>(null);
  const [questAnswer, setQuestAnswer] = useState("");
  const [isSubmittingQuest, setIsSubmittingQuest] = useState(false);
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);
  const [questCooldown, setQuestCooldown] = useState(0);
  
  // Lista de campanhas ativas e um Dicionário para contar quantas vezes cada uma rodou hoje
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [campaignProgress, setCampaignProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (questCooldown > 0) {
      const timer = setTimeout(() => setQuestCooldown(questCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [questCooldown]);

  // Função que o botão vai chamar para travar o tempo e gerar a quest
  const handleManualQuestClick = () => {
      if (questCooldown > 0 || isGeneratingQuest) return;
      setQuestCooldown(60); // Trava o botão por 60 segundos
      triggerQuest();       // Chama a IA
  };

  // 1. Busca TODAS as Campanhas Ativas do Aluno
  useEffect(() => {
    if (!student || !student.classId) return;

    async function fetchActiveCampaigns() {
      try {
        const res = await fetch(`/api/campaigns/active?classId=${student.classId}`);
        const textResponse = await res.text(); 
        if (!textResponse) return;
        
        const data = JSON.parse(textResponse);
        if (data.success && data.campaigns && data.campaigns.length > 0) {
          setActiveCampaigns(data.campaigns);
          console.log(`📚 ${data.campaigns.length} Campanhas Encontradas para hoje!`);
        }
      } catch (error) {
        console.error("Erro ao buscar campanhas:", error);
      }
    }
    fetchActiveCampaigns();
  }, [student]);

  // Filtra as campanhas que AINDA NÃO atingiram o limite diário
  const availableCampaigns = activeCampaigns.filter(
    campaign => (campaignProgress[campaign.id] || 0) < campaign.dailyFrequency
  );

  // 2. O Relógio Aleatório de Quests
  useEffect(() => {
    // Se não tem campanhas disponíveis ou se o jogo não permite, aborta
    if (availableCampaigns.length === 0 || isTimePaused || activeQuest || isGeneratingQuest) {
      return;
    }

    const getRandomDelay = () => {
      const minSeconds = 5 * 60;  // 300 segundos
      const maxSeconds = 20 * 60; // 1200 segundos
      return (Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds) * 1000; 
    };

    const delay = getRandomDelay();
    console.log(`⌚ IA agendou a próxima Quest para daqui a ${delay / 1000} segundos! (${availableCampaigns.length} campanhas na fila)`);

    const timer = setTimeout(() => {
      triggerQuest(); 
    }, delay);

    return () => clearTimeout(timer);
  }, [isTimePaused, activeQuest, isGeneratingQuest, availableCampaigns.length]);

  // 3. Sorteia uma campanha válida e chama a IA
  const triggerQuest = async () => {
    // Filtra de novo para garantir que pegamos o estado mais recente
    const eligibleCampaigns = activeCampaigns.filter(
        c => (campaignProgress[c.id] || 0) < c.dailyFrequency
    );

    if (eligibleCampaigns.length === 0) return;

    // O SORTEIO MÁGICO! Escolhe uma campanha aleatória da lista
    const selectedCampaign = eligibleCampaigns[Math.floor(Math.random() * eligibleCampaigns.length)];

    setIsGeneratingQuest(true);

    try {
      const response = await fetch('/api/virtual-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_quest',
          studyMaterial: selectedCampaign.studyMaterial,
          friendName: advisorName
        })
      });
      
      const data = await response.json();
      if (data.success && data.question) {
        setActiveQuest({
          question: data.question,
          studyMaterial: selectedCampaign.studyMaterial,
          campaignId: selectedCampaign.id,
          rewardCoins: selectedCampaign.rewardCoins 
        });
      }
    } catch (error) {
      toast.error("Erro ao gerar missão de estudo.");
    } finally {
      setIsGeneratingQuest(false);
    }
  };

  // 4. Envia a resposta para correção
  const submitQuestAnswer = async () => {
    if (!activeQuest || !questAnswer.trim()) return;
    setIsSubmittingQuest(true);

    try {
      const response = await fetch('/api/virtual-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate_quest',
          studyMaterial: activeQuest.studyMaterial,
          question: activeQuest.question,
          message: questAnswer,
          friendName: advisorName,
          campaignId: activeQuest.campaignId
        })
      });

      const data = await response.json();
      
      if (data.isCorrect) {
        await rewardCampaignCoins(activeQuest.rewardCoins);
        toast.success(`Acertou! +${activeQuest.rewardCoins} Moedas! \n${data.feedback}`, { duration: 6000 });
        
        // Adiciona +1 apenas no contador DESTA campanha específica!
        setCampaignProgress(prev => ({
            ...prev,
            [activeQuest.campaignId]: (prev[activeQuest.campaignId] || 0) + 1
        }));
        
        setActiveQuest(null);
        setQuestAnswer("");
      } else {
        toast.error(data.feedback, { duration: 6000 });
      }
    } catch (error) {
      toast.error("Erro ao avaliar a resposta.");
    } finally {
      setIsSubmittingQuest(false);
    }
  };

  // Busca Amigo Virtual
  useEffect(() => {
    async function loadAdvisor() {
      try {
        const response = await fetch('/api/virtual-friend');
        if (response.ok) {
          const data = await response.json();
          if (data.friendName) setAdvisorName(data.friendName);
          if (data.selectedAvatar) setAdvisorAvatar(data.selectedAvatar);
        }
      } catch (error) {
        console.error("Erro ao carregar o amigo virtual", error);
      }
    }
    loadAdvisor();
  }, []);

  const setPointerOverUI = (isOver: boolean) => {
    if (typeof window !== 'undefined') {
      window.isPointerOverUI = isOver;
    }
  };

  const handleAssetsLoaded = useCallback(() => {
     setTimeout(() => setIsLoading(false), 300);
  }, []);

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setBuildRotation(0);
    if (!activeBuild) {
        setPointerOverUI(false);
    }
  }, [activeBuild]);

  useEffect(() => {
    if (initialBuildings && initialBuildings.length > 0) {
        setLocalBuildings(initialBuildings);
    }
  }, [initialBuildings]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Erro ao ativar tela cheia: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleTileClick = useCallback(async (x: number, y: number) => {
    const clickedBuilding = localBuildings.find(b => b.x === x && b.y === y);
    if (!canEdit) {
      if (clickedBuilding) setSelectedBuildingId(clickedBuilding.id);
      else setSelectedBuildingId(null);
      return;
    }
    
    if (activeBuild) {
      if (clickedBuilding) { alert("Local ocupado!"); return; }
      setIsBuilding(true);
      const newBuilding = { id: Date.now(), type: activeBuild, x, y, rotation: buildRotation };
      setLocalBuildings([...localBuildings, newBuilding]);
      setIsBuilding(false);
      await buyBuilding(activeBuild, x, y, buildRotation);
      return;
    }
    
    if (clickedBuilding) setSelectedBuildingId(clickedBuilding.id);
    else setSelectedBuildingId(null);
  }, [activeBuild, localBuildings, canEdit, buildRotation]);

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
          setPointerOverUI(false); 
      }
  }

  const selectedBuildingData = localBuildings.find(b => b.id === selectedBuildingId);
  const selectedConfig = selectedBuildingData ? BUILDING_CONFIG[selectedBuildingData.type as keyof typeof BUILDING_CONFIG] : null;

  const filteredBuildings = Object.entries(BUILDING_CONFIG).filter(
    ([_, config]) => config.category === activeCategory
  )

  const stats = useCityStats(localBuildings, gameDay);

  const activeWarningsCount = [
    stats.population < stats.expectedPopulation,
    stats.securityLevel < 50,
    stats.unemployed > stats.population * 0.3 && stats.population > 0
  ].filter(Boolean).length;

  const isAdvisorOpen = useRef(false);

  const handleShowAdvisor = () => {
    if (isAdvisorOpen.current) {
      toast.dismiss('adv-pop');
      toast.dismiss('adv-sec');
      toast.dismiss('adv-emp');
      toast.dismiss('adv-ok');
      isAdvisorOpen.current = false;
      return;
    }

    isAdvisorOpen.current = true;
    let hasWarning = false;

    const notify = (id: string, title: string, message: string) => {
      toast(title, {
        id: id, 
        description: message,
        duration: 6000,
        onAutoClose: () => { isAdvisorOpen.current = false; },
        onDismiss: () => { isAdvisorOpen.current = false; },
        icon: (
        <div className="-ml-4 mr-3 w-10 h-10 rounded-full border-2 border-indigo-500 bg-slate-800 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
          <img 
            src={`/friends/${advisorAvatar}.png`} 
            alt={advisorName} 
            className="w-full h-full object-contain bg-white/10" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<svg class="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 20 20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>';
              }
            }}
          />
        </div>
      ),
      });
    };

    if (stats.population < stats.expectedPopulation) {
      notify('adv-pop', "Precisamos crescer!", `Sua cidade está com pouca população para a meta do Dia ${gameDay}. Construa mais casas!`);
      hasWarning = true;
    }
    if (stats.securityLevel < 50) {
      notify('adv-sec', "Atenção, Prefeito!", "A população está se sentindo insegura. A criminalidade está subindo! Construa delegacias.");
      hasWarning = true;
    }
    if (stats.unemployed > stats.population * 0.3 && stats.population > 0) {
      notify('adv-emp', "Falta de Empregos!", "Muitos cidadãos estão sem trabalho. Construa áreas comerciais ou industriais!");
      hasWarning = true;
    }

    if (!hasWarning) {
      notify('adv-ok', "Tudo em ordem!", "Sua cidade está prosperando de forma incrível! Continue o bom trabalho, Prefeito.");
    }
  };

  const isDaytime = gameTime >= 6 && gameTime < 18;

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black select-none">
        
        <div className="fixed inset-0 z-[100] bg-slate-950 md:hidden portrait:flex hidden flex-col items-center justify-center text-white p-8 text-center">
            <Smartphone className="w-16 h-16 mb-4 animate-pulse text-indigo-400" />
            <h2 className="text-2xl font-bold mb-2">Gire seu Dispositivo</h2>
            <p className="text-slate-400">Para uma melhor experiência, por favor, use o modo paisagem.</p>
        </div>

        <div className="w-full h-full portrait:hidden md:block">
            <CityScene 
                buildings={localBuildings} 
                onSelectTile={handleTileClick} 
                activeBuild={activeBuild} 
                selectedBuildingId={selectedBuildingId}
                onCancelBuild={() => {
                    setActiveBuild(null);
                    setPointerOverUI(false);
                }}
                onAssetsLoaded={handleAssetsLoaded}
                buildRotation={buildRotation}
                onTimeUpdate={setGameTime}
                isTimePaused={isTimePaused}
            />

            <div 
                onPointerEnter={() => setPointerOverUI(true)}
                onPointerLeave={() => setPointerOverUI(false)}
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
            
        {readOnly && (
            <div className="absolute top-0 left-0 w-full bg-red-500/20 text-white text-center py-1 z-40 font-semibold">
                Cidade de {student.name} (visualização – somente leitura)
            </div>
        )}
        <div 
                onPointerEnter={() => setPointerOverUI(true)}
                onPointerLeave={() => setPointerOverUI(false)}
                className="absolute top-0 left-0 w-full p-2 md:p-6 pointer-events-auto z-10"
            >
                <div className="flex justify-between items-start">
                    <div className="bg-slate-900/90 backdrop-blur p-2 md:p-4 rounded-xl border border-slate-700 flex gap-3 md:gap-6 text-white shadow-xl">
                        <div className="flex flex-col items-center border-r border-slate-700 pr-3 md:pr-6">
                            <div className="flex items-center gap-1 md:gap-2 text-slate-400 text-[10px] md:text-xs uppercase font-bold">
                                <Calendar size={12} className="text-emerald-400" /> Dia
                            </div>
                            <span className="text-base md:text-xl font-bold font-mono text-emerald-100">
                                {gameDay}
                            </span>
                        </div>
                        
                        <div className="flex items-center border-r border-slate-700 pr-3 md:pr-6 gap-2 md:gap-4">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 md:gap-2 text-slate-400 text-[10px] md:text-xs uppercase font-bold">
                                    {isDaytime ? <Sun size={12} className="text-yellow-400" /> : <Moon size={12} className="text-blue-300" />} 
                                    Hora
                                </div>
                                <span className={cn("text-base md:text-xl font-bold font-mono", isDaytime ? "text-white" : "text-blue-200")}>
                                    {formatTime(gameTime)}
                                </span>
                            </div>
                            
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white"
                                onClick={() => setIsTimePaused(!isTimePaused)}
                                title={isTimePaused ? "Retomar Tempo" : "Pausar Tempo"}
                            >
                                {isTimePaused ? <Play size={16} className="text-green-400" /> : <Pause size={16} className="text-yellow-400" />}
                            </Button>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 md:gap-2 text-slate-400 text-[10px] md:text-xs uppercase font-bold" title="População Atual / Meta do Mês">
                                <Users size={12} /> População
                            </div>
                            <span className="text-base md:text-xl font-bold">
                                {stats.population} <span className="text-slate-500 text-sm md:text-lg font-normal">/ {stats.expectedPopulation}</span>
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 md:gap-2 text-slate-400 text-[10px] md:text-xs uppercase font-bold"><Smile size={12} /> Felicidade</div>
                            <span className={cn("text-base md:text-xl font-bold", stats.happiness < 50 ? "text-red-500" : "text-green-400")}>{stats.happiness}%</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 md:gap-2 text-slate-400 text-[10px] md:text-xs uppercase font-bold"><Briefcase size={12} /> Desemprego</div>
                            <span className={cn("text-base md:text-xl font-bold", stats.unemployed > 0 ? "text-yellow-500" : "text-slate-200")}>{stats.unemployed}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 md:gap-2 text-slate-400 text-[10px] md:text-xs uppercase font-bold"><ShieldAlert size={12} /> Segurança</div>
                            <span className="text-base md:text-xl font-bold">{stats.securityLevel}%</span>
                        </div>
                    </div>

                    <div className="flex gap-2 absolute top-2 right-2 md:top-6 md:right-6">
                        
                        {/* 👇 BOTÃO DE QUEST COM ÍCONE E HINT 👇 */}
                        {activeCampaigns.length > 0 && (
                          <div className="relative group">
                              <Button 
                                  onClick={handleManualQuestClick}
                                  disabled={isGeneratingQuest || questCooldown > 0}
                                  variant="ghost"
                                  size="icon"
                                  title={
                                      isGeneratingQuest ? "Preparando desafio..." : 
                                      questCooldown > 0 ? `Novo desafio em ${questCooldown}s` : 
                                      "Nova Missão: Ganhar Moedas!"
                                  }
                                  className={cn(
                                      "bg-slate-900/80 backdrop-blur rounded-full w-10 h-10 md:w-12 md:h-12 shadow-xl border transition-all overflow-hidden",
                                      questCooldown === 0 && !isGeneratingQuest 
                                        ? "border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white animate-pulse" 
                                        : "border-slate-700 text-slate-500"
                                  )}
                              >
                                  {isGeneratingQuest ? (
                                      <Loader2 className="animate-spin" size={20} />
                                  ) : (
                                      <Sparkles size={20} />
                                  )}
                                  
                                  {/* Overlay escuro mostrando os segundos do cooldown */}
                                  {questCooldown > 0 && !isGeneratingQuest && (
                                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold bg-slate-900/90 rounded-full text-white">
                                          {questCooldown}s
                                      </span>
                                  )}
                              </Button>
                          </div>
                        )}
                        {/* 👆 ==================================== 👆 */}  
                        
                        <div className="relative">
                            <Button 
                                onClick={handleShowAdvisor}
                                variant="ghost"
                                size="icon"
                                className="bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur rounded-full w-10 h-10 md:w-12 md:h-12 shadow-xl border border-slate-700 transition-transform active:scale-95"
                                title="Falar com o Conselheiro"
                            >
                                <Bell size={20} />
                                {activeWarningsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 md:h-5 md:w-5 bg-red-600 border-2 border-slate-900 text-[9px] md:text-[10px] font-bold items-center justify-center text-white">
                                            {activeWarningsCount}
                                        </span>
                                    </span>
                                )}
                            </Button>
                        </div>
                        
                        <Button 
                            onClick={toggleFullscreen}
                            variant="ghost"
                            size="icon"
                            className="bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur rounded-full w-10 h-10 md:w-12 md:h-12 shadow-xl border border-slate-700"
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </Button>
                        <Button 
                            onClick={() => window.history.back()}
                            variant="ghost"
                            size="icon"
                            className="bg-slate-900/80 hover:bg-red-600 text-white backdrop-blur rounded-full w-10 h-10 md:w-12 md:h-12 shadow-xl border border-slate-700"
                            title="Sair da cidade"
                        >
                            <X size={20} />
                        </Button>
                    </div>
                </div>
            </div>

            {selectedBuildingId && selectedConfig && !activeBuild && canEdit && (
                <div 
                    onPointerEnter={() => setPointerOverUI(true)}
                    onPointerLeave={() => setPointerOverUI(false)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-30 flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-200"
                >
                    <Badge className="bg-white text-slate-900 px-4 py-1 text-sm font-bold shadow-xl border-2 border-slate-200 mb-2">
                        {selectedConfig.name}
                    </Badge>
                    <div className="flex gap-2">
                        <Button onClick={handleRotate} className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 shadow-xl border-2 border-white transition-transform hover:scale-110"><RotateCw className="w-6 h-6 text-white" /></Button>
                        <Button onClick={handleDelete} className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-500 shadow-xl border-2 border-white transition-transform hover:scale-110"><Trash2 className="w-5 h-5 text-white" /></Button>
                        <Button 
                            onClick={() => {
                                setSelectedBuildingId(null);
                                setPointerOverUI(false); 
                            }} 
                            className="h-12 w-12 rounded-full bg-slate-700 hover:bg-slate-600 shadow-xl border-2 border-white transition-transform hover:scale-110"
                        >
                            <X className="w-6 h-6 text-white" />
                        </Button>
                    </div>
                </div>
            )}

            {activeBuild && (
                <div 
                onPointerEnter={() => setPointerOverUI(true)}
                onPointerLeave={() => setPointerOverUI(false)}
                className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-auto z-20 animate-bounce"
                >
                <Badge className="bg-indigo-600 text-white px-4 md:px-6 py-1 md:py-2 text-sm md:text-lg shadow-xl border-2 border-white flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4" />
                    Construindo: {BUILDING_CONFIG[activeBuild as keyof typeof BUILDING_CONFIG]?.name}
                </Badge>
                    <div className="flex justify-center gap-4 mt-1">
                        <Button 
                            variant="secondary" 
                            className="h-12 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl border-2 border-white transition-transform active:scale-95 text-base font-bold" 
                            onClick={() => setBuildRotation(prev => (prev + 90) % 360)}
                        >
                            <RotateCw className="w-5 h-5 mr-2" /> Girar
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="h-12 px-6 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl border-2 border-white transition-transform active:scale-95 text-base font-bold border-0" 
                            onClick={() => {
                                setActiveBuild(null);
                                setPointerOverUI(false); 
                            }}
                        >
                            <X className="w-5 h-5 mr-2" /> Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {!selectedBuildingId && !activeBuild && canEdit && (
              <div
                className="absolute bottom-2 md:bottom-4 right-2 md:right-4 z-30 pointer-events-auto"
                onPointerEnter={() => setPointerOverUI(true)}
                onPointerLeave={() => setPointerOverUI(false)}
              >
                <Button
                  onClick={() => {
                      setIsBottomBarVisible(!isBottomBarVisible);
                      if (isBottomBarVisible) setPointerOverUI(false); 
                  }}
                  variant="secondary"
                  size="icon"
                  className="bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur rounded-full w-10 h-10 md:w-12 md:h-12 shadow-lg border border-slate-700"
                >
                  {isBottomBarVisible ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </Button>
              </div>
            )}

            {isBottomBarVisible && !selectedBuildingId && canEdit && (
                <div 
                onPointerEnter={() => setPointerOverUI(true)}
                onPointerLeave={() => setPointerOverUI(false)}
                className="absolute bottom-1 md:bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto z-20 w-full max-w-5xl px-2 flex flex-col gap-1 animate-in slide-in-from-bottom-10 duration-300"
                >
                    <div className="flex justify-center gap-1">
                    {Object.entries(CATEGORIES).map(([key, label]) => {
                        const isSelected = activeCategory === key;
                        const Icon = CATEGORY_ICONS[key as BuildingCategory];
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key as BuildingCategory)}
                                className={cn(
                                "px-3 md:px-4 py-1 rounded-t-lg text-xs font-bold flex items-center gap-1.5 transition-all backdrop-blur",
                                isSelected ? "bg-slate-900/95 text-white border-t border-x border-slate-600" : "bg-slate-900/60 text-slate-400 hover:bg-slate-800"
                                )}
                            ><Icon size={12} /> <span className="hidden md:inline-block">{label}</span></button>
                        )
                    })}
                    </div>

                    <div className="bg-slate-900/95 backdrop-blur border border-slate-600 p-1 rounded-xl md:rounded-2xl rounded-tl-none shadow-2xl flex items-center gap-1">
                        <button onClick={() => { const el = document.getElementById('buildScroll'); if(el) el.scrollBy({left: -200, behavior: 'smooth'}) }} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors shrink-0 hidden md:block"><span className="text-2xl pb-1 block">&#8249;</span></button>
                        <div id="buildScroll" className="flex gap-1.5 overflow-x-auto flex-1 scroll-smooth px-1" style={{scrollbarWidth:'none', msOverflowStyle:'none'}}>
                            {filteredBuildings.length > 0 ? (
                            filteredBuildings.map(([key, config]) => {
                                const isSelected = activeBuild === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveBuild(isSelected ? null : key)}
                                        className={cn("relative group flex flex-col items-center justify-center p-1 rounded-md transition-all duration-200 w-16 h-20 md:w-28 md:h-32 shrink-0 border border-transparent", isSelected ? "bg-indigo-600 scale-105 shadow-lg ring-2 ring-white" : "hover:bg-slate-800 hover:border-slate-700")}>
                                        {config.iconImage ? (
                                            <img src={config.iconImage} alt={config.name} className={cn("w-9 h-9 md:w-16 md:h-16 rounded-md object-contain mb-1 transition-all", isSelected ? "ring-2 ring-white/50" : "opacity-90 group-hover:opacity-100")} />
                                        ) : (
                                            <div className={cn("p-1.5 rounded-full mb-1 md:p-3 md:mb-2", isSelected ? "bg-white text-indigo-600" : "bg-slate-800 text-slate-300 group-hover:bg-slate-700")}><config.icon size={16} /></div>
                                        )}
                                        <span className={cn("text-[9px] md:text-xs font-bold text-center line-clamp-1 w-full", isSelected ? "text-white" : "text-slate-400")}>{config.name}</span>
                                        <span className="text-[8px] md:text-[10px] text-yellow-500 font-mono">{config.cost} G</span>
                                    </button>
                                )
                            })
                            ) : (
                            <div className="w-full text-center py-4"><p className="text-slate-500 text-sm">Nenhum item nesta categoria ainda.</p></div>
                            )}
                        </div>
                        <button onClick={() => { const el = document.getElementById('buildScroll'); if(el) el.scrollBy({left: 200, behavior: 'smooth'}) }} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors shrink-0 hidden md:block"><span className="text-2xl pb-1 block">&#8250;</span></button>
                    </div>
                </div>
            )}
        </div>

            {/* --- MODAL DA QUEST DE ESTUDO --- */}
            {activeQuest && (
                <div
                    onPointerEnter={() => setPointerOverUI(true)}
                    onPointerLeave={() => setPointerOverUI(false)}
                className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl flex flex-col gap-6 transform transition-all">
                        
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full border-2 border-indigo-500 bg-slate-800 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
                                <img 
                                    src={`/friends/${advisorAvatar}.png`} 
                                    alt={advisorName} 
                                    className="w-full h-full object-contain bg-white/10" 
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="text-yellow-400" size={20} />
                                    Desafio do Prefeito!
                                </h3>
                                <p className="text-indigo-300 text-sm font-medium">{advisorName} tem uma pergunta:</p>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <p className="text-slate-200 text-base md:text-lg leading-relaxed">
                                "{activeQuest.question}"
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Input 
                                autoFocus
                                value={questAnswer}
                                onChange={(e) => setQuestAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submitQuestAnswer()}
                                placeholder="Digite sua resposta aqui..."
                                className="bg-slate-950 border-slate-700 text-white h-12 text-lg focus-visible:ring-indigo-500"
                                disabled={isSubmittingQuest}
                            />
                            <div className="flex justify-end gap-3 mt-2">
                                <Button 
                                    variant="ghost" 
                                    className="text-slate-400 hover:text-white"
                                    onClick={() => { setActiveQuest(null); setQuestAnswer(""); }}
                                    disabled={isSubmittingQuest}
                                >
                                    Pular por agora
                                </Button>
                                
                                <Button 
                                    onClick={submitQuestAnswer}
                                    disabled={isSubmittingQuest || !questAnswer.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                                >
                                    {isSubmittingQuest ? <Loader2 className="animate-spin" size={20} /> : "Responder"}
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

    </div>
  )
}