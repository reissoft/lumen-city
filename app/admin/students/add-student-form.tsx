'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { createStudent } from './actions'
import { toast } from 'sonner'
import { IMaskInput } from 'react-imask'; // 1. Importar o componente de máscara

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
      {pending ? 'Criando Aluno...' : 'Confirmar e Criar Aluno'}
    </button>
  );
}

export function AddStudentForm({ onClose }: { onClose: () => void }) {
  const [formState, formAction] = useFormState(createStudent, initialState);

  useEffect(() => {
    if (formState.error) {
      toast.error(formState.error);
    }
    if (formState.success) {
      toast.success(formState.success);
      onClose();
    }
    initialState.error = '';
    initialState.success = '';
  }, [formState, onClose]);

  return (
    <form action={formAction} className="space-y-4">
        <div className="space-y-1">
            <label htmlFor="name" className="font-medium text-gray-700">Nome Completo</label>
            <input type="text" id="name" name="name" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div className="space-y-1">
            <label htmlFor="username" className="font-medium text-gray-700">Nome de Usuário</label>
            <input type="text" id="username" name="username" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div className="space-y-1">
            <label htmlFor="guardianEmail" className="font-medium text-gray-700">Email do Responsável (Opcional)</label>
            <input type="email" id="guardianEmail" name="guardianEmail" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
        </div>
         <div className="space-y-1">
            <label htmlFor="guardianPhone" className="font-medium text-gray-700">Telefone do Responsável (Opcional)</label>
            {/* 2. Substituir o input normal pelo IMaskInput */}
            <IMaskInput
                mask="(00) 00000-0000"
                id="guardianPhone"
                name="guardianPhone"
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
