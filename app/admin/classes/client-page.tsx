// app/admin/classes/client-page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createClass, updateClass } from './actions';
import { Class, Teacher } from '@prisma/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";

type ClassWithDetails = Class & {
    teachers: Teacher[];
    _count: { students: number };
};

interface AdminClassesPageClientProps {
    classes: ClassWithDetails[];
    teachers: Teacher[];
}

const initialFormState = { error: null, success: null };

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? 'Salvando...' : label}</Button>;
}

// Componente de seleção de professores simplificado com checkboxes
function TeacherCheckboxGroup({ teachers, selectedTeachers, onSelectionChange }: {
    teachers: Teacher[];
    selectedTeachers: string[];
    onSelectionChange: (selected: string[]) => void;
}) {
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
                    <Checkbox
                        id={`teacher-checkbox-${teacher.id}`}
                        checked={selectedTeachers.includes(teacher.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(teacher.id, !!checked)}
                    />
                    <Label htmlFor={`teacher-checkbox-${teacher.id}`} className="font-normal cursor-pointer flex-1">
                        {teacher.name}
                    </Label>
                </div>
            ))}
        </div>
    );
}


function EditClassDialog({ classData, allTeachers, isOpen, onOpenChange }: {
    classData: ClassWithDetails;
    allTeachers: Teacher[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [updateState, updateAction] = useFormState(updateClass, initialFormState);
    const [selected, setSelected] = useState(classData.teachers.map(t => t.id));

    useEffect(() => {
        if (updateState.success) {
            toast.success(updateState.success);
            onOpenChange(false);
        }
        if (updateState.error) {
            toast.error(updateState.error);
        }
    }, [updateState, onOpenChange]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Turma</DialogTitle>
                    <DialogDescription>Atualize o nome e os professores da turma.</DialogDescription>
                </DialogHeader>
                <form action={updateAction} className="space-y-4">
                    <input type="hidden" name="classId" value={classData.id} />
                    <div>
                        <Label htmlFor="name">Nome da Turma</Label>
                        <Input id="name" name="name" defaultValue={classData.name} required />
                    </div>
                    <div>
                        <Label>Professores</Label>
                        <TeacherCheckboxGroup teachers={allTeachers} selectedTeachers={selected} onSelectionChange={setSelected} />
                        {selected.map(id => (<input key={id} type="hidden" name="teacherIds" value={id} />))}
                    </div>
                    {updateState.error && <p className="text-red-500 text-sm">{updateState.error}</p>}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                        <SubmitButton label="Salvar Alterações" />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminClassesPageClient({ classes, teachers }: AdminClassesPageClientProps) {
    const [createState, createAction] = useFormState(createClass, initialFormState);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassWithDetails | null>(null);
    const [selectedCreate, setSelectedCreate] = useState<string[]>([]);
    const createFormRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (createState.success) {
            toast.success(createState.success);
            setIsCreateOpen(false);
            setSelectedCreate([]);
            createFormRef.current?.reset();
        }
        if (createState.error) {
            toast.error(createState.error);
        }
    }, [createState]);

    const handleEditClick = (classData: ClassWithDetails) => {
        setEditingClass(classData);
        setIsEditOpen(true);
    };

    return (
        <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Turmas</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild><Button onClick={() => setSelectedCreate([])}>Adicionar Turma</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nova Turma</DialogTitle>
                            <DialogDescription>Preencha os detalhes para criar uma nova turma.</DialogDescription>
                        </DialogHeader>
                        <form ref={createFormRef} action={createAction} className="space-y-4">
                            <div><Label htmlFor="name">Nome da Turma</Label><Input id="name" name="name" placeholder="Ex: Matemática Avançada" required /></div>
                            <div>
                                <Label>Professores</Label>
                                <TeacherCheckboxGroup teachers={teachers} selectedTeachers={selectedCreate} onSelectionChange={setSelectedCreate} />
                                {selectedCreate.map(id => (<input key={id} type="hidden" name="teacherIds" value={id} />))}
                            </div>
                            {createState.error && <p className="text-red-500 text-sm">{createState.error}</p>}
                            <DialogFooter><DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose><SubmitButton label="Criar Turma" /></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="bg-white p-6 rounded-lg shadow">
                <Table>
                    <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Professores</TableHead><TableHead>Alunos</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {classes.map(cls => (
                            <TableRow key={cls.id}>
                                <TableCell>{cls.name}</TableCell>
                                <TableCell>{cls.teachers.map(t => t.name).join(', ') || 'Nenhum professor'}</TableCell>
                                <TableCell>{cls._count.students}</TableCell>
                                <TableCell><Button variant="ghost" size="sm" onClick={() => handleEditClick(cls)}>Editar</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {editingClass && <EditClassDialog classData={editingClass} allTeachers={teachers} isOpen={isEditOpen} onOpenChange={setIsEditOpen} />}
        </div>
    );
}
