'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { updateStudent } from './actions'
import { toast } from 'sonner'
import { IMaskInput } from 'react-imask';
import { Prisma } from '@prisma/client'

type Student = Prisma.StudentGetPayload<{}>;

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
      className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Salvando Alterações...' : 'Salvar Alterações'}
    </button>
  );
}

interface EditStudentFormProps {
  student: Student;
  onClose: () => void;
}

export function EditStudentForm({ student, onClose }: EditStudentFormProps) {
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
    <form action={formAction} className="space-y-4">
        {/* Campos do Aluno */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label htmlFor="name" className="font-medium text-gray-700">Nome Completo</label>
                <input type="text" id="name" name="name" defaultValue={student.name} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="space-y-1">
                <label htmlFor="username" className="font-medium text-gray-700">Nome de Usuário</label>
                <input type="text" id="username" name="username" defaultValue={student.username} className="w-full border-gray-200 bg-gray-100 text-gray-500 rounded-lg p-2 cursor-not-allowed" required readOnly />
            </div>
        </div>

        <hr className="my-6"/>

        {/* Campos do Responsável */}
        <h3 class="text-lg font-medium text-gray-800 mb-2">Dados do Responsável (Opcional)</h3>
        <div className="space-y-1">
            <label htmlFor="guardianName" className="font-medium text-gray-700">Nome do Responsável</label>
            <input type="text" id="guardianName" name="guardianName" defaultValue={student.guardianName || ''} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label htmlFor="guardianEmail" className="font-medium text-gray-700">Email do Responsável</label>
                <input type="email" id="guardianEmail" name="guardianEmail" defaultValue={student.guardianEmail || ''} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
                <label htmlFor="guardianPhone" className="font-medium text-gray-700">Telefone do Responsável</label>
                <IMaskInput
                    mask="(00) 00000-0000"
                    id="guardianPhone"
                    name="guardianPhone"
                    defaultValue={student.guardianPhone || ''}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="(XX) XXXXX-XXXX"
                />
            </div>
        </div>
        
        <hr className="my-6"/>

        {/* Campo de Observações */}
        <div className="space-y-1">
            <label htmlFor="notes" className="font-medium text-gray-700">Observações</label>
            <textarea id="notes" name="notes" rows={3} defaultValue={student.notes || ''} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" placeholder="Alguma informação adicional sobre o aluno..."></textarea>
        </div>
      
      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
