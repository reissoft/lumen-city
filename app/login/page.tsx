'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { login, recoverPassword } from '@/app/auth/actions';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { User, Lock, Mail, Building, GraduationCap, Eye, EyeOff, ShieldQuestion } from 'lucide-react';

// --- COMPONENTE DO MODAL DE RECUPERAÇÃO ---
function PasswordRecoveryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
    const [isPending, startTransition] = useTransition();
    const [identifier, setIdentifier] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!identifier.trim()) {
            toast.error("Por favor, preencha o campo com seu usuário ou e-mail.");
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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-sm bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-3xl shadow-2xl relative">
                <button onClick={onClose} className="absolute top-3 right-4 text-white/50 hover:text-white text-3xl z-10" aria-label="Fechar modal">&times;</button>
                <CardHeader className="pt-8 pb-4">
                    <h2 className="text-xl font-bold text-center text-white">Recuperar Acesso</h2>
                    <p className="text-white/60 text-center text-xs pt-1">Insira seu identificador para receber ajuda.</p>
                </CardHeader>
                <CardContent className="space-y-4 px-8 pb-6">
                    <div className="relative">
                        <ShieldQuestion className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                        <Input
                            id="recovery-identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder='Usuário, e-mail ou telefone'
                            className="bg-transparent border-0 border-b-2 border-white/30 rounded-none pl-10 py-3 text-base placeholder:text-white/50 focus:ring-0 focus:border-blue-400 transition-colors"
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={isPending} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-full hover:scale-105 transition-transform">
                        {isPending ? 'Verificando...' : 'Recuperar'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

// --- COMPONENTE DO BOTÃO DE SUBMIT ---
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button 
            type="submit" 
            aria-disabled={pending} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-base py-4 rounded-full hover:scale-105 transition-transform duration-300 ease-in-out"
        >
            {pending ? 'ENTRANDO...' : 'ENTRAR'}
        </Button>
    );
}

// --- COMPONENTE DA PÁGINA DE LOGIN ---
const initialState = { message: '' };

export default function LoginPage() {
    const [state, formAction] = useFormState(login, initialState);
    const [role, setRole] = useState('admin');
    const [showPassword, setShowPassword] = useState(false);
    const [isRecoveryModalOpen, setRecoveryModalOpen] = useState(false);

    const roleDetails = {
        admin: { icon: Building, placeholder: 'E-mail do Administrador' },
        teacher: { icon: GraduationCap, placeholder: 'E-mail do Professor' },
        student: { icon: User, placeholder: 'Nome de Usuário do Aluno' },
    };

    const IdentifierIcon = roleDetails[role as keyof typeof roleDetails].icon;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white p-4">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
            <PasswordRecoveryModal isOpen={isRecoveryModalOpen} onClose={() => setRecoveryModalOpen(false)} />

            <Card className="w-full max-w-sm bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                <CardHeader className="flex flex-col items-center justify-center text-center pt-8 pb-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                        <User className="w-10 h-10 text-white/80" />
                    </div>
                     <h1 className="text-3xl font-bold text-white mt-3">Lumen</h1>
                </CardHeader>

                <CardContent className="px-6">
                    <form action={formAction} className="space-y-4">
                        {/* Seletor de Perfil */}
                        <div>
                             <Select name="role" required value={role} onValueChange={setRole}>
                                <SelectTrigger className="bg-transparent border-0 border-b-2 border-white/30 rounded-none h-auto py-3 text-base text-white/80 focus:ring-0 focus:border-blue-400">
                                    <SelectValue placeholder="Selecione seu perfil" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900/80 backdrop-blur-lg border-white/20 text-white">
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="teacher">Professor</SelectItem>
                                    <SelectItem value="student">Aluno</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Campo de Usuário/Email */}
                        <div className="relative">
                            <IdentifierIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <Input
                                id="username"
                                name="username"
                                type={role === 'student' ? 'text' : 'email'}
                                placeholder={roleDetails[role as keyof typeof roleDetails].placeholder}
                                required
                                className="bg-transparent border-0 border-b-2 border-white/30 rounded-none pl-10 h-auto py-3 text-base placeholder:text-white/50 focus:ring-0 focus:border-blue-400 transition-colors"
                            />
                        </div>
                        
                        {/* Campo de Senha */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <Input 
                                id="password" 
                                name="password" 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Senha"
                                required 
                                className="bg-transparent border-0 border-b-2 border-white/30 rounded-none pl-10 pr-10 h-auto py-3 text-base placeholder:text-white/50 focus:ring-0 focus:border-blue-400 transition-colors"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Mensagem de Erro */}
                        {state?.message && <p className="text-sm text-red-400 text-center !mt-3">{state.message}</p>}

                        {/* Botão de Login */}
                        <div className="pt-3">
                          <SubmitButton />
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center text-sm pt-4 pb-6">
                     <button onClick={() => setRecoveryModalOpen(true)} className="text-white/70 hover:underline">
                        Esqueceu a senha?
                    </button>
                     <div className='mt-4 text-center text-xs text-white/40 space-y-1'>
                      <p>Adm: admin@lumen.com : admin123</p>
                      <p>Prof: ana.silva@lumen.com : prof1-123</p>
                      <p>Alun: carlosp : aluno123</p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
