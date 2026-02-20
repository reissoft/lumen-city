// app/login/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { login } from "../auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from 'lucide-react'

const errorMessages: { [key: string]: string } = {
  'credenciais_invalidas': 'Usuário ou senha incorretos. Verifique os dados e tente novamente.',
  'campos_vazios': 'Por favor, preencha todos os campos para entrar.',
};

export default function LoginPage() {
  const searchParams = useSearchParams()
  const errorKey = searchParams.get('error')
  const errorMessage = errorKey ? errorMessages[errorKey] : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Lumen City</CardTitle>
          <CardDescription>Acesse sua cidade ou sua sala de aula.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 flex items-center gap-2 text-sm border border-red-200">
                <AlertTriangle className="h-4 w-4" />
                <span>{errorMessage}</span>
            </div>
          )}

          <form action={login} className="space-y-4">
            <div className="space-y-2">
              {/* Mudança aqui: Label e nome do campo */}
              <Label htmlFor="identifier">Usuário ou E-mail</Label>
              <Input 
                id="identifier" 
                name="identifier" 
                type="text" // Mudar para text para aceitar usuários sem "@"
                placeholder="Ex: joao.silva ou prof@escola.com" 
                required 
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-xs text-indigo-600 hover:underline">Esqueceu sua senha?</a>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="bg-slate-50"
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base">
              Entrar no Sistema
            </Button>
          </form>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-500 space-y-2 border">
            <p className="font-bold uppercase text-slate-400">Dados de Teste:</p>
            <div className="flex justify-between">
              <span>👨‍🏫 Professor:</span>
              <span className="font-mono">admin@reissoft.com / 123</span>
            </div>
            <div className="flex justify-between">
               {/* Atualizar a dica de login do aluno */}
              <span>🧑‍🎓 Aluno (Exemplo):</span>
              <span className="font-mono">joao.silva / 123</span>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}