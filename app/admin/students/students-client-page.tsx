'use client';

import { useState, useTransition, useMemo } from 'react';
import { Prisma } from '@prisma/client';
import { toast } from 'sonner';
import { Pencil, Trash2, Search, Mail, Phone, ToggleLeft, ToggleRight, UserSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AddStudentForm } from './add-student-form';
import { EditStudentForm } from './edit-student-form';
import { 
    deleteStudent, 
    resetAndSendNewPasswordViaEmail, 
    resetAndSendNewPasswordViaWhatsApp, 
    toggleStudentActiveStatus 
} from './actions';
import { StudentAvatar } from './avatar';

type StudentWithDetails = Prisma.StudentGetPayload<{ include: { class: true } }>;
type Class = Prisma.ClassGetPayload<{}>;

// Componentes de Modal (Add e Edit) - Sem alterações
function AddStudentModal({ isOpen, onClose, classes }: { isOpen: boolean; onClose: () => void; classes: Class[] }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl" aria-label="Fechar modal">&times;</button>
        <h2 className="text-2xl font-bold mb-6">Adicionar Novo Aluno</h2>
        <AddStudentForm onClose={onClose} classes={classes} />
      </div>
    </div>
  );
}

function EditStudentModal({ student, onClose, classes }: { student: StudentWithDetails | null; onClose: () => void; classes: Class[] }) {
  if (!student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl" aria-label="Fechar modal">&times;</button>
        <h2 className="text-2xl font-bold mb-6">Editar Aluno</h2>
        <EditStudentForm student={student} onClose={onClose} classes={classes} />
      </div>
    </div>
  );
}

