'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { toast } from 'sonner';
import { Pencil, Trash2, Search, Mail, Phone, ToggleLeft, ToggleRight, UserSquare, ArrowLeft, PlusCircle, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AddStudentForm } from './add-student-form';
import { EditStudentForm } from './edit-student-form';
import { StudentAvatar } from './avatar';
import { 
    deleteStudent, 
    resetAndSendNewPasswordViaEmail, 
    resetAndSendNewPasswordViaWhatsApp, 
    toggleStudentActiveStatus 
} from './actions';

type StudentWithDetails = Prisma.StudentGetPayload<{ include: { class: true } }>;
type Class = Prisma.ClassGetPayload<{}>;

// --- COMPONENTES DE MODAL (Estilizados) ---
function AddStudentModal({ isOpen, onClose, classes }: { isOpen: boolean; onClose: () => void; classes: Class[] }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-3xl shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white text-3xl z-10" aria-label="Fechar modal">&times;</button>
            <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Adicionar Novo Aluno</h2>
                <AddStudentForm onClose={onClose} classes={classes} />
            </div>
        </div>
    </div>
  );
}

function EditStudentModal({ student, onClose, classes }: { student: StudentWithDetails | null; onClose: () => void; classes: Class[] }) {
  if (!student) return null;
  return (
     <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-3xl shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white text-3xl z-10" aria-label="Fechar modal">&times;</button>
            <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Editar Aluno</h2>
                <EditStudentForm student={student} onClose={onClose} classes={classes} />
            </div>
        </div>
    </div>
  );
}

