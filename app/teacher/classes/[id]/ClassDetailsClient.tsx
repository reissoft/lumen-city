// app/teacher/classes/[id]/ClassDetailsClient.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { PageData } from "./page"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClassDetailsClient({ classData }: { classData: PageData['classData'] }) {

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex items-center mb-6">
                <Link href="/teacher/classes">
                    <Button variant="outline" size="icon" className="mr-4">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{classData.name}</h1>
                    <p className="text-muted-foreground">Visualize os alunos da sua turma.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Alunos Matriculados</CardTitle>
                    <CardDescription>Esta é a lista de alunos atualmente nesta turma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Usuário</TableHead>
                                <TableHead className="text-right">XP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classData.students.length > 0 ? (
                                classData.students.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.username}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="secondary">{student.xp} XP</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        Nenhum aluno nesta turma ainda.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
