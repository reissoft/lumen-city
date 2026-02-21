// app/admin/classes/client-page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { createClass, updateClass } from './actions';
import { Class, Teacher, Student } from '@prisma/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Pencil, Users } from 'lucide-react'; // Ícones

// --- TIPOS ATUALIZADOS ---
type StudentDetails = Pick<Student, 'id' | 'name' | 'username'>;

type ClassWithDetails = Class & {
    teachers: Teacher[];
    students: StudentDetails[]; // Em vez de _count, agora temos a lista de alunos
};

interface AdminClassesPageClientProps {
    classes: ClassWithDetails[];
    teachers: Teacher[];
}

// --- COMPONENTES AUXILIARES (sem grandes mudanças) ---
const initialFormState = { error: null, success: null };

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? 'Salvando...' : label}</Button>;
}

function TeacherCheckboxGroup({ teachers, selectedTeachers, onSelectionChange }: any) {
    const handleCheckboxChange = (teacherId: string, isChecked: boolean) => {
        const newSelection = isChecked
            ? [...selectedTeachers, teacherId]
            : selectedTeachers.filter(id => id !== teacherId);
        onSelectionChange(newSelection);
    };
    return (
        <div className="space-y-2 max-h-60 overflow-y-auto rounded-md border p-4">
            {teachers.map(teacher => (
                <div key={teacher.id} className="flex items-center space-x-2">
                    <Checkbox id={`teacher-${teacher.id}`} checked={selectedTeachers.includes(teacher.id)} onCheckedChange={(checked) => handleCheckboxChange(teacher.id, !!checked)} />
                    <Label htmlFor={`teacher-${teacher.id}`} className="font-normal cursor-pointer flex-1">{teacher.name}</Label>
                </div>
            ))}
        </div>
    );
}

// --- MODAL DE ALUNOS (NOVO COMPONENTE) ---
function ViewStudentsModal({ classData, isOpen, onOpenChange }: { classData: ClassWithDetails; isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
    if (!isOpen) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Alunos da Turma: {classData.name}</DialogTitle>
                    <DialogDescription>Abaixo estão todos os alunos atualmente matriculados nesta turma.</DialogDescription>
                </DialogHeader>
                <div className="my-4 max-h-[400px] overflow-y-auto pr-2">
                    {classData.students.length > 0 ? (
                        <ul className="space-y-2">
                            {classData.students.map(student => (
                                <li key={student.id} className="flex items-center justify-between rounded-md border p-3">
                                    <span className="font-medium">{student.name}</span>
                                    <span className="text-sm text-gray-500">@{student.username}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Nenhum aluno nesta turma.</p>
                    )}
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Link href="/admin/students" className="w-full sm:w-auto">
                         <Button variant="outline" className="w-full">Gerenciar Todos Alunos</Button>
                    </Link>
                    <DialogClose asChild><Button className="w-full sm:w-auto">Fechar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- MODAL DE EDIÇÃO (sem grandes mudanças) ---
function EditClassDialog({ classData, allTeachers, isOpen, onOpenChange }: any) {
    const [updateState, updateAction] = useFormState(updateClass, initialFormState);
    const [selected, setSelected] = useState(classData.teachers.map((t: any) => t.id));

    useEffect(() => {
        if (updateState.success) { toast.success(updateState.success); onOpenChange(false); }
        if (updateState.error) { toast.error(updateState.error); }
    }, [updateState, onOpenChange]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent> <DialogHeader> <DialogTitle>Editar Turma</DialogTitle> <DialogDescription>Atualize o nome e os professores da turma.</DialogDescription> </DialogHeader>
                <form action={updateAction} className="space-y-4">
                    <input type="hidden" name="classId" value={classData.id} />
                    <div> <Label htmlFor="name">Nome da Turma</Label> <Input id="name" name="name" defaultValue={classData.name} required /> </div>
                    <div> <Label>Professores</Label> <TeacherCheckboxGroup teachers={allTeachers} selectedTeachers={selected} onSelectionChange={setSelected} /> {selected.map((id: any) => (<input key={id} type="hidden" name="teacherIds" value={id} />))} </div>
                    {updateState.error && <p className="text-red-500 text-sm">{updateState.error}</p>}
                    <DialogFooter> <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose> <SubmitButton label="Salvar Alterações" /> </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- COMPONENTE PRINCIPAL DA PÁGINA (ATUALIZADO) ---
export default function AdminClassesPageClient({ classes, teachers }: AdminClassesPageClientProps) {
    const [createState, createAction] = useFormState(createClass, initialFormState);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewStudentsOpen, setIsViewStudentsOpen] = useState(false);
    const [currentClass, setCurrentClass] = useState<ClassWithDetails | null>(null);
    const [selectedCreate, setSelectedCreate] = useState<string[]>([]);
    const createFormRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (createState.success) {
            toast.success(createState.success);
            setIsCreateOpen(false);
            setSelectedCreate([]);
            createFormRef.current?.reset();
        }
        if (createState.error) { toast.error(createState.error); }
    }, [createState]);

    const handleEditClick = (classData: ClassWithDetails) => { setCurrentClass(classData); setIsEditOpen(true); };
    const handleViewStudentsClick = (classData: ClassWithDetails) => { setCurrentClass(classData); setIsViewStudentsOpen(true); };

    return (
        <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Turmas</h1>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                     <DialogTrigger asChild><Button onClick={() => setSelectedCreate([])}>Adicionar Turma</Button></DialogTrigger>
                     <DialogContent> <DialogHeader> <DialogTitle>Nova Turma</DialogTitle> <DialogDescription>Preencha os detalhes para criar uma nova turma.</DialogDescription> </DialogHeader> <form ref={createFormRef} action={createAction} className="space-y-4"> <div><Label htmlFor="name">Nome da Turma</Label><Input id="name" name="name" placeholder="Ex: 3º Ano A" required /></div> <div> <Label>Professores</Label> <TeacherCheckboxGroup teachers={teachers} selectedTeachers={selectedCreate} onSelectionChange={setSelectedCreate} /> {selectedCreate.map(id => (<input key={id} type="hidden" name="teacherIds" value={id} />))} </div> {createState.error && <p className="text-red-500 text-sm">{createState.error}</p>} <DialogFooter><DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose><SubmitButton label="Criar Turma" /></DialogFooter> </form> </DialogContent>
                </Dialog>
            </header>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <Table>
                    <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Professores</TableHead><TableHead className="text-center">Alunos</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {classes.map(cls => (
                            <TableRow key={cls.id}>
                                <TableCell className="font-medium">{cls.name}</TableCell>
                                <TableCell>{cls.teachers.map(t => t.name).join(', ') || <span className="text-gray-400">Nenhum</span>}</TableCell>
                                <TableCell className="text-center">{cls.students.length}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleViewStudentsClick(cls)} title="Ver Alunos">
                                        <Users className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(cls)} title="Editar Turma">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {currentClass && <EditClassDialog classData={currentClass} allTeachers={teachers} isOpen={isEditOpen} onOpenChange={setIsEditOpen} />}
            {currentClass && <ViewStudentsModal classData={currentClass} isOpen={isViewStudentsOpen} onOpenChange={setIsViewStudentsOpen} />}
        </div>
    );
}
