// prisma/seed.ts
import { PrismaClient, ActivityType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando a seed...')

  // 1. Criar a Escola (Reissoft Academy)
  const school = await prisma.school.create({
    data: {
      name: 'Reissoft Academy',
      plan: 'PRO',
    },
  })

  console.log(`🏫 Escola criada: ${school.name}`)

  // 2. Criar um Professor (Você!)
  const teacher = await prisma.teacher.create({
    data: {
      name: 'Mestre Reis',
      email: 'admin@reissoft.com',
      password: '123', // Em prod, usaríamos hash
      schoolId: school.id,
    },
  })

  // 3. Criar um Aluno (O Jogador)
  const student = await prisma.student.create({
    data: {
      name: 'Aluno Beta',
      email: 'aluno@lumen.com',
      password: '123',
      schoolId: school.id,
      xp: 0,
      level: 1,
      // Inicializa com alguns recursos para testar o jogo depois
      resources: {
        create: {
          gold: 500,
          wood: 100,
          energy: 50
        }
      }
    },
  })

  // 4. Criar uma Atividade de Exemplo (Quiz)
  await prisma.activity.create({
    data: {
      title: 'A Revolução dos Games',
      description: 'Um quiz teste sobre a história da Reissoft.',
      type: 'QUIZ',
      difficulty: 1,
      teacherId: teacher.id,
      payload: {
        questions: [
          {
            id: 1,
            text: "Qual engine o Lumen City usa no Front?",
            options: ["Unity", "PlayCanvas", "Unreal"],
            correct: 1 // PlayCanvas
          },
          {
            id: 2,
            text: "Qual o foco principal do projeto?",
            options: ["Apenas diversão", "Gamificação Estrutural", "Vender skins"],
            correct: 1
          }
        ]
      }
    }
  })

  console.log('✅ Seed concluída com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })