// app/teacher/campaign/[id]/edit/page.tsx
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import EditCampaignForm from './EditCampaignForm';

const prisma = new PrismaClient();

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const email = cookieStore.get("lumen_session")?.value;
  if (!email) redirect("/login");

  const teacher = await prisma.teacher.findUnique({ where: { email } });
  if (!teacher) redirect("/login");

  // Busca a campanha específica que o professor clicou
  const campaign = await prisma.studyCampaign.findUnique({
    where: { id: params.id },
    include: { classes: true } // Traz a turma vinculada
  });

  if (!campaign) {
    redirect("/teacher"); // Se a campanha não existir (ou digitar url errada), volta pro painel
  }

  // Busca as turmas do professor para preencher o <select>
  const classes = await prisma.class.findMany({
    where: { teachers: { some: { id: teacher.id } } },
    select: { id: true, name: true }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white p-4">
      {/* Imagem de fundo opcional para manter o mesmo estilo do painel */}
      <div className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-20" style={{backgroundImage: 'url(/grid.svg)'}}></div>
      
      <div className="relative z-10">
        <EditCampaignForm campaign={campaign} classes={classes} />
      </div>
    </div>
  );
}