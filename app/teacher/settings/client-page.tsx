// app/teacher/settings/client-page.tsx

'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { toast } from 'sonner';
import { updateProfile } from './actions';
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

interface TeacherData {
    name: string | null;
    email: string | null;
}

export default function TeacherSettingsClientPage({ teacher }: { teacher: TeacherData }) {
    const [state, formAction] = useFormState(updateProfile, initialState);

    useEffect(() => {
        if (state.success) {
            toast.success(state.success);
        }
        // O erro de string é para erros genéricos do servidor
        if (typeof state.error === 'string') {
            toast.error(state.error);
        }
    }, [state]);

    // Função para obter a mensagem de erro específica de um campo
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
                    <Link href="/teacher" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Painel
                    </Link>
                </div>
                <Card>
                    <form action={formAction}>
                        <CardHeader>
                            <CardTitle>Configurações do Perfil</CardTitle>
                            <CardDescription>Atualize suas informações pessoais. Para salvar, é necessário confirmar sua senha atual.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Campo Nome */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" name="name" defaultValue={teacher.name ?? ''} />
                                {getFieldError('name') && <p className="text-sm text-red-500">{getFieldError('name')}</p>}
                            </div>

                            {/* Campo Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" name="email" type="email" defaultValue={teacher.email ?? ''} />
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

                            {/* Erro genérico (se houver) */}
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
