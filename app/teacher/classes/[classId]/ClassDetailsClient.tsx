// app/teacher/classes/[classId]/ClassDetailsClient.tsx
'use client';

import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User } from "lucide-react";
import { PageData } from "./page"; 
import Link from "next/link";

export default function ClassDetailsClient({ classData }: { classData: PageData['classData'] }) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
            <div className="container mx-auto p-4 md:p-8 relative">

                <Link href="/teacher/classes" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 rounded-full px-4 py-2 text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> Voltar para Turmas
                </Link>

                <header className="mb-10">
                    <h1 className="text-4xl font-bold">{classData.name}</h1>
                    <p className="text-white/60">Visualize os alunos da sua turma.</p>
                </header>

                <main className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-white/10 hover:bg-transparent">
                                <TableHead className="text-white/80">Nome</TableHead>
                                <TableHead className="text-white/80">Usuário</TableHead>
                                <TableHead className="text-right text-white/80">XP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classData.students.length > 0 ? (
                                classData.students.map(student => (
                                    <TableRow 
                                        key={student.id} 
                                        className="border-b-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/teacher/classes/${classData.id}/student/${student.id}`)}
                                    >
                                        <TableCell className="font-medium text-white flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                <User size={16} className="text-white/60"/>
                                            </div>
                                            {student.name}
                                        </TableCell>
                                        <TableCell className="text-white/70">@{student.username}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-bold">{student.xp} XP</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-48 text-white/50">
                                        Nenhum aluno nesta turma ainda.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </main>
            </div>
        </div>
    );
}
