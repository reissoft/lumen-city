// app/student/settings/client-page.tsx

'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { toast } from 'sonner';
import { updateStudentProfile, updateVirtualFriendSettings } from './actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Settings } from 'lucide-react';
import StudentHeader from '../StudentHeader';
import VirtualFriend from '@/components/VirtualFriend';

const initialState = { error: null, success: null };

const cardStyles = `bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg`;
const inputStyles = `w-full bg-white/5 border-2 border-white/20 rounded-lg p-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition`;

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full font-bold py-4 px-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform flex items-center gap-2">
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar Alterações'}
        </Button>
    );
}

interface StudentData {
    name: string | null;
    email: string | null;
    username: string | null;
}

export default function StudentSettingsClientPage({ student }: { student: StudentData }) {
    {/* @ts-ignore */}
    const [state, formAction] = useFormState(updateStudentProfile, initialState);

    useEffect(() => {
        if (state.success) {
            toast.success(state.success);
        }
        if (typeof state.error === 'string') {
            toast.error(state.error);
        }
    }, [state]);

    const getFieldError = (fieldName: string) => {
        {/* @ts-ignore */}
        if (typeof state.error === 'object' && state.error && state.error[fieldName]) {
            {/* @ts-ignore */}
            return state.error[fieldName][0];
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
            <div className="container mx-auto p-4 md:p-8 relative max-w-3xl">
                
                <StudentHeader studentName={student.name || 'Aluno(a)'} />

                <Link href="/student" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 rounded-full px-4 py-2 text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> Voltar ao Painel
                </Link>

                <header className="mb-10">
                    <h1 className="text-4xl font-bold">Minha Conta</h1>
                    <p className="text-white/60">Atualize suas informações pessoais e de segurança.</p>
                </header>

                {/* Virtual Friend Configuration */}
                <div className={`${cardStyles} p-6 md:p-8 mb-8`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Amigo Virtual</h2>
                            <p className="text-white/60 text-sm">Personalize seu amigo virtual com avatar e nome</p>
                        </div>
                    </div>
                    
                    <div className="text-white/60 text-sm">
                        Clique no botão de configurações no canto superior direito do seu amigo virtual para personalizá-lo.
                    </div>
                </div>

                <form action={formAction} className={`${cardStyles} p-6 md:p-8`}>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="font-semibold">Usuário</Label>
                            <Input id="username" name="username" defaultValue={student.username ?? ''} disabled className={`${inputStyles} cursor-not-allowed opacity-60`} />
                            <p className='text-xs text-white/50'>O nome de usuário não pode ser alterado.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-semibold">Nome</Label>
                                <Input id="name" name="name" defaultValue={student.name ?? ''} className={inputStyles} />
                                {getFieldError('name') && <p className="text-sm text-red-400 mt-1">{getFieldError('name')}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-semibold">E-mail</Label>
                                <Input id="email" name="email" type="email" defaultValue={student.email ?? ''} className={inputStyles} placeholder="seunome@email.com"/>
                                {getFieldError('email') && <p className="text-sm text-red-400 mt-1">{getFieldError('email')}</p>}
                            </div>
                        </div>

                        <hr className="my-4 border-white/10"/>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nova Senha</Label>
                            <Input id="newPassword" name="newPassword" type="password" placeholder="Deixe em branco para não alterar" className={inputStyles} />
                            {getFieldError('newPassword') && <p className="text-sm text-red-400 mt-1">{getFieldError('newPassword')}</p>}
                        </div>

                        <div className="space-y-2 bg-white/5 p-4 rounded-lg border border-yellow-500/20 mt-4">
                            <Label htmlFor="currentPassword" className="font-semibold text-yellow-300">Senha Atual (Obrigatório)</Label>
                             <p className="text-sm text-white/60 -mt-1 mb-3">Para salvar, confirme sua senha atual.</p>
                            <Input id="currentPassword" name="currentPassword" type="password" placeholder="••••••••" required className={`${inputStyles} border-yellow-500/30`}/>
                            {getFieldError('currentPassword') && <p className="text-sm text-red-400 mt-1">{getFieldError('currentPassword')}</p>}
                        </div>

                        {typeof state.error === 'string' && <p className="text-sm text-red-400 text-center">{state.error}</p>}

                    </div>
                    <footer className="mt-8 flex justify-end">
                        <SubmitButton />
                    </footer>
                </form>
            </div>
        </div>
    );
}
