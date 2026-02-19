// app/teacher/TeacherDashboardClient.tsx
"use client"

import { useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { LogOut, Users, CheckCircle2, TrendingUp, GraduationCap, Trash2 } from "lucide-react";
import { logout } from "../auth/actions";
import { deleteActivity } from "../actions";

const iconComponents: { [key: string]: React.ElementType } = {
  Users,
  CheckCircle2,
  TrendingUp,
};

export default function TeacherDashboardClient({ teacherName, activities, stats }: { teacherName: string, activities: any[], stats: any[] }) {
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
            label: "Cancelar",
            onClick: () => {} 
        }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="absolute top-4 right-4">
        <form action={logout}>
          <Button variant="outline" size="sm" className="gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200">
            <LogOut size={16} /> Sair
          </Button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel do Mestre</h1>
            <p className="text-slate-500">Bem-vindo(a), {teacherName}! Gerencie suas atividades.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/teacher/students">
              <Button variant="outline" className="gap-2 bg-white hover:bg-slate-100 border-indigo-200 text-indigo-700">
                <GraduationCap size={18} /> Minha Turma
              </Button>
            </Link>
            <Link href="/teacher/create-activity">
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                ✨ Nova Atividade
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = iconComponents[stat.icon];
            return (
              <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                  {Icon && <Icon className={`h-4 w-4 ${stat.color}`} />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                  <p className="text-xs text-slate-400 mt-1">+5.2% no último mês</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-lg transition-shadow bg-white flex flex-col">
              <CardHeader className="flex-grow">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2">{activity.type}</Badge>
                  <span className="text-xs text-slate-400">Nível {activity.difficulty}</span>
                </div>
                <CardTitle className="text-lg">{activity.title}</CardTitle>
                <CardDescription className="line-clamp-2">{activity.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex gap-2">
                    <Link href={`/teacher/activity/${activity.id}/edit`} className="flex-1">
                       <Button variant="secondary" className="w-full">Editar</Button>
                    </Link>
                    <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(activity.id)}
                        disabled={isDeleting}
                        className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
