
// app/teacher/classes/[id]/ClassDetailsClient.tsx
"use client"

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus, Users, Trash2, Loader2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { addStudentToClass, assignStudentToClass, removeStudentFromClass } from "../actions";
import type { PageData } from './page';

// Botão de Submit Genérico
function SubmitButton({ children, icon }: { children: React.ReactNode, icon?: React.ReactNode }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (icon || null)}
            {children}
        </Button>
    );
}

export default function ClassDetailsClient({ classData, availableStudents }: PageData) {
    const [addState, addFormAction] = useFormState(addStudentToClass, null);
    const [assignState, assignFormAction] = useFormState(assignStudentToClass, null);
    const [removeState, removeFormAction] = useFormState(removeStudentFromClass, null);
    
    const addFormRef = useRef<HTMLFormElement>(null);

    // Efeito para toasts (notificações)
    useEffect(() => {
        const states = [addState, assignState, removeState];
        states.forEach(state => {
            if (state?.success) {
                toast.success(state.success);
                if (state === addState) addFormRef.current?.reset();
            }
            if (state?.error) {
                toast.error(state.error);
            }
        });
    }, [addState, assignState, removeState]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                     <Link href="/teacher/classes">
                        <Button variant="outline" className="gap-2 mb-4">
                            <ArrowLeft size={16} /> Voltar
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">Gerenciar Turma: {classData.name}</h1>
                    <p className="text-slate-500">Adicione, designe e gerencie os alunos desta turma.</p>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                    {/* Coluna 1: Criar ou Designar Aluno */}
                    <div className="space-y-8">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><UserCog size={20} /> Designar Aluno Existente</CardTitle>
                                <CardDescription>Adicione um aluno já cadastrado na escola a esta turma.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={assignFormAction}>
                                    <input type="hidden" name="classId" value={classData.id} />
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Aluno</Label>
                                            <Select name="studentId">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um aluno sem turma" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableStudents.length > 0 ? (
                                                        availableStudents.map(student => (
                                                            <SelectItem key={student.id} value={student.id}>{student.name} ({student.username})</SelectItem>
                                                        ))
                                                    ) : (
                                                        <p className="p-4 text-sm text-slate-500">Nenhum aluno disponível.</p>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <SubmitButton icon={<UserCog className="mr-2 h-4 w-4"/>}>Designar Aluno</SubmitButton>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><UserPlus size={20} /> Criar Novo Aluno</CardTitle>
                                <CardDescription>Crie uma nova conta de aluno e adicione-o diretamente.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form ref={addFormRef} action={addFormAction}>
                                    <input type="hidden" name="classId" value={classData.id} />
                                    <div className="space-y-4">
                                        <div><Label htmlFor="name">Nome</Label><Input id="name" name="name" required/></div>
                                        <div><Label htmlFor="username">Usuário</Label><Input id="username" name="username" required/></div>
                                        <div><Label htmlFor="password">Senha</Label><Input id="password" name="password" type="password" required/></div>
                                        <hr/>
                                        <div><Label htmlFor="email">Email (Opcional)</Label><Input id="email" name="email" type="email" /></div>
                                        <div><Label htmlFor="guardianEmail">E-mail do Responsável (Opcional)</Label><Input id="guardianEmail" name="guardianEmail" type="email" /></div>
                                        <div><Label htmlFor="guardianPhone">Telefone do Responsável (Opcional)</Label><Input id="guardianPhone" name="guardianPhone" /></div>
                                        <SubmitButton icon={<UserPlus className="mr-2 h-4 w-4"/>}>Criar e Adicionar</SubmitButton>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna 2: Alunos na Turma */}
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users size={20} /> Alunos na Turma</CardTitle>
                            <CardDescription>Total: {classData.students.length} aluno(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {classData.students.length > 0 ? (
                                    classData.students.map(student => (
                                        <div key={student.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md border">
                                            <div>
                                                <p className="font-semibold text-slate-800">{student.name}</p>
                                                {/* Mostra username em vez de email */}
                                                <p className="text-sm text-slate-500">@{student.username}</p>
                                            </div>
                                            <form action={removeFormAction}>
                                                <input type="hidden" name="studentId" value={student.id} />
                                                <input type="hidden" name="classId" value={classData.id} />
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </form>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-500 py-8">Ainda não há alunos nesta turma.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
