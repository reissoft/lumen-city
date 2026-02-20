
// prisma/backfill-usernames.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o script para preencher usernames...');

  const studentsToUpdate = await prisma.student.findMany({
    where: {
      username: null,
    },
  });

  if (studentsToUpdate.length === 0) {
    console.log('Nenhum aluno para atualizar. Todos já possuem username.');
    return;
  }

  console.log(`Encontrados ${studentsToUpdate.length} alunos sem username. Atualizando agora...`);

  for (const student of studentsToUpdate) {
    if (student.email) {
      try {
        await prisma.student.update({
          where: {
            id: student.id,
          },
          data: {
            username: student.email,
          },
        });
        console.log(`- Aluno ID ${student.id}: username atualizado para '${student.email}'`);
      } catch (error: any) {
        // Ignora erros de constraint única, caso o email já exista como username de outro usuário
        if (error.code === 'P2002') {
             console.warn(`- AVISO: Não foi possível atualizar o aluno ID ${student.id} para o username '${student.email}' porque este username já está em uso.`);
        } else {
            console.error(`- ERRO ao atualizar o aluno ID ${student.id}:`, error);
        }
      }
    } else {
        console.warn(`- AVISO: Aluno ID ${student.id} não possui um email para ser usado como username.`);
    }
  }

  console.log('Script de preenchimento concluído.');
}

main()
  .catch((e) => {
    console.error('Ocorreu um erro ao executar o script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