// --- ITEM DA LISTA DE ALUNOS (Estilizado) ---
function StudentListItem({ student, onEdit }: { student: StudentWithDetails, onEdit: (student: StudentWithDetails) => void }) {
  const [isTogglePending, startToggleTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isEmailPending, startEmailTransition] = useTransition();
  const [isWhatsAppPending, startWhatsAppTransition] = useTransition();

  const createActionHandler = (transition: any, action: any, successMessage: string, errorMessage: string) => {
    transition(async () => {
      const result = await action();
      toast[result.success ? 'success' : 'error'](result.success ? successMessage : (result.error || errorMessage));
    });
  };

  const handleToggle = () => createActionHandler(startToggleTransition, () => toggleStudentActiveStatus(student.id, student.isActive), `Status de ${student.name} alterado.`, "Falha ao alterar status.");
  const handleDelete = () => toast.warning(`Tem certeza que deseja deletar ${student.name}? Esta ação é irreversível.`, {
    action: { label: "Confirmar Deleção", onClick: () => createActionHandler(startDeleteTransition, () => deleteStudent(student.id), `${student.name} deletado com sucesso.`, "Falha ao deletar aluno.") },
    cancel: { label: "Cancelar",onClick: () => {} }
  });
  const handleEmailRecovery = () => toast.warning(`Enviar nova senha para ${student.guardianEmail}?`, {
      action: { label: "Confirmar", onClick: () => createActionHandler(startEmailTransition, () => resetAndSendNewPasswordViaEmail(student.id), `Nova senha enviada para ${student.guardianEmail}!`, "Falha ao enviar e-mail.") },
      cancel: { label: "Cancelar",onClick: () => {} }
  });
  const handleWhatsAppRecovery = () => toast.warning(`Enviar nova senha via WhatsApp para ${student.guardianName}?`, {
      action: { label: "Confirmar", onClick: () => createActionHandler(startWhatsAppTransition, () => resetAndSendNewPasswordViaWhatsApp(student.id), "WhatsApp enviado com sucesso!", "Falha ao enviar WhatsApp.") },
      cancel: { label: "Cancelar",onClick: () => {} }
  });

  const itemClasses = `flex flex-col md:flex-row items-start md:items-center p-5 border-t border-white/10 transition-all duration-200 ${!student.isActive ? 'opacity-40' : 'hover:bg-white/5'}`;

  return (
    <li className={itemClasses}>
      <div className="flex items-center space-x-4 flex-1 mb-4 md:mb-0">
        <StudentAvatar name={student.name} />
        <div className="flex-1">
          <p className="font-semibold text-white">{student.name}</p>
          <div className="flex items-center space-x-4 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><UserSquare size={14} /> @{student.username}</span>
            {student.class && <span className="font-semibold text-blue-400">{student.class.name}</span>}
          </div>
        </div>
      </div>
      <div className="hidden lg:block mx-8 text-sm text-white/60 text-left">
        {student.guardianName && <p className="font-medium text-white/80">{student.guardianName}</p>}
        <div>
            {student.guardianEmail && <p>{student.guardianEmail}</p>}
            {student.guardianPhone && <p>{student.guardianPhone}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-1.5 mt-4 md:mt-0">
        {[ { handler: handleToggle, isPending: isTogglePending, Icon: student.isActive ? ToggleRight : ToggleLeft, title: student.isActive ? 'Desativar' : 'Ativar', color: 'text-yellow-400', disabled: false }, { handler: handleEmailRecovery, isPending: isEmailPending, Icon: Mail, title: 'Enviar E-mail', color: 'text-sky-400', disabled: !student.guardianEmail }, { handler: handleWhatsAppRecovery, isPending: isWhatsAppPending, Icon: Phone, title: 'Enviar WhatsApp', color: 'text-green-400', disabled: !student.guardianPhone }, { handler: () => onEdit(student), isPending: false, Icon: Pencil, title: 'Editar', color: 'text-blue-400', disabled: false }, { handler: handleDelete, isPending: isDeletePending, Icon: Trash2, title: 'Deletar', color: 'text-red-500', disabled: false }].map((btn, i) => (
            <button key={i} onClick={btn.handler} disabled={btn.isPending || btn.disabled} className={`p-2 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${btn.color} hover:bg-white/10`} title={btn.title}>
              {btn.isPending ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <btn.Icon size={18} />}
            </button>
        ))}
        {student.classId && (
            <Link href={`/teacher/classes/${student.classId}/student/${student.id}`} className="p-2 rounded-full transition-colors text-indigo-400 hover:bg-white/10" title="Ver atividades">
                <BookOpen size={18} />
            </Link>
        )}
      </div>
    </li>
  );
}

// --- COMPONENTE PRINCIPAL (CORRIGIDO) ---
export default function AdminStudentsPageClient({ students, classes }: { students: StudentWithDetails[]; classes: Class[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all"); // CORREÇÃO 1: Valor inicial
  const [showInactive, setShowInactive] = useState(true);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
        (showInactive || s.isActive) && 
        (selectedClass === "all" ? true : s.classId === selectedClass) && // CORREÇÃO 2: Lógica do filtro
        (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [students, searchTerm, selectedClass, showInactive]);

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
                    <h1 className="text-4xl font-bold">Gestão de Alunos</h1>
                    <p className="text-white/60">Adicione, edite e gerencie todos os alunos da escola.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="font-bold py-6 px-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform flex items-center gap-2">
                    <PlusCircle size={20}/> Adicionar Aluno
                </Button>
            </header>

            <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} classes={classes} />
            <EditStudentModal student={editingStudent} onClose={() => setEditingStudent(null)} classes={classes} />

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg">
                <div className="p-5 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                        <Input type="text" placeholder="Pesquisar por nome ou usuário..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 rounded-full p-3 pl-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-2 border-white/10 rounded-full p-3">
                                <SelectValue placeholder="Todas as turmas" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900/80 backdrop-blur-lg border-white/20 text-white">
                                <SelectItem value="all">Todas as turmas</SelectItem> {/* CORREÇÃO 3: Valor do item */}
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2 bg-white/5 border-2 border-white/10 rounded-full px-4">
                            <Checkbox id="showInactive" checked={showInactive} onCheckedChange={() => setShowInactive(!showInactive)} className="border-white/30"/>
                            <label htmlFor="showInactive" className="text-sm font-medium text-white/80 whitespace-nowrap">Mostrar inativos</label>
                        </div>
                    </div>
                </div>
                <ul>
                    {filteredStudents.length === 0 ? <p className="p-10 text-center text-white/50">Nenhum aluno encontrado.</p> : filteredStudents.map((student) => <StudentListItem key={student.id} student={student} onEdit={setEditingStudent} />)}
                </ul>
            </div>
        </div>
    </div>
  );
}
