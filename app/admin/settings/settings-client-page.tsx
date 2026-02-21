// app/admin/settings/settings-client-page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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

export default function SettingsClientPage({ admin, school }: SettingsClientPageProps) {
    const [state, formAction] = useFormState(updateSettings, { errors: {}, success: false });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            toast.success("As configurações foram salvas com sucesso!");
            formRef.current?.reset(); // Limpa o formulário, incluindo os campos de senha
        }
        if (!state.success && state.errors?._form) {
            toast.error(state.errors._form.join(", "));
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction}>
             <input type="hidden" name="schoolId" value={school.id} />
             <input type="hidden" name="adminId" value={admin.id} />

            <div className="container mx-auto p-4 md:p-8 space-y-8">
                <Button variant="ghost" asChild className="mb-4 gap-2">
                    <Link href="/admin"><ArrowLeft size={16} /> Voltar</Link>
                </Button>

                <div>
                    <h1 className="text-3xl font-bold">Configurações</h1>
                    <p className="text-muted-foreground">Gerencie as informações da sua escola e seu perfil de administrador.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Dados da Escola</CardTitle>
                        <CardDescription>Altere o nome da sua instituição.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="schoolName">Nome da Escola</Label>
                                <Input id="schoolName" name="schoolName" defaultValue={school.name} />
                                {state.errors?.schoolName && <p className="text-red-500 text-sm">{state.errors.schoolName[0]}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Acesso do Administrador</CardTitle>
                        <CardDescription>Atualize suas informações de login.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="adminName">Seu Nome</Label>
                                <Input id="adminName" name="adminName" defaultValue={admin.name} />
                                {state.errors?.adminName && <p className="text-red-500 text-sm">{state.errors.adminName[0]}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="adminEmail">Seu E-mail</Label>
                                <Input id="adminEmail" name="adminEmail" type="email" defaultValue={admin.email} />
                                {state.errors?.adminEmail && <p className="text-red-500 text-sm">{state.errors.adminEmail[0]}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alterar Senha</CardTitle>
                        <CardDescription>Deixe em branco para não alterar a senha.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="currentPassword">Senha Atual</Label>
                                <Input id="currentPassword" name="currentPassword" type="password" />
                                {state.errors?.currentPassword && <p className="text-red-500 text-sm">{state.errors.currentPassword[0]}</p>}
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="newPassword">Nova Senha</Label>
                                <Input id="newPassword" name="newPassword" type="password" />
                                {state.errors?.newPassword && <p className="text-red-500 text-sm">{state.errors.newPassword[0]}</p>}
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                <Input id="confirmPassword" name="confirmPassword" type="password" />
                                {state.errors?.confirmPassword && <p className="text-red-500 text-sm">{state.errors.confirmPassword[0]}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="flex justify-end">
                     <SubmitButton />
                </div>
            </div>
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar Alterações"}
        </Button>
    )
}
