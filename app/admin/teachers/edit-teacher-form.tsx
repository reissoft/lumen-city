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
      className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-4 rounded-full hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
    >
      {pending ? 'Salvando Alterações...' : 'Salvar Alterações'}
    </button>
  );
}

interface EditTeacherFormProps {
  teacher: Teacher;
  onClose: () => void;
}

const inputStyles = "w-full bg-white/5 border-2 border-white/20 rounded-lg p-2.5 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition";
const labelStyles = "block text-sm font-medium text-white/80 mb-1";
const readOnlyInputStyles = "w-full bg-black/10 border-2 border-white/10 rounded-lg p-2.5 text-white/50 cursor-not-allowed";

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
    <form ref={formRef} action={formAction} className="space-y-5">
        <div>
            <label htmlFor="name" className={labelStyles}>Nome Completo</label>
            <input type="text" id="name" name="name" defaultValue={teacher.name} className={inputStyles} required />
            {formState.errors?.name && <p className="text-red-400 text-sm mt-1">{formState.errors.name[0]}</p>}
        </div>

        <div>
            <label htmlFor="email" className={labelStyles}>E-mail</label>
            <input type="email" id="email" name="email" defaultValue={teacher.email} className={readOnlyInputStyles} required readOnly />
            {formState.errors?.email && <p className="text-red-400 text-sm mt-1">{formState.errors.email[0]}</p>}
        </div>

        <div>
            <label htmlFor="password" className={labelStyles}>Nova Senha</label>
            <input type="password" id="password" name="password" className={inputStyles} placeholder="Deixe em branco para não alterar" />
            {formState.errors?.password && <p className="text-red-400 text-sm mt-1">{formState.errors.password[0]}</p>}
        </div>
      
      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
