// app/student/settings/client-page.tsx

'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { toast } from 'sonner';
import { updateStudentProfile } from './actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

const initialState = { error: null, success: null };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? 'Salvando Alterações...' : 'Salvar Alterações'}
        </Button>
    );
}

interface StudentData {
    name: string | null;
    email: string | null;
    username: string | null;
}

export default function StudentSettingsClientPage({ student }: { student: StudentData }) {
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
        if (typeof state.error === 'object' && state.error && state.error[fieldName]) {
            return state.error[fieldName][0];
        }
        return null;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-2xl">
                <div className="mb-6">
                    <Link href="/student" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Painel
                    </Link>
                </div>
                <Card>
                    <form action={formAction}>
                        <CardHeader>
                            <CardTitle>Minha Conta</CardTitle>
                            <CardDescription>Atualize suas informações. Seu nome de usuário não pode ser alterado.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Campo Usuário (desabilitado) */}
                            <div className="space-y-2">
                                <Label htmlFor="username">Usuário</Label>
                                <Input id="username" name="username" defaultValue={student.username ?? ''} disabled className="bg-gray-100" />
                            </div>

                            {/* Campo Nome */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" name="name" defaultValue={student.name ?? ''} />
                                {getFieldError('name') && <p className="text-sm text-red-500">{getFieldError('name')}</p>}
                            </div>

                            {/* Campo Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" name="email" type="email" defaultValue={student.email ?? ''} placeholder="seunome@email.com"/>
                                {getFieldError('email') && <p className="text-sm text-red-500">{getFieldError('email')}</p>}
                            </div>

                            {/* Campo Nova Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nova Senha</Label>
                                <Input id="newPassword" name="newPassword" type="password" placeholder="Deixe em branco para não alterar" />
                                {getFieldError('newPassword') && <p className="text-sm text-red-500">{getFieldError('newPassword')}</p>}
                            </div>
                            
                            <hr className="my-6"/>

                             {/* Campo Senha Atual (Obrigatório) */}
                             <div className="space-y-2">
                                <Label htmlFor="currentPassword">Senha Atual</Label>
                                <Input id="currentPassword" name="currentPassword" type="password" placeholder="Confirme sua senha para salvar" required />
                                {getFieldError('currentPassword') && <p className="text-sm text-red-500">{getFieldError('currentPassword')}</p>}
                            </div>

                             {/* Erro genérico */}
                            {typeof state.error === 'string' && <p className="text-sm text-red-500 text-center">{state.error}</p>}

                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <SubmitButton />
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
