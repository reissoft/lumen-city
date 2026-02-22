'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import { createTeacher } from './actions'
import { toast } from 'sonner'

const initialState = { success: false, errors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-4 rounded-full hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
    >
      {pending ? 'Adicionando Professor...' : 'Adicionar Professor'}
    </button>
  );
}

const inputStyles = "w-full bg-white/5 border-2 border-white/20 rounded-lg p-2.5 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition";
const labelStyles = "block text-sm font-medium text-white/80 mb-1";

export function AddTeacherForm({ onClose }: { onClose: () => void }) {
  const [formState, formAction] = useFormState(createTeacher, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // @ts-ignore
    if (formState.errors?._form) {
      // @ts-ignore
        toast.error(formState.errors._form.join(", "));
    }
    if (formState.success) {
      toast.success("Professor adicionado com sucesso!");
      onClose();
    }
  }, [formState, onClose]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
        <div>
            <label htmlFor="name" className={labelStyles}>Nome Completo</label>
            <input type="text" id="name" name="name" className={inputStyles} required />
            {/* @ts-ignore */}
            {formState.errors?.name && <p className="text-red-400 text-sm mt-1">{formState.errors.name[0]}</p>}
        </div>

        <div>
            <label htmlFor="email" className={labelStyles}>E-mail</label>
            <input type="email" id="email" name="email" className={inputStyles} required />
            {/* @ts-ignore */}
            {formState.errors?.email && <p className="text-red-400 text-sm mt-1">{formState.errors.email[0]}</p>}
        </div>

        <div>
            <label htmlFor="password" className={labelStyles}>Senha Provisória</label>
            <input type="password" id="password" name="password" className={inputStyles} required />
            {/* @ts-ignore */}
            {formState.errors?.password && <p className="text-red-400 text-sm mt-1">{formState.errors.password[0]}</p>}
        </div>
      
      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
