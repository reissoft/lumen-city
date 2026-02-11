// app/teacher/students/page.tsx
import { PrismaClient } from "@prisma/client"
import { createStudent } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, User } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export default async function StudentManagement() {
  const email = (await cookies()).get("lumen_session")?.value
  if (!email) redirect("/login")

  const teacher = await prisma.teacher.findUnique({ where: { email } })
  if (!teacher) return <div>Acesso negado</div>

  const students = await prisma.student.findMany({
    where: { schoolId: teacher.schoolId },
    orderBy: { name: 'asc' },
    include: { resources: true }
  })

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Minha Turma</h1>
            <p className="text-slate-500">Gerencie os alunos da {teacher.schoolId}</p>
          </div>

          {/* Modal de Cadastro */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 gap-2"><Plus size={18}/> Novo Aluno</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Aluno</DialogTitle>
              </DialogHeader>
              <form action={createStudent} className="space-y-4 py-4">
                <Input name="name" placeholder="Nome Completo" required />
                <Input name="email" type="email" placeholder="Email do Aluno" required />
                <div className="text-sm text-slate-500 bg-slate-100 p-2 rounded">
                  * A senha inicial será definida como "123"
                </div>
                <Button type="submit" className="w-full">Cadastrar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Alunos */}
        <Card>
          <CardHeader>
            <CardTitle>Alunos Matriculados ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Ouro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <User size={14} className="text-slate-500"/>
                      </div>
                      {student.name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>Lvl {student.level}</TableCell>
                    <TableCell className="text-yellow-600 font-bold">{student.resources?.gold} G</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}