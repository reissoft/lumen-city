// app/admin/moderation/page.tsx
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const prisma = new PrismaClient();

// Função para verificar se o usuário é um admin autorizado
async function verifyAdmin() {
  const role = cookies().get('lumen_role')?.value;
  if (role !== 'admin') {
    redirect('/'); // Redireciona se não for admin
  }
  return role;
}

// Função para buscar todos os professores da escola
async function getTeachers() {
  // O ID da escola do admin não é estritamente necessário se a lógica for buscar todos os professores,
  // mas é uma boa prática para uma futura separação por escolas.
  const teachers = await prisma.teacher.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
  return teachers;
}

export default async function ModerationSelectionPage() {
  await verifyAdmin();
  const teachers = await getTeachers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-4 md:p-8">
      <div className="container mx-auto relative">
        <Link href="/admin" passHref>
          <Button variant="ghost" className="absolute -top-4 left-0 z-20 flex items-center gap-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Voltar ao Painel
          </Button>
        </Link>

        <header className="text-center mb-12 mt-12">
          <h1 className="text-4xl font-bold">Moderação de Mensagens</h1>
          <p className="text-white/60 mt-2">Selecione um professor para visualizar suas conversas.</p>
        </header>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Professores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-white/10">
              {teachers.length > 0 ? (
                teachers.map(teacher => (
                  <Link key={teacher.id} href={`/messaging?moderateAs=${teacher.id}`} passHref>
                    <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/10 transition-colors rounded-lg">
                      <div>
                        <p className="font-semibold text-lg text-white">{teacher.name}</p>
                        <p className="text-sm text-white/50">{teacher.email}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/50" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center p-4 text-white/50">Nenhum professor encontrado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
