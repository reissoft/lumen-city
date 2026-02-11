// app/login/page.tsx
import { login } from "../auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
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
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="nome@escola.com" 
                required 
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Senha</Label>
                <span className="text-xs text-indigo-600 cursor-pointer">Esqueceu?</span>
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

          {/* Dicas para teste rápido (remova em produção) */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-500 space-y-2 border">
            <p className="font-bold uppercase text-slate-400">Dados de Teste (Seed):</p>
            <div className="flex justify-between">
              <span>👨‍🏫 Professor:</span>
              <span className="font-mono">admin@reissoft.com / 123</span>
            </div>
            <div className="flex justify-between">
              <span>🧑‍🎓 Aluno:</span>
              <span className="font-mono">aluno@lumen.com / 123</span>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}