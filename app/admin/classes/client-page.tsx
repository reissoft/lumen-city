'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { createClass, updateClass } from './actions';
import { Class, Teacher, Student } from '@prisma/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Pencil, Users, PlusCircle } from 'lucide-react';

// --- TIPOS ---
type StudentDetails = Pick<Student, 'id' | 'name' | 'username'>;
type ClassWithDetails = Class & { teachers: Teacher[]; students: StudentDetails[]; };
interface AdminClassesPageClientProps { classes: ClassWithDetails[]; teachers: Teacher[]; }

// --- ESTILOS REUTILIZÁVEIS ---
const inputStyles = "w-full bg-white/5 border-2 border-white/20 rounded-lg p-2.5 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition";
const labelStyles = "block text-sm font-medium text-white/80 mb-2";
const modalContentStyles = "bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-3xl shadow-2xl text-white";

// --- BOTÕES DE SUBMISSÃO ---
function CreateSubmitButton() {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform">{pending ? 'Criando...' : 'Criar Turma'}</Button>;
}
function EditSubmitButton() {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform">{pending ? 'Salvando...' : 'Salvar Alterações'}</Button>;
}

// --- FORMULÁRIOS ---
function TeacherCheckboxGroup({ teachers, selected, onSelectionChange }: any) {
    const handleCheckboxChange = (id: string, isChecked: boolean) => {
        onSelectionChange(isChecked ? [...selected, id] : selected.filter((s: string) => s !== id));
    };
    return (
        <div className="space-y-3 max-h-52 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-4 custom-scrollbar">
            {teachers.map((teacher: Teacher) => (
                <div key={teacher.id} className="flex items-center space-x-3">
                    <Checkbox id={`teacher-${teacher.id}`} checked={selected.includes(teacher.id)} onCheckedChange={(c) => handleCheckboxChange(teacher.id, !!c)} className="border-white/50 data-[state=checked]:bg-blue-500" />
                    <Label htmlFor={`teacher-${teacher.id}`} className="font-normal text-white/90 cursor-pointer flex-1">{teacher.name}</Label>
                </div>
            ))}
        </div>
    );
}

