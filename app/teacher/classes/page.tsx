// app/teacher/classes/page.tsx
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, ArrowLeft, GraduationCap } from "lucide-react";

const prisma = new PrismaClient();

async function getTeacherAndClasses() {
  const cookieStore = cookies();
  const email = cookieStore.get("lumen_session")?.value;
  if (!email) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { email },
    include: {
      classes: { 
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { students: true }
            }
        }
      },
    },
  });

  if (!teacher) redirect("/login");

  return teacher;
}

export default async function ClassesDashboard() {
  const teacher = await getTeacherAndClasses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
        <div className="container mx-auto p-4 md:p-8 relative">
            
            <Link href="/teacher" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 rounded-full px-4 py-2 text-sm mb-8 transition-colors">
                <ArrowLeft size={16} /> Voltar ao Painel
            </Link>

            <header className="mb-10">
                <h1 className="text-4xl font-bold">Minhas Turmas</h1>
                <p className="text-white/60">Gerencie suas turmas e acompanhe seus alunos.</p>
            </header>

            {teacher.classes.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teacher.classes.map((c) => (
                        <Link href={`/teacher/classes/${c.id}`} key={c.id} className="block group">
                            <div className="h-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg hover:border-blue-500/50 transition-all p-6 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-2">{c.name}</h2>
                                    <div className="flex items-center text-white/60">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>{c._count.students} Aluno(s)</span>
                                    </div>
                                </div>
                                <div className="flex items-center text-blue-400 font-semibold mt-6 text-sm group-hover:gap-2 transition-all">
                                    Gerenciar Turma <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg py-16 px-6">
                    <GraduationCap className="mx-auto h-12 w-12 text-white/30" />
                    <h3 className="mt-4 text-xl font-bold text-white">Nenhuma turma encontrada</h3>
                    <p className="mt-2 text-sm text-white/60">As turmas às quais você está associado aparecerão aqui.</p>
                </div>
            )}
        </div>
    </div>
  );
}