// Item da Lista de Alunos - Modificado com novos botões e lógica
function StudentListItem({ student, onEdit }: { student: StudentWithDetails, onEdit: (student: StudentWithDetails) => void }) {
  const [isTogglePending, startToggleTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isEmailPending, startEmailTransition] = useTransition();
  const [isWhatsAppPending, startWhatsAppTransition] = useTransition();

  const handleToggle = () => {
    startToggleTransition(async () => {
      const result = await toggleStudentActiveStatus(student.id, student.isActive);
      toast[result.success ? 'success' : 'error'](result.success || result.error);
    });
  };

  const handleDelete = () => {
    toast.warning(`Esta ação é irreversível. Tem certeza que deseja deletar ${student.name}?`, {
      action: { label: "Confirmar Deleção", onClick: () => startDeleteTransition(async () => {
        const result = await deleteStudent(student.id);
        toast[result.success ? 'success' : 'error'](result.success || result.error);
      }) },
      cancel: { label: "Cancelar" }
    });
  };

  const handleEmailRecovery = () => {
    toast.warning(`Uma nova senha será gerada e enviada para ${student.guardianEmail}. Deseja continuar?`, {
      action: { label: "Confirmar", onClick: () => startEmailTransition(async () => {
        const result = await resetAndSendNewPasswordViaEmail(student.id);
        toast[result.success ? 'success' : 'error'](result.success ? `Nova senha enviada para ${student.guardianEmail}!` : result.error);
      }) },
      cancel: { label: "Cancelar" }
    });
  };

  const handleWhatsAppRecovery = () => {
    toast.warning(`Uma nova senha será gerada e enviada via WhatsApp para ${student.guardianName}.`, {
      action: { label: "Confirmar", onClick: () => startWhatsAppTransition(async () => {
        const result = await resetAndSendNewPasswordViaWhatsApp(student.id);
        if (result.success) {
            toast.success("Mensagem enviada via WhatsApp com sucesso!");
        } else {
            toast.error(result.error || "Falha ao enviar mensagem.");
        }
      }) },
      cancel: { label: "Cancelar" }
    });
  };

  const itemClasses = `flex items-center p-4 border-t transition-all duration-200 ${!student.isActive ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50'}`;

  return (
    <li className={itemClasses}>
      <div className="flex items-center space-x-4 flex-1">
        <StudentAvatar name={student.name} />
        <div className="flex-1">
          <p className={`font-semibold ${!student.isActive ? 'text-slate-500' : 'text-slate-800'}`}>{student.name}</p>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span className="flex items-center"><UserSquare size={14} className="mr-1" /> @{student.username}</span>
            {student.class && <span className="flex items-center font-semibold text-blue-600">{student.class.name}</span>}
          </div>
        </div>
      </div>
      <div className="hidden md:block mx-8 text-sm text-slate-600">
        {student.guardianName && <p className="font-medium">{student.guardianName}</p>}
        <div>
            {student.guardianEmail && <p>{student.guardianEmail}</p>}
            {student.guardianPhone && <p>{student.guardianPhone}</p>}
        </div>
      </div>
      <div className="pl-6 flex items-center space-x-2">
        <button onClick={handleToggle} disabled={isTogglePending} className={`p-2 rounded-md transition-colors ${student.isActive ? 'text-gray-400 hover:text-green-600 hover:bg-green-100' : 'text-green-600 hover:text-green-800 hover:bg-green-100'}`} title={student.isActive ? 'Desativar aluno' : 'Ativar aluno'}>
          {isTogglePending ? <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div> : (student.isActive ? <ToggleRight /> : <ToggleLeft />)}
        </button>
        <div className="h-6 w-px bg-slate-200"></div>
        
        <button onClick={handleEmailRecovery} disabled={isEmailPending || !student.guardianEmail} className="p-2 rounded-md text-sky-600 hover:bg-sky-100 hover:text-sky-800 disabled:text-gray-300 transition-colors" title="Enviar nova senha por E-mail">
          {isEmailPending ? <div className="w-5 h-5 border-2 border-sky-300 border-t-transparent rounded-full animate-spin"></div> : <Mail />}
        </button>

        <button onClick={handleWhatsAppRecovery} disabled={isWhatsAppPending || !student.guardianPhone} className="p-2 rounded-md text-green-600 hover:bg-green-100 hover:text-green-800 disabled:text-gray-300 transition-colors" title="Enviar nova senha por WhatsApp">
          {isWhatsAppPending ? <div className="w-5 h-5 border-2 border-green-300 border-t-transparent rounded-full animate-spin"></div> : <Phone />}
        </button>
        
        <div className="h-6 w-px bg-slate-200"></div>

        <button onClick={() => onEdit(student)} className="p-2 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors" title="Editar aluno"><Pencil /></button>
        <button onClick={handleDelete} disabled={isDeletePending} className="p-2 rounded-md text-red-600 hover:bg-red-100 hover:text-red-800 disabled:text-red-300 disabled:bg-transparent transition-colors" title="Deletar aluno">
          {isDeletePending ? <div className="w-5 h-5 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div> : <Trash2 />}
        </button>
      </div>
    </li>
  );
}

// Componente Principal - Sem alterações significativas
export default function AdminStudentsPageClient({ students, classes }: { students: StudentWithDetails[]; classes: Class[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [showInactive, setShowInactive] = useState(true);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const nameMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const classMatch = selectedClass ? student.classId === selectedClass : true;
      const activityMatch = showInactive ? true : student.isActive;
      return nameMatch && classMatch && activityMatch;
    });
  }, [students, searchTerm, selectedClass, showInactive]);

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Alunos</h1>
          <p className="text-slate-500">Adicione, edite e gerencie todos os alunos da escola.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 shadow transition-transform transform hover:scale-105">+ Adicionar Aluno</Button>
      </header>

      <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} classes={classes} />
      <EditStudentModal student={editingStudent} onClose={() => setEditingStudent(null)} classes={classes} />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Pesquisar por nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 transition-shadow" />
            </div>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full sm:w-auto border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 transition-shadow">
                <option value="">Todas as turmas</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" checked={showInactive} onChange={() => setShowInactive(!showInactive)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm font-medium text-gray-700">Mostrar inativos</span>
          </label>
        </div>
        <ul>
          {filteredStudents.length === 0 ? <p className="p-10 text-center text-slate-500">Nenhum aluno encontrado.</p> : filteredStudents.map((student) => <StudentListItem key={student.id} student={student} onEdit={setEditingStudent} />)}
        </ul>
      </div>
    </div>
  );
}
