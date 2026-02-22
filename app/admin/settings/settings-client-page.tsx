// app/admin/settings/settings-client-page.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormState, useFormStatus } from "react-dom";
import { updateSettings } from "./actions";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { School, Teacher } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SettingsClientPageProps {
    admin: Teacher;
    school: School;
}

// --- ESTILOS REUTILIZÁVEIS ---
const inputStyles = "w-full bg-white/5 border-2 border-white/20 rounded-lg p-2.5 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition";
const labelStyles = "block text-sm font-medium text-white/80 mb-2";
const errorTextStyles = "text-red-400 text-sm mt-2";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="font-bold py-3 px-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed">
            {pending ? "Salvando..." : "Salvar Alterações"}
        </Button>
    )
}

export default function SettingsClientPage({ admin, school }: SettingsClientPageProps) {
    const [state, formAction] = useFormState(updateSettings, { errors: {}, success: false });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            toast.success("As configurações foram salvas com sucesso!");
            const passwordFields = formRef.current?.querySelectorAll('input[type="password"]');
            passwordFields?.forEach(field => (field as HTMLInputElement).value = '');
        }
        // @ts-ignore
        if (!state.success && state.errors?._form) {
            // @ts-ignore
            toast.error(state.errors._form.join(", "));
        }
    }, [state]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
             <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
             <div className="container mx-auto p-4 md:p-8 relative">
                <Link href="/admin" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 rounded-full px-4 py-2 text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> Voltar ao Painel
                </Link>

                <form ref={formRef} action={formAction} className="space-y-10">
                    <input type="hidden" name="schoolId" value={school.id} />
                    <input type="hidden" name="adminId" value={admin.id} />

                    <header>
                        <h1 className="text-4xl font-bold">Configurações</h1>
                        <p className="text-white/60 mt-1">Gerencie as informações da sua escola e seu perfil de administrador.</p>
                    </header>

                    {/* Card da Escola */}
                    <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg p-6 md:p-8">
                        <header className="mb-6">
                            <h2 className="text-2xl font-bold">Dados da Escola</h2>
                            <p className="text-white/50">Altere o nome da sua instituição.</p>
                        </header>
                        <div>
                            <Label htmlFor="schoolName" className={labelStyles}>Nome da Escola</Label>
                            <Input id="schoolName" name="schoolName" defaultValue={school.name} className={inputStyles} />
                            {// @ts-ignore
                            state.errors?.schoolName && <p className={errorTextStyles}>{state.errors.schoolName[0]}</p>}
                        </div>
                    </section>

                    {/* Card do Administrador */}
                    <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg p-6 md:p-8">
                        <header className="mb-6">
                            <h2 className="text-2xl font-bold">Acesso do Administrador</h2>
                            <p className="text-white/50">Atualize suas informações de login.</p>
                        </header>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="adminName" className={labelStyles}>Seu Nome</Label>
                                <Input id="adminName" name="adminName" defaultValue={admin.name} className={inputStyles} />
                                {// @ts-ignore
                                state.errors?.adminName && <p className={errorTextStyles}>{state.errors.adminName[0]}</p>}
                            </div>
                            <div>
                                <Label htmlFor="adminEmail" className={labelStyles}>Seu E-mail</Label>
                                <Input id="adminEmail" name="adminEmail" type="email" defaultValue={admin.email} className={inputStyles} />
                                {// @ts-ignore
                                state.errors?.adminEmail && <p className={errorTextStyles}>{state.errors.adminEmail[0]}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Card de Alterar Senha */}
                    <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg p-6 md:p-8">
                        <header className="mb-6">
                            <h2 className="text-2xl font-bold">Alterar Senha</h2>
                            <p className="text-white/50">Deixe os campos em branco para não alterar a senha.</p>
                        </header>
                        <div className="grid md:grid-cols-3 gap-6">
                             <div>
                                <Label htmlFor="currentPassword" className={labelStyles}>Senha Atual</Label>
                                <Input id="currentPassword" name="currentPassword" type="password" className={inputStyles} placeholder="••••••••"/>
                                {// @ts-ignore
                                state.errors?.currentPassword && <p className={errorTextStyles}>{state.errors.currentPassword[0]}</p>}
                            </div>
                             <div>
                                <Label htmlFor="newPassword" className={labelStyles}>Nova Senha</Label>
                                <Input id="newPassword" name="newPassword" type="password" className={inputStyles} placeholder="••••••••"/>
                                {// @ts-ignore
                                state.errors?.newPassword && <p className={errorTextStyles}>{state.errors.newPassword[0]}</p>}
                            </div>
                             <div>
                                <Label htmlFor="confirmPassword" className={labelStyles}>Confirmar Nova Senha</Label>
                                <Input id="confirmPassword" name="confirmPassword" type="password" className={inputStyles} placeholder="••••••••"/>
                                {// @ts-ignore
                                state.errors?.confirmPassword && <p className={errorTextStyles}>{state.errors.confirmPassword[0]}</p>}
                            </div>
                        </div>
                    </section>
                    
                    <footer className="flex justify-end pt-4">
                         <SubmitButton />
                    </footer>
                </form>
            </div>
        </div>
    );
}