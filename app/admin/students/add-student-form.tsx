'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { createStudent } from './actions'
import { toast } from 'sonner'
import { IMaskInput } from 'react-imask';
import { Prisma } from '@prisma/client';

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
      className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Adicionando Aluno...' : 'Adicionar Aluno'}
    </button>
  );
}

export function AddStudentForm({ onClose, classes }: { onClose: () => void, classes: Class[] }) {
  const [formState, formAction] = useFormState(createStudent, initialState);

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
            <label htmlFor="name" className="font-medium text-gray-700">Nome Completo do Aluno</label>
            <input type="text" id="name" name="name" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div className="space-y-1">
            <label htmlFor="username" className="font-medium text-gray-700">Nome de Usuário</label>
            <input type="text" id="username" name="username" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" required />
        </div>
      </div>

      <div className="space-y-1">
          <label htmlFor="classId" className="font-medium text-gray-700">Turma</label>
          <select id="classId" name="classId" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
              <option value="">Nenhuma turma</option>
              {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
              ))}
          </select>
      </div>

      <hr className="my-6"/>

      {/* Campos do Responsável */}
      <h3 className="text-lg font-medium text-gray-800 mb-2">Dados do Responsável (Opcional)</h3>
       <div className="space-y-1">
            <label htmlFor="guardianName" className="font-medium text-gray-700">Nome do Responsável</label>
            <input type="text" id="guardianName" name="guardianName" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
            <label htmlFor="guardianEmail" className="font-medium text-gray-700">Email do Responsável</label>
            <input type="email" id="guardianEmail" name="guardianEmail" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
        </div>
         <div className="space-y-1">
            <label htmlFor="guardianPhone" className="font-medium text-gray-700">Telefone do Responsável</label>
            <IMaskInput
                mask="(00) 00000-0000"
                id="guardianPhone"
                name="guardianPhone"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                placeholder="(XX) XXXXX-XXXX"
            />
        </div>
      </div>

      <hr className="my-6"/>

       {/* Campo de Observações */}
        <div className="space-y-1">
            <label htmlFor="notes" className="font-medium text-gray-700">Observações</label>
            <textarea id="notes" name="notes" rows={3} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" placeholder="Alguma informação adicional sobre o aluno..."></textarea>
        </div>
      
      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
