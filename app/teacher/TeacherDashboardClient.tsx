'use client'

import { useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';
import { toast } from "sonner";
import { LogOut, Users, CheckCircle2, TrendingUp, GraduationCap, Trash2, Play, Settings, BookCopy, Shield, Pencil } from "lucide-react";
import { logout } from "../auth/actions";
import { deleteActivity } from "../actions";
// 1. Importar o componente de notificações
import NotificationBell from '@/components/notifications/NotificationBell';

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
  reviewMaterials?: any[] | null; 
}

export default function TeacherDashboardClient({ teacherName, activities, stats }: { teacherName: string, activities: Activity[], stats: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDeleting, startDeleteTransition] = useTransition();

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
                {/* 2. Adicionar o sino de notificações */}
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
                <Link href="/teacher/create-activity">
                    <Button className="font-bold py-6 px-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform flex items-center gap-2">
                        ✨ Nova Atividade
                    </Button>
                </Link>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, i) => {
                    const Icon = iconComponents[stat.icon];
                    return (
                        <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg p-6 flex flex-row items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-white/60 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                            </div>
                           {Icon && <Icon className={`h-8 w-8 text-white/50 ${stat.color}`} />}
                        </div>
                    );
                })}
            </section>

            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activities.map((activity) => (
                    <div key={activity.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg hover:border-blue-500/50 transition-all flex flex-col p-6">
                        <header className="flex-grow mb-4">
                            <div className="flex justify-between items-start mb-3">
                                <Badge className="bg-white/10 text-white/80 border-none font-medium">{activity.type}</Badge>
                                <span className="text-xs text-white/50">Nível {activity.difficulty}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">{activity.title}</h3>
                            <p className="text-sm line-clamp-2 mt-1 text-white/60">{activity.description}</p>
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
                ))}
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
        </div>
    </div>
  );
}