// --- MODAIS ---
function ViewStudentsModal({ classData, isOpen, onOpenChange }: { classData: ClassWithDetails; isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={modalContentStyles}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Alunos em: {classData.name}</DialogTitle>
                </DialogHeader>
                <div className="my-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {classData.students.length > 0 ? (
                        <ul className="space-y-2">
                            {classData.students.map(student => (
                                <li key={student.id} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 p-3">
                                    <Link
                                        href={`/teacher/classes/${classData.id}/student/${student.id}`}
                                        className="font-medium text-white/90 hover:underline"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        {student.name}
                                    </Link>
                                    <span className="text-sm text-white/50">@{student.username}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-white/50 py-8">Nenhum aluno nesta turma.</p>
                    )}
                </div>
                <DialogFooter className="flex justify-end gap-2">
                    <DialogClose asChild><Button variant="outline" className="border-white/20 bg-transparent hover:bg-white/10 hover:text-white">Fechar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditClassDialog({ classData, allTeachers, isOpen, onOpenChange }: any) {
    const [state, action] = useFormState(updateClass, { error: null, success: null });
    const [selected, setSelected] = useState(classData.teachers.map((t: any) => t.id));

    useEffect(() => {
        if (state.success) { toast.success(state.success); onOpenChange(false); }
        if (state.error) { toast.error(state.error); }
    }, [state, onOpenChange]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={modalContentStyles}>
                <DialogHeader><DialogTitle className="text-2xl font-bold">Editar Turma</DialogTitle></DialogHeader>
                <form action={action} className="space-y-5 pt-2">
                    <input type="hidden" name="classId" value={classData.id} />
                    <div><Label htmlFor="name" className={labelStyles}>Nome da Turma</Label><Input id="name" name="name" defaultValue={classData.name} required className={inputStyles} /></div>
                    <div><Label className={labelStyles}>Professores</Label><TeacherCheckboxGroup teachers={allTeachers} selected={selected} onSelectionChange={setSelected} />{selected.map((id: string) => <input key={id} type="hidden" name="teacherIds" value={id} />)}</div>
                    {state.error && <p className="text-red-400 text-sm">{state.error}</p>}
                    <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                        <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto border-white/20 bg-transparent hover:bg-white/10 hover:text-white">Cancelar</Button></DialogClose>
                        <EditSubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- COMPONENTE PRINCIPAL ---
export default function AdminClassesPageClient({ classes, teachers }: AdminClassesPageClientProps) {
    const [createState, createAction] = useFormState(createClass, { error: null, success: null });
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

    const handleEditClick = (c: ClassWithDetails) => { setCurrentClass(c); setIsEditOpen(true); };
    const handleViewStudentsClick = (c: ClassWithDetails) => { setCurrentClass(c); setIsViewStudentsOpen(true); };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
            <div className="container mx-auto p-4 md:p-8 relative">
                <Link href="/admin" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 rounded-full px-4 py-2 text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> Voltar ao Painel
                </Link>

                <header className="mb-10 flex flex-wrap justify-between items-center gap-4">
                    <div><h1 className="text-4xl font-bold">Gestão de Turmas</h1><p className="text-white/60">Crie, edite e visualize as turmas da sua escola.</p></div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild><Button onClick={() => setSelectedCreate([])} className="font-bold py-6 px-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform flex items-center gap-2"><PlusCircle size={20}/> Adicionar Turma</Button></DialogTrigger>
                        <DialogContent className={modalContentStyles}>
                            <DialogHeader><DialogTitle className="text-2xl font-bold">Criar Nova Turma</DialogTitle></DialogHeader>
                            <form ref={createFormRef} action={createAction} className="space-y-5 pt-2">
                                <div><Label htmlFor="name" className={labelStyles}>Nome da Turma</Label><Input id="name" name="name" placeholder="Ex: 3º Ano A" required className={inputStyles}/></div>
                                <div><Label className={labelStyles}>Professores (Opcional)</Label><TeacherCheckboxGroup teachers={teachers} selected={selectedCreate} onSelectionChange={setSelectedCreate}/>{selectedCreate.map(id => <input key={id} type="hidden" name="teacherIds" value={id} />)}</div>
                                {createState.error && <p className="text-red-400 text-sm">{createState.error}</p>}
                                <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                                    <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto border-white/20 bg-transparent hover:bg-white/10 hover:text-white">Cancelar</Button></DialogClose>
                                    <CreateSubmitButton />
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg overflow-hidden">
                    <Table>
                        <TableHeader><TableRow className="border-b-white/10 hover:bg-transparent"><TableHead className="text-white/80">Nome</TableHead><TableHead className="text-white/80">Professores</TableHead><TableHead className="text-center text-white/80">Alunos</TableHead><TableHead className="text-right text-white/80">Ações</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {classes.map(cls => (
                                <TableRow key={cls.id} className="border-b-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">{cls.name}</TableCell>
                                    <TableCell className="text-white/80">{cls.teachers.map(t => t.name).join(', ') || <span className="text-white/40">Nenhum</span>}</TableCell>
                                    <TableCell className="text-center font-semibold text-white">{cls.students.length}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleViewStudentsClick(cls)} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"><Users className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(cls)} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"><Pencil className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {classes.length === 0 && <p className="text-center text-white/50 py-12">Nenhuma turma cadastrada ainda.</p>}
                </div>

                {currentClass && <EditClassDialog classData={currentClass} allTeachers={teachers} isOpen={isEditOpen} onOpenChange={setIsEditOpen} />}
                {currentClass && <ViewStudentsModal classData={currentClass} isOpen={isViewStudentsOpen} onOpenChange={setIsViewStudentsOpen} />}
            </div>
        </div>
    );
}
