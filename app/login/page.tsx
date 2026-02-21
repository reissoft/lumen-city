'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { login, recoverPassword } from '@/app/auth/actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';

// --- COMPONENTE DO MODAL DE RECUPERAÇÃO (ATUALIZADO) ---
function PasswordRecoveryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
    const [isPending, startTransition] = useTransition();
    const [identifier, setIdentifier] = useState(''); // Renomeado para 'identifier'

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!identifier.trim()) {
            toast.error("Por favor, preencha o campo abaixo.");
            return;
        }
        startTransition(async () => {
            const result = await recoverPassword(identifier);
            if (result.success) {
                toast.success(result.success);
                onClose();
            } else {
                toast.error(result.error);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" aria-label="Fechar modal">&times;</button>
                <h2 className="text-xl font-bold mb-4">Recuperar Acesso</h2>
                <p className="text-slate-600 mb-6 text-sm">Digite o usuário do aluno, seu e-mail de professor/admin, ou o e-mail/telefone do responsável.</p>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="recovery-identifier">Usuário, E-mail ou Telefone</Label>
                        <Input
                            id="recovery-identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder='usuario, email@exemplo.com, ou 119...1'
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={isPending} className="w-full">
                        {isPending ? 'Buscando...' : 'Recuperar Acesso'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENTE DA PÁGINA DE LOGIN (SEM MUDANÇAS ADICIONAIS) ---
const initialState = { message: '' };

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
    const [role, setRole] = useState('admin');
    const [isRecoveryModalOpen, setRecoveryModalOpen] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <PasswordRecoveryModal isOpen={isRecoveryModalOpen} onClose={() => setRecoveryModalOpen(false)} />
            
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

                        {state?.message && <p className="text-sm text-red-500 text-center">{state.message}</p>}

                        <SubmitButton />
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center text-sm">
                     <button 
                        onClick={() => setRecoveryModalOpen(true)} 
                        className="text-blue-600 hover:underline mt-4"
                    >
                        Esqueci minha senha
                    </button>
                    <div className='mt-4 text-xs text-gray-400'>
                      <p>Adm: admin@lumen.com : admin123</p>
                      <p>Prof: ana.silva@lumen.com : prof1-123</p>
                      <p>Alun: carlosp : aluno123</p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
