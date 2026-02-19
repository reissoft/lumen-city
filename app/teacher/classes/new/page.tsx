// app/teacher/classes/new/page.tsx
"use client"

import { useFormState, useFormStatus } from 'react-dom';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createClass } from "../actions"; // Importando a Server Action

// Botão de submit com estado de pending
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Turma"}
    </Button>
  )
}

export default function NewClassPage() {
  const initialState = { error: "" };
  const [state, formAction] = useFormState(createClass, initialState);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Criar Nova Turma</CardTitle>
            <CardDescription>Dê um nome para sua nova turma. Ex: "Matemática - 3º Ano B"</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Nome da Turma</Label>
                  <Input id="name" name="name" placeholder="Nome da sua turma" required />
                   {state?.error && <p className="text-sm text-red-500 mt-1">{state.error}</p>}
                </div>
                <div className="flex justify-between items-center mt-4">
                    <Link href="/teacher/classes">
                        <Button variant="outline" type="button"> 
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    </Link>
                    <SubmitButton />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
