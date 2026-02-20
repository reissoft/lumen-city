'use client'; 

import { useState, useTransition, useMemo } from 'react';
import { Prisma, Class } from '@prisma/client'; // Import Class type
import { AddStudentForm } from './add-student-form';
import { EditStudentForm } from './edit-student-form';
import { deleteStudent } from './actions';
import { toast } from 'sonner';
import { StudentAvatar } from './avatar';
import { Pencil, Trash2, Search } from 'lucide-react';

type StudentWithDetails = Prisma.StudentGetPayload<{ 
    include: { classes: true }
}>;

// --- COMPONENTES DA PÁGINA ---

function AddStudentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl" aria-label="Fechar modal">&times;</button>
        <h2 className="text-2xl font-bold mb-6">Adicionar Novo Aluno</h2>
        <AddStudentForm onClose={onClose} />
      </div>
    </div>
  );
}

function EditStudentModal({ student, onClose }: { student: StudentWithDetails | null; onClose: () => void; }) {
    if (!student) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl" aria-label="Fechar modal">&times;</button>
                <h2 className="text-2xl font-bold mb-6">Editar Aluno</h2>
                <EditStudentForm student={student} onClose={onClose} />
            </div>
        </div>
    )
}

function StudentListItem({ student, onEdit }: { student: StudentWithDetails, onEdit: (student: StudentWithDetails) => void }) {
  let [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    toast.warning(`Tem certeza que deseja deletar o aluno ${student.name}?`, {
        action: {
            label: "Confirmar",
            onClick: () => startTransition(async () => {
                const result = await deleteStudent(student.id);
                if (result?.error) toast.error(result.error);
                else if (result?.success) toast.success(result.success);
            })
        },
        cancel: { label: "Cancelar" }
    });
  }

  const classNames = student.classes.map(c => c.name).join(', ');

  return (
    <li className="flex items-center p-4 border-t hover:bg-slate-50 transition-colors duration-150">
        <div className="flex items-center space-x-4 flex-1">
            <StudentAvatar name={student.name} />
            <div className="flex-1">
                <p className="font-semibold text-slate-800">{student.name}</p>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <span>@{student.username}</span>
                    {classNames && <span className="font-semibold text-blue-600">({classNames})</span>}
                </div>
            </div>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-sm text-slate-600">
            <span>{student.guardianEmail}</span>
            <div className="text-center"><p className="font-medium">Nível</p><p>{student.level}</p></div>
            <div className="text-center"><p className="font-medium">XP</p><p>{student.xp}</p></div>
        </div>
        <div className="pl-6 flex items-center space-x-2">
             <button onClick={() => onEdit(student)} className="p-2 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors" title="Editar aluno"><Pencil size={18} /></button>
             <button onClick={handleDelete} disabled={isPending} className="p-2 rounded-md text-red-600 hover:bg-red-100 hover:text-red-800 disabled:text-red-300 disabled:bg-transparent transition-colors" title="Deletar aluno">
                {isPending ? <div className="w-[18px] h-[18px] border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div> : <Trash2 size={18} />}
             </button>
        </div>
    </li>
  )
}

// Props agora incluem as turmas para o filtro
interface AdminStudentsPageProps {
    students: StudentWithDetails[];
    classes: Class[];
}

export default function AdminStudentsPageClient({ students, classes }: AdminStudentsPageProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithDetails | null>(null);
  
  // 1. Estados para o filtro e pesquisa
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // 2. Lógica de filtragem
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
        const nameMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const classMatch = selectedClass ? student.classes.some(c => c.id === selectedClass) : true;
        return nameMatch && classMatch;
    });
  }, [students, searchTerm, selectedClass]);

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Alunos</h1>
          <p className="text-slate-500">Adicione, edite e gerencie todos os alunos da escola.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 shadow transition-transform transform hover:scale-105">+ Adicionar Aluno</button>
      </header>
      
      <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditStudentModal student={editingStudent} onClose={() => setEditingStudent(null)} />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* 3. Inputs de Filtro e Pesquisa */}
        <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text"
                    placeholder="Pesquisar por nome..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
            </div>
            <div className="flex-1 sm:max-w-xs">
                <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 transition-shadow"
                >
                    <option value="">Todas as turmas</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* 4. Renderização da lista filtrada */}
        <ul>
          {filteredStudents.length === 0 ? (
            <p className="p-10 text-center text-slate-500">Nenhum aluno encontrado com os filtros atuais.</p>
          ) : (
            filteredStudents.map((student) => <StudentListItem key={student.id} student={student} onEdit={setEditingStudent} />)
          )}
        </ul>
      </div>
    </div>
  );
}
