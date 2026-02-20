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
  // Bind o ID do aluno para a action
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
        <div className="space-y-1">
            <label htmlFor="name" className="font-medium text-gray-700">Nome Completo</label>
            <input type="text" id="name" name="name" defaultValue={student.name} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div className="space-y-1">
            <label htmlFor="username" className="font-medium text-gray-700">Nome de Usuário</label>
            <input type="text" id="username" name="username" defaultValue={student.username} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" required />
        </div>
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
      
      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
