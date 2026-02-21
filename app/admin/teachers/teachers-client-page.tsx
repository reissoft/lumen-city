'use client';

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { toast } from 'sonner';
import { Pencil, Trash2, Search, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTeacherForm } from './add-teacher-form';
import { EditTeacherForm } from './edit-teacher-form';
import { deleteTeacher, resetAndSendNewPassword } from './actions'; // Importa a nova ação

type Teacher = Prisma.TeacherGetPayload<{}>;

// --- Modals (sem alteração) ---
function AddTeacherModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl" aria-label="Fechar modal">&times;</button>
        <h2 className="text-2xl font-bold mb-6">Adicionar Novo Professor</h2>
        <AddTeacherForm onClose={onClose} />
      </div>
    </div>
  );
}

function EditTeacherModal({ teacher, onClose }: { teacher: Teacher | null; onClose: () => void; }) {
  if (!teacher) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl" aria-label="Fechar modal">&times;</button>
        <h2 className="text-2xl font-bold mb-6">Editar Professor</h2>
        <EditTeacherForm teacher={teacher} onClose={onClose} />
      </div>
    </div>
  )
}

// --- Componente do Item da Lista ---
function TeacherListItem({ teacher, onEdit }: { teacher: Teacher, onEdit: (teacher: Teacher) => void }) {
    const [isDeletePending, startDeleteTransition] = useTransition();
    const [isPasswordPending, startPasswordTransition] = useTransition(); // Novo estado de transição

    const handleDelete = () => {
        toast.warning(`Esta ação é irreversível. Tem certeza que deseja deletar ${teacher.name}?`, {
            action: {
                label: "Confirmar Deleção",
                onClick: () => startDeleteTransition(async () => {
                    const result = await deleteTeacher(teacher.id);
                    toast[result.success ? 'success' : 'error'](result.success ? "Professor deletado com sucesso!" : result.error);
                })
            },
            cancel: { label: "Cancelar" }
        });
    }

    const handlePasswordRecovery = () => {
        toast.warning(`Uma nova senha será gerada e enviada para ${teacher.email}. Deseja continuar?`, {
            action: {
                label: "Confirmar",
                onClick: () => startPasswordTransition(async () => {
                    const result = await resetAndSendNewPassword(teacher.id);
                    if (result.success) {
                        toast.success(`Nova senha enviada para ${teacher.name} com sucesso!`);
                    } else {
                        toast.error(result.error || "Falha ao enviar e-mail.");
                    }
                })
            },
            cancel: { label: "Cancelar" }
        });
    }

    return (
        <li className="flex items-center p-4 border-t transition-colors hover:bg-slate-50">
            <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                    {teacher.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-slate-800">{teacher.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span className="flex items-center"><Mail size={14} className="mr-1" /> {teacher.email}</span>
                    </div>
                </div>
            </div>

            <div className="pl-6 flex items-center space-x-2">
                 <button onClick={handlePasswordRecovery} disabled={isPasswordPending} className="p-2 rounded-md text-yellow-600 hover:bg-yellow-100 hover:text-yellow-800 disabled:text-yellow-300 transition-colors" title="Resetar e enviar nova senha">
                    {isPasswordPending ? <div className="w-[18px] h-[18px] border-2 border-yellow-300 border-t-transparent rounded-full animate-spin"></div> : <KeyRound size={18} />}
                </button>
                
                <div className="h-6 w-px bg-slate-200"></div>

                <button onClick={() => onEdit(teacher)} className="p-2 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors" title="Editar professor"><Pencil size={18} /></button>
                <button onClick={handleDelete} disabled={isDeletePending} className="p-2 rounded-md text-red-600 hover:bg-red-100 hover:text-red-800 disabled:text-red-300 transition-colors" title="Deletar professor">
                    {isDeletePending ? <div className="w-[18px] h-[18px] border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div> : <Trash2 size={18} />}
                </button>
            </div>
        </li>
    )
}

// --- Componente Principal da Página (sem alteração de lógica) ---
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
    <div className="p-4 sm:p-8">
        <Button variant="ghost" asChild className="mb-6 gap-2">
            <Link href="/admin"><ArrowLeft size={16} /> Voltar</Link>
        </Button>

      <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Professores</h1>
          <p className="text-slate-500">Adicione, edite e gerencie os professores da sua escola.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 shadow transition-transform transform hover:scale-105">
          + Adicionar Professor
        </button>
      </header>

      <AddTeacherModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditTeacherModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar por nome ou e-mail..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>

        <ul>
          {filteredTeachers.length === 0 ? (
            <p className="p-10 text-center text-slate-500">Nenhum professor encontrado.</p>
          ) : (
            filteredTeachers.map((teacher) => <TeacherListItem key={teacher.id} teacher={teacher} onEdit={setEditingTeacher} />)
          )}
        </ul>
      </div>
    </div>
  );
}
