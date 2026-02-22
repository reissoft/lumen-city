'use client';

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { toast } from 'sonner';
import { Pencil, Trash2, Search, Mail, KeyRound, ArrowLeft, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { AddTeacherForm } from './add-teacher-form';
import { EditTeacherForm } from './edit-teacher-form';
import { deleteTeacher, resetAndSendNewPassword } from './actions';

type Teacher = Prisma.TeacherGetPayload<{}>;

// --- COMPONENTES DE MODAL (Estilizados) ---
function AddTeacherModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-3xl shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white text-3xl z-10" aria-label="Fechar modal">&times;</button>
            <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Adicionar Novo Professor</h2>
                <AddTeacherForm onClose={onClose} />
            </div>
        </div>
    </div>
  );
}

function EditTeacherModal({ teacher, onClose }: { teacher: Teacher | null; onClose: () => void; }) {
  if (!teacher) return null;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-3xl shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white text-3xl z-10" aria-label="Fechar modal">&times;</button>
            <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Editar Professor</h2>
                <EditTeacherForm teacher={teacher} onClose={onClose} />
            </div>
        </div>
    </div>
  )
}

// --- ITEM DA LISTA DE PROFESSORES (Estilizado) ---
function TeacherListItem({ teacher, onEdit }: { teacher: Teacher, onEdit: (teacher: Teacher) => void }) {
    const [isDeletePending, startDeleteTransition] = useTransition();
    const [isPasswordPending, startPasswordTransition] = useTransition();

    const handleDelete = () => {
        toast.warning(`Tem certeza que deseja deletar ${teacher.name}?`, {
            action: { label: "Confirmar", onClick: () => startDeleteTransition(async () => {
                const result = await deleteTeacher(teacher.id);
                toast[result.success ? 'success' : 'error'](result.success || result.error);
            })},
            cancel: { label: "Cancelar",onClick: ()=>{} }
        });
    }

    const handlePasswordRecovery = () => {
        toast.warning(`Gerar e enviar uma nova senha para ${teacher.email}?`, {
            action: { label: "Confirmar", onClick: () => startPasswordTransition(async () => {
                const result = await resetAndSendNewPassword(teacher.id);
                toast[result.success ? 'success' : 'error'](result.success || result.error);
            })},
            cancel: { label: "Cancelar", onClick: ()=>{} }
        });
    }

    return (
        <li className="flex flex-col md:flex-row items-start md:items-center p-5 border-t border-white/10 transition-all duration-200 hover:bg-white/5">
            <div className="flex items-center space-x-4 flex-1 mb-4 md:mb-0">
                <div className="w-11 h-11 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center font-bold text-white text-lg">
                    {teacher.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-white">{teacher.name}</p>
                    <p className="text-sm text-white/60 flex items-center gap-1.5"><Mail size={14} /> {teacher.email}</p>
                </div>
            </div>

            <div className="flex items-center space-x-1.5 mt-4 md:mt-0">
                <button onClick={handlePasswordRecovery} disabled={isPasswordPending} className="p-2 rounded-full text-yellow-400 hover:bg-white/10 disabled:opacity-30" title="Resetar e enviar nova senha">
                    {isPasswordPending ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <KeyRound size={18} />}
                </button>
                <button onClick={() => onEdit(teacher)} className="p-2 rounded-full text-blue-400 hover:bg-white/10" title="Editar professor">
                    <Pencil size={18} />
                </button>
                <button onClick={handleDelete} disabled={isDeletePending} className="p-2 rounded-full text-red-500 hover:bg-white/10 disabled:opacity-30" title="Deletar professor">
                    {isDeletePending ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Trash2 size={18} />}
                </button>
            </div>
        </li>
    )
}

// --- COMPONENTE PRINCIPAL (Estilizado) ---
interface AdminTeachersPageProps {
  teachers: Teacher[];
}

export default function TeachersClientPage({ teachers }: AdminTeachersPageProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
        <div className="container mx-auto p-4 md:p-8 relative">
             <Link href="/admin" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md text-white hover:bg-white/20 rounded-full px-4 py-2 text-sm mb-8">
                <ArrowLeft size={16} />
                Voltar ao Painel
            </Link>

            <header className="mb-10 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold">Gestão de Professores</h1>
                    <p className="text-white/60">Adicione, edite e gerencie os professores da sua escola.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="font-bold py-6 px-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform flex items-center gap-2">
                    <PlusCircle size={20}/> Adicionar Professor
                </Button>
            </header>

            <AddTeacherModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditTeacherModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} />

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg">
                <div className="p-5 border-b border-white/10">
                    <div className="relative w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                        <Input 
                            type="text" 
                            placeholder="Pesquisar por nome ou e-mail..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            className="w-full bg-white/5 border-2 border-white/10 rounded-full p-3 pl-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <ul>
                    {filteredTeachers.length === 0 ? (
                        <p className="p-10 text-center text-white/50">Nenhum professor encontrado.</p>
                    ) : (
                        filteredTeachers.map((teacher) => <TeacherListItem key={teacher.id} teacher={teacher} onEdit={setEditingTeacher} />)
                    )}
                </ul>
            </div>
        </div>
    </div>
  );
}
