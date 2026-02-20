// app/login/page.tsx

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/app/auth/actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const initialState = {
    message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" aria-disabled={pending} className="w-full">
            {pending ? 'Entrando...' : 'Entrar'}
        </Button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useFormState(login, initialState);
    const [role, setRole] = useState('admin'); // O valor padrão agora é 'admin'

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Lumen</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div>
                            <Label htmlFor="role">Eu sou</Label>
                            <Select name="role" required value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione seu papel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Opção de Administrador adicionada */}
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="teacher">Professor</SelectItem>
                                    <SelectItem value="student">Aluno</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="username">{role === 'student' ? 'Usuário' : 'Email'}</Label>
                            <Input
                                id="username"
                                name="username"
                                type={role === 'student' ? 'text' : 'email'}
                                placeholder={role === 'student' ? 'ex: carlos.santos' : 'ex: admin@lumen.com'}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        {state?.message && <p className="text-sm text-red-500">{state.message}</p>}

                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
