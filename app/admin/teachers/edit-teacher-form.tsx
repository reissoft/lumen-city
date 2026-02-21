'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import { updateTeacher } from './actions'
import { toast } from 'sonner'
import { Prisma } from '@prisma/client';

type Teacher = Prisma.TeacherGetPayload<{}>;

const initialState = { success: false, errors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Salvando Alterações...' : 'Salvar Alterações'}
    </button>
  );
}

interface EditTeacherFormProps {
  teacher: Teacher;
  onClose: () => void;
}

export function EditTeacherForm({ teacher, onClose }: EditTeacherFormProps) {
  const updateTeacherWithId = updateTeacher.bind(null, teacher.id);
  const [formState, formAction] = useFormState(updateTeacherWithId, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formState.errors?._form) {
        toast.error(formState.errors._form.join(", "));
    }
    if (formState.success) {
      toast.success("Professor atualizado com sucesso!");
      onClose();
    }
  }, [formState, onClose]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
        <div className="space-y-1">
            <label htmlFor="name" className="font-medium text-gray-700">Nome Completo</label>
            <input type="text" id="name" name="name" defaultValue={teacher.name} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" required />
            {formState.errors?.name && <p className="text-red-500 text-sm mt-1">{formState.errors.name[0]}</p>}
        </div>

        <div className="space-y-1">
            <label htmlFor="email" className="font-medium text-gray-700">E-mail</label>
            <input type="email" id="email" name="email" defaultValue={teacher.email} className="w-full border-gray-200 bg-gray-100 text-gray-500 rounded-lg p-2 cursor-not-allowed" required readOnly />
            {formState.errors?.email && <p className="text-red-500 text-sm mt-1">{formState.errors.email[0]}</p>}
        </div>

        <div className="space-y-1">
            <label htmlFor="password" className="font-medium text-gray-700">Nova Senha</label>
            <input type="password" id="password" name="password" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" placeholder="Deixe em branco para não alterar" />
            {formState.errors?.password && <p className="text-red-500 text-sm mt-1">{formState.errors.password[0]}</p>}
        </div>
      
      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
