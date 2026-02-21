'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { updateStudent } from './actions'
import { toast } from 'sonner'
import { IMaskInput } from 'react-imask';
import { Prisma } from '@prisma/client'

type Student = Prisma.StudentGetPayload<{ include: { class: true } }>;
type Class = Prisma.ClassGetPayload<{}>;

const initialState = {
  error: '',
  success: ''
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-4 rounded-full hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
    >
      {pending ? 'Salvando Alterações...' : 'Salvar Alterações'}
    </button>
  );
}

interface EditStudentFormProps {
  student: Student;
  onClose: () => void;
  classes: Class[];
}

const inputStyles = "w-full bg-white/5 border-2 border-white/20 rounded-lg p-2.5 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition";
const labelStyles = "block text-sm font-medium text-white/80 mb-1";
const readOnlyInputStyles = "w-full bg-black/10 border-2 border-white/10 rounded-lg p-2.5 text-white/50 cursor-not-allowed";


export function EditStudentForm({ student, onClose, classes }: EditStudentFormProps) {
  const updateStudentWithId = updateStudent.bind(null, student.id);
  const [formState, formAction] = useFormState(updateStudentWithId, initialState);

  useEffect(() => {
    if (formState.error) {
      toast.error(formState.error);
    }
    if (formState.success) {
      toast.success(formState.success);
      onClose();
    }
  }, [formState, onClose]);

  return (
    <form action={formAction} className="space-y-5">
        {/* Campos do Aluno */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="name" className={labelStyles}>Nome Completo</label>
                <input type="text" id="name" name="name" defaultValue={student.name} className={inputStyles} required />
            </div>
            <div>
                <label htmlFor="username" className={labelStyles}>Nome de Usuário</label>
                <input type="text" id="username" name="username" defaultValue={student.username} className={readOnlyInputStyles} required readOnly />
            </div>
        </div>

        <div>
            <label htmlFor="classId" className={labelStyles}>Turma</label>
            <select id="classId" name="classId" defaultValue={student.classId || ''} className={inputStyles}>
                <option value="" className="bg-gray-800">Nenhuma turma</option>
                {classes.map(c => (
                    <option key={c.id} value={c.id} className="bg-gray-800">{c.name}</option>
                ))}
            </select>
        </div>

        <hr className="border-white/10"/>

        {/* Campos do Responsável */}
        <h3 className="text-lg font-semibold text-white">Dados do Responsável (Opcional)</h3>
        <div>
            <label htmlFor="guardianName" className={labelStyles}>Nome do Responsável</label>
            <input type="text" id="guardianName" name="guardianName" defaultValue={student.guardianName || ''} className={inputStyles} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="guardianEmail" className={labelStyles}>Email do Responsável</label>
                <input type="email" id="guardianEmail" name="guardianEmail" defaultValue={student.guardianEmail || ''} className={inputStyles} />
            </div>
            <div>
                <label htmlFor="guardianPhone" className={labelStyles}>Telefone do Responsável</label>
                <IMaskInput
                    mask="(00) 00000-0000"
                    id="guardianPhone"
                    name="guardianPhone"
                    defaultValue={student.guardianPhone || ''}
                    className={inputStyles}
                    placeholder="(XX) XXXXX-XXXX"
                />
            </div>
        </div>
        
        <hr className="border-white/10"/>

        {/* Campo de Observações */}
        <div>
            <label htmlFor="notes" className={labelStyles}>Observações</label>
            <textarea id="notes" name="notes" rows={3} defaultValue={student.notes || ''} className={inputStyles} placeholder="Alguma informação adicional sobre o aluno..."></textarea>
        </div>
      
      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
