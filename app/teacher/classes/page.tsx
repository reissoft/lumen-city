// app/teacher/classes/page.tsx
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, PlusCircle, Users } from "lucide-react";

const prisma = new PrismaClient();

async function getTeacherAndClasses() {
  const cookieStore = cookies();
  const email = cookieStore.get("lumen_session")?.value;
  if (!email) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { email },
    include: {
      classes: { // Incluindo as turmas relacionadas
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { // Contando o número de alunos em cada turma
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
    <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Minhas Turmas</h1>
                    <p className="text-slate-500">Gerencie suas turmas e adicione alunos.</p>
                </div>
                <Link href="/teacher/classes/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                        <PlusCircle size={18} /> Criar Nova Turma
                    </Button>
                </Link>
            </div>

            {teacher.classes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {teacher.classes.map((c) => (
                        <Link href={`/teacher/classes/${c.id}`} key={c.id}>
                            <Card className="hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-lg">{c.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-end">
                                    <div className="flex items-center text-slate-500">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>{c._count.students} Aluno(s)</span>
                                    </div>
                                    <div className="flex items-center text-indigo-600 font-semibold mt-4 text-sm">
                                        Gerenciar Turma <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white p-12 rounded-lg shadow-sm border">
                    <Users className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-800">Nenhuma turma encontrada</h3>
                    <p className="mt-2 text-sm text-slate-500">Comece criando sua primeira turma para poder adicionar alunos.</p>
                    <div className="mt-6">
                    <Link href="/teacher/classes/new">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                           <PlusCircle size={18} className="mr-2" /> Criar Primeira Turma
                        </Button>
                    </Link>
                    </div>
                </div>
            )}
             <div className="mt-8">
                <Link href="/teacher">
                    <Button variant="outline">Voltar ao Painel</Button>
                </Link>
            </div>
        </div>
    </div>
  );
}
