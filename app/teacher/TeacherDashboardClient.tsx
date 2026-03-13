'use client'


import { useEffect, useTransition, useState } from 'react'; // 👈 Adicionei o useState aqui
import CreateCampaignForm from '@/components/CreateCampaignForm';
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';
import { toast } from "sonner";
import {
  LogOut, Users, CheckCircle2, TrendingUp, GraduationCap, Calendar,Trash2, Play, Settings, BookCopy, Shield, Pencil, HelpCircle, BarChart3, Sparkles,
  Bot,
  Coins,Info, X
} from "lucide-react";
import { logout } from "../auth/actions";
import { deleteActivity } from "../actions";
import NotificationBell from '@/components/notifications/NotificationBell';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const iconComponents: { [key: string]: React.ElementType } = {
  Users,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  BookCopy,
  Shield
};

interface Activity {
  id: string;
  title: string;
  description: string | null;
  type: string;
  difficulty: number;
  expiresAt?: string | null;
  reviewMaterials?: any[] | null;
  payload?: any;
}

export default function TeacherDashboardClient({ 
  teacherName, 
  activities, 
  stats,
  teacherId,
  classes,
  campaigns
}: { 
  teacherName: string, 
  activities: Activity[], 
  stats: any[],
  teacherId: string,
  classes: { id: string; name: string; }[],
  campaigns: any[]
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);{/* --- 👇 SEÇÃO DE CAMPANHAS DE IA 👇 --- */}
              <div className="mt-16 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                          <Sparkles className="text-indigo-400" size={24} />
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold text-white">Campanhas Ativas (IA)</h2>
                          <p className="text-white/60">Missões geradas automaticamente na cidade dos alunos.</p>
                      </div>
                  </div>
                  
                  {/* 👇 NOVO BOTÃO DE AJUDA 👇 */}
                  <Button 
                      variant="outline" 
                      onClick={() => setShowHelpModal(true)}
                      className="gap-2 bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full"
                  >
                      <Info size={18} /> Como funciona?
                  </Button>
                  {/* 👆 FIM DO BOTÃO DE AJUDA 👆 */}
              </div>

  useEffect(() => {
    const updated = searchParams.get("updated");
    if (updated === "true") {
      toast.success("Atividade salva com sucesso!");
      router.replace('/teacher', { scroll: false });
    }
  }, [searchParams, router]);

  const handleDelete = (activityId: string) => {
    toast.warning("Você tem certeza que quer deletar esta atividade?", {
        action: {
            label: "Deletar",
            onClick: () => {
                startDeleteTransition(async () => {
                    const formData = new FormData();
                    formData.append('id', activityId);
                    await deleteActivity(formData);
                    toast.success("Atividade deletada com sucesso!");
                });
            }
        },
        cancel: {
            label: "Cancelar", onClick: ()=>{}
        }
    });
  };

  const handleTest = (activity: Activity) => {
    const hasReviewMaterials = activity.reviewMaterials && Array.isArray(activity.reviewMaterials) && activity.reviewMaterials.length > 0;
    const baseUrl = hasReviewMaterials
      ? `/student/activity/${activity.id}/review`
      : `/student/play/${activity.id}`;
    const path = `${baseUrl}?from=teacher`;
    router.push(path);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
          <div className="container mx-auto p-4 md:p-8 relative">

              <header className="mb-12 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                      <Image src="/globe.svg" alt="Lumen Logo" width={48} height={48} className="opacity-80"/>
                      <div>
                          <h1 className="text-3xl md:text-4xl font-bold">Painel do Mestre</h1>
                          <p className="text-white/60">Bem-vindo(a), {teacherName}!</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <NotificationBell />
                      <Link href="/teacher/settings">
                          <Button variant="outline" size="icon" className="bg-white/10 border-white/20 rounded-full backdrop-blur-md hover:bg-white/20">
                              <Settings size={20} />
                          </Button>
                      </Link>
                      <form action={logout}>
                          <Button variant="outline" size="icon" className="bg-red-500/10 border-red-500/20 text-red-400 rounded-full backdrop-blur-md hover:bg-red-500/20 hover:text-red-300">
                              <LogOut size={20} />
                          </Button>
                      </form>
                  </div>
              </header>
              
              <section className="mb-12 flex flex-wrap justify-end items-center gap-4">
                  <Link href="/teacher/classes">
                      <Button variant="outline" className="font-semibold rounded-full bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors flex items-center gap-2 py-5 px-6">
                          <GraduationCap size={18} /> Minhas Turmas
                      </Button>
                  </Link>
                  {/* 👇 NOVO BOTÃO DA CAMPANHA DE IA 👇 */}
                  <Button 
                      onClick={() => setShowCampaignForm(!showCampaignForm)}
                      className="font-bold py-6 px-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                  >
                      <Sparkles size={18} className={showCampaignForm ? "animate-spin" : ""} /> 
                      {showCampaignForm ? "Fechar Formulário" : "Nova Campanha de Estudo"}
                  </Button>
                  {/* 👆 FIM DO BOTÃO DA CAMPANHA 👆 */}
                  <Link href="/teacher/create-activity">
                      <Button className="font-bold py-6 px-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform flex items-center gap-2">
                          ✨ Nova Atividade
                      </Button>
                  </Link>
              </section>

              {/* 👇 ADICIONE EXATAMENTE ESTE BLOCO AQUI 👇 */}
              {showCampaignForm && (
                  <div className="mb-12 animate-in slide-in-from-top-4 duration-500 fade-in">
                      <CreateCampaignForm teacherId={teacherId} classes={classes} />
                  </div>
              )}
              {/* 👆 FIM DO BLOCO DO FORMULÁRIO 👆 */}

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {stats.map((stat, i) => {
                      const Icon = iconComponents[stat.icon];
                      const isEngagementStat = stat.title === "Engajamento Médio";
                      return (
                          <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg p-6 flex flex-row items-center justify-between">
                              <div>
                                  {isEngagementStat ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1.5 cursor-help mb-1">
                                          <p className="text-sm font-medium text-white/60">{stat.title}</p>
                                          <HelpCircle className="h-4 w-4 text-white/50" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs bg-gray-950/80 backdrop-blur-lg border-white/20 text-white">
                                        <p>Mede a porcentagem de alunos (de todas as suas turmas) que realizaram pelo menos uma atividade até o momento.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <p className="text-sm font-medium text-white/60 mb-1">{stat.title}</p>
                                  )}
                                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                              </div>
                            {Icon && <Icon className={`h-8 w-8 text-white/50 ${stat.color}`} />}
                          </div>
                      );
                  })}
              </section>

              <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activities.map((activity) => {
                      const xpMaxReward = activity.payload?.xpMaxReward || 0;
                      const goldReward = activity.payload?.goldReward || 0;
                      const isExpired = activity.expiresAt && new Date(activity.expiresAt) < new Date();
                      return (
                      <div key={activity.id} className={`bg-white/5 backdrop-blur-lg border ${isExpired ? 'border-red-500/50' : 'border-white/10'} rounded-3xl shadow-lg hover:border-blue-500/50 transition-all flex flex-col p-6`}>
                          <header className="flex-grow mb-4">
                              <div className="flex justify-between items-start mb-3">
                                  <Badge className="bg-white/10 text-white/80 border-none font-medium">{activity.type}</Badge>
                                  <span className="text-xs text-white/50">Nível {activity.difficulty}</span>
                              </div>
                              {isExpired && (
                                <div className="text-xs font-semibold text-red-400">EXPIRADA</div>
                              )}
                              <h3 className="text-xl font-bold text-white">{activity.title}</h3>
                              <p className="text-sm line-clamp-2 mt-1 text-white/60">{activity.description}</p>
                              {activity.expiresAt && (
                                  <p className="text-xs text-white/50 mt-1">Expira em {new Date(activity.expiresAt).toLocaleDateString()}</p>
                              )}
                              <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                                  {xpMaxReward > 0 && (
                                      <div className="flex items-center gap-1.5 text-sm">
                                          <span className="text-lg">🎯</span>
                                          <span className="text-white/70">XP: <span className="font-bold text-cyan-300">{xpMaxReward}</span></span>
                                      </div>
                                  )}
                                  {goldReward > 0 && (
                                      <div className="flex items-center gap-1.5 text-sm">
                                          <span className="text-lg">💰</span>
                                          <span className="text-white/70">Ouro: <span className="font-bold text-yellow-300">{goldReward}</span></span>
                                      </div>
                                  )}
                              </div>
                          </header>
                          <footer className="mt-auto flex gap-2">
                              <Button 
                                  className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105 transition-transform font-bold"
                                  onClick={() => handleTest(activity)}
                              >
                                  <Play size={16} /> Testar
                              </Button>
                              <Link href={`/teacher/activity/${activity.id}/edit`} className='flex-1'>
                                <Button variant="outline" className="w-full gap-2 bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors font-medium"><Pencil size={14}/> Editar</Button>
                              </Link>
                              <Link href={`/teacher/activity/${activity.id}/stats`}>
                                <Button variant="outline" size="icon" className="aspect-square bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors" title="Ver estatísticas">
                                  <BarChart3 size={16} />
                                </Button>
                              </Link>
                              <Button 
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(activity.id)}
                                  disabled={isDeleting}
                                  className="aspect-square bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                              >
                                  <Trash2 size={16} />
                              </Button>
                          </footer>
                      </div>
                      );
                  })}
              </section>

              {activities.length === 0 && 
                  <div className="text-center py-16 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg">
                      <h3 className="text-xl font-bold">Nenhuma atividade criada ainda</h3>
                      <p className="text-white/60 mt-2 mb-6">Clique em "Nova Atividade" para começar a criar.</p>
                      <Link href="/teacher/create-activity">
                          <Button className="font-bold py-6 px-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                              ✨ Criar minha primeira atividade
                          </Button>
                      </Link>
                  </div>
              }

             

              {/* --- 👇 SEÇÃO DE CAMPANHAS DE IA 👇 --- */}
              <div className="mt-16 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                          <Sparkles className="text-indigo-400" size={24} />
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold text-white">Campanhas de Estudo Ativas</h2>
                          <p className="text-white/60">Missões geradas automaticamente na cidade dos alunos.</p>
                      </div>
                  </div>
                  
                  {/* 👇 NOVO BOTÃO DE AJUDA 👇 */}
                  <Button 
                      variant="outline" 
                      onClick={() => setShowHelpModal(true)}
                      className="gap-2 bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full"
                  >
                      <Info size={18} /> Como funciona?
                  </Button>
                  {/* 👆 FIM DO BOTÃO DE AJUDA 👆 */}
              </div>

              <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                  {campaigns && campaigns.length > 0 ? campaigns.map((campaign) => {
                      const isActive = new Date(campaign.endDate) >= new Date() && new Date(campaign.startDate) <= new Date();
                      const isExpired = new Date(campaign.endDate) < new Date();
                      
                      return (
                      <div key={campaign.id} className={`bg-slate-900/80 backdrop-blur-lg border ${isExpired ? 'border-red-500/30' : isActive ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/10'} rounded-3xl p-6 flex flex-col relative overflow-hidden`}>
                          
                          {/* Fundo decorativo */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                          <header className="flex-grow mb-4 relative z-10">
                              <div className="flex justify-between items-start mb-3">
                                  <Badge className={`${isActive ? 'bg-indigo-500 text-white' : isExpired ? 'bg-red-500/20 text-red-300' : 'bg-slate-700 text-slate-300'} border-none font-medium`}>
                                      {isActive ? 'Em Andamento' : isExpired ? 'Finalizada' : 'Agendada'}
                                  </Badge>
                                  <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                                      <Coins size={12} /> {campaign.rewardCoins}
                                  </span>
                              </div>
                              
                              <h3 className="text-xl font-bold text-white mb-1">{campaign.title}</h3>
                              
                              {/* Mostra a qual turma pertence */}
                              {campaign.classes && campaign.classes.length > 0 && (
                                  <div className="flex items-center gap-1 text-sm text-indigo-300 mb-3">
                                      <Users size={14} /> <span>{campaign.classes.map((c: any) => c.name).join(', ')}</span>
                                  </div>
                              )}

                              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700/50 text-sm text-slate-400">
                                  <div className="flex items-center gap-1.5">
                                      <Calendar size={14} className="text-emerald-400" />
                                      <span>{new Date(campaign.startDate).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                  <span className="text-slate-600">Até</span>
                                  <div className="flex items-center gap-1.5">
                                      <Calendar size={14} className={isExpired ? "text-red-400" : "text-emerald-400"} />
                                      <span>{new Date(campaign.endDate).toLocaleDateString('pt-BR')}</span>
                                  </div>
                              </div>
                          </header>

                          <footer className="mt-auto flex gap-2 relative z-10 pt-2">
                              {/* Botão de Editar aponta para uma futura página de edição */}
                              <Link href={`/api/campaigns/${campaign.id}/edit`} className="flex-1">
                                  <Button variant="secondary" className="w-full gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors">
                                      <Pencil size={14}/> Editar
                                  </Button>
                              </Link>
                              
                              {/* Se quiser adicionar o botão de deletar depois, ele fica aqui! */}
                              <Button variant="outline" size="icon" className="aspect-square bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors" title="Deletar">
                                  <Trash2 size={16} />
                              </Button>
                          </footer>
                      </div>
                      );
                  }) : (
                      <div className="col-span-full text-center py-12 bg-slate-900/50 border border-slate-800 rounded-3xl">
                          <Bot size={48} className="mx-auto text-slate-600 mb-3" />
                          <h3 className="text-lg font-bold text-slate-300">Nenhuma Campanha de Estudo</h3>
                          <p className="text-slate-500 text-sm mt-1">Clique em "Nova Campanha de Estudo" lá no topo para criar sua primeira missão.</p>
                      </div>
                  )}
              </section>
              {/* --- 👆 FIM DA SEÇÃO DE CAMPANHAS 👆 --- */}
          </div>
      </div>
      {showHelpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
                  
                  {/* Cabeçalho do Modal */}
                  <div className="bg-indigo-600/20 border-b border-indigo-500/20 p-6 flex justify-between items-start relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                      <div className="relative z-10">
                          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                              <Sparkles className="text-indigo-400" /> O Sistema de Campanhas IA
                          </h2>
                          <p className="text-indigo-200/80 text-sm mt-1">Como transformar textos em gameplay contínuo.</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white hover:bg-slate-800 relative z-10 rounded-full">
                          <X size={24} />
                      </Button>
                  </div>

                  {/* Corpo do Modal */}
                  <div className="p-6 md:p-8 space-y-6 text-slate-300">
                      
                      <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400">1</div>
                          <div>
                              <h3 className="text-lg font-bold text-white mb-1">O Material de Estudo</h3>
                              <p className="text-sm text-slate-400">O professor faz upload de um PDF ou cola um texto contendo o assunto que os alunos precisam estudar (ex: Revolução Francesa).</p>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl font-bold text-indigo-400">2</div>
                          <div>
                              <h3 className="text-lg font-bold text-white mb-1">A Mágica da IA</h3>
                              <p className="text-sm text-slate-400">Nosso sistema usa Inteligência Artificial para ler esse texto e gerar perguntas inéditas de múltipla escolha toda vez que for acionado, baseadas 100% no seu conteúdo.</p>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-400">3</div>
                          <div>
                              <h3 className="text-lg font-bold text-white mb-1">A Interrupção no Jogo</h3>
                              <p className="text-sm text-slate-400">Enquanto o aluno joga e constrói a cidade 3D, o "Conselheiro" o interrompe magicamente para fazer uma pergunta. Isso garante que ele estude de forma gamificada sem sair do jogo.</p>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl font-bold text-yellow-500">4</div>
                          <div>
                              <h3 className="text-lg font-bold text-white mb-1">Frequência e Recompensas</h3>
                              <p className="text-sm text-slate-400">A interrupção acontece com base no campo <strong>Vezes ao dia</strong> que você definiu. Acertar a pergunta concede moedas para o aluno comprar mais casas. Se ele errar, a IA explica o erro com base no seu texto!</p>
                          </div>
                      </div>

                  </div>

                  {/* Rodapé do Modal */}
                  <div className="bg-slate-950/50 p-6 flex justify-end">
                      <Button onClick={() => setShowHelpModal(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-bold rounded-full">
                          Entendi!
                      </Button>
                  </div>
              </div>
          </div>
      )}
      {/* --- 👆 FIM DO MODAL DE AJUDA 👆 --- */}
    </TooltipProvider>
  );
}
