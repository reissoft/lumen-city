// app/actions.ts
'use server'

import Groq from 'groq-sdk'
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from "next/headers"
import { BUILDING_CONFIG, BuildingType } from '@/app/config/buildings'


const prisma = new PrismaClient()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateQuiz(formData: FormData) {
  const topic = formData.get('topic') as string
  const difficulty = "médio" // Poderíamos pegar do form também
  
  // Hardcoded para teste (no futuro pegaremos da sessão do usuário logado)
  const teacherEmail = await getCurrentUser();

  if (!topic) return

  try {
    console.log(`⚡ Groq gerando quiz sobre: ${topic}...`)

    // 1. Pedir para a Groq gerar o JSON
    const completion = await groq.chat.completions.create({
      // Usando Llama 3 70B (Rápido e Inteligente)
      model: "llama-3.3-70b-versatile", 
      messages: [
        {
          role: "system",
          content: `Você é um assistente pedagógico especializado em criar material didático gamificado.
          
          Sua tarefa é gerar um Quiz sobre o tema fornecido.
          A saída DEVE ser estritamente um JSON válido seguindo exatamente esta estrutura, sem texto adicional antes ou depois:
          
          {
            "title": "Título Criativo e Curto",
            "description": "Uma descrição engajadora de 1 frase",
            "questions": [
              {
                "text": "O enunciado da pergunta",
                "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
                "correct": 0 // Índice da resposta correta (0 a 3, number)
              }
            ]
          }
          
          Gere 3 perguntas de dificuldade ${difficulty}.`
        },
        { 
          role: "user", 
          content: `Gere um quiz sobre o tema: ${topic}` 
        }
      ],
      temperature: 0.5,
      // Importante: Força a resposta em JSON para evitar erros de parse
      response_format: { type: "json_object" } 
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error("Sem resposta da Groq")

    console.log("Resposta bruta da Groq:", content.substring(0, 100) + "...")

    // 2. Parsear o JSON
    const quizData = JSON.parse(content)

    // 3. Buscar ID do Professor
    const teacher = await prisma.teacher.findFirst({
      where: { email: teacherEmail }
    })

    if (!teacher) {
      // Se não achar o professor (caso o banco tenha resetado), cria um fallback ou lança erro
      throw new Error("Professor admin@reissoft.com não encontrado. Rode o seed novamente.")
    }

    // 4. Salvar no Banco
    await prisma.activity.create({
      data: {
        title: quizData.title,
        description: quizData.description,
        type: 'QUIZ',
        difficulty: 1,
        teacherId: teacher.id,
        // O Prisma aceita JSON direto se o tipo no schema for Json
        payload: { 
            questions: quizData.questions 
        } 
      }
    })

    // 5. Atualizar a tela
    revalidatePath('/teacher')
    console.log("✅ Quiz gerado e salvo via Groq!")
    
  } catch (error) {
    console.error("Erro na geração:", error)
    // Em produção, retornaria o erro para exibir um Toast no front
  }

  
}


export async function deleteActivity(formData: FormData) {
  const id = formData.get('id') as string
  
  if (!id) return

  try {
    await prisma.activity.delete({
      where: { id }
    })
    
    // Redireciona de volta para o painel após deletar
    revalidatePath('/teacher')
    // Em Server Actions, para redirecionar, importamos 'redirect' de 'next/navigation'
    // Mas como o form está na página interna, o revalidate pode não ser suficiente visualmente se não sair da página.
    // O ideal aqui seria usar redirect('/teacher')
  } catch (error) {
    console.error("Erro ao deletar:", error)
  }
}

// app/actions.ts

// ... (imports anteriores e funções generateQuiz/deleteActivity mantêm-se iguais)

export async function submitQuizResult(activityId: string, score: number) {
  // Hardcoded para teste (na vida real viria da sessão)
  const studentEmail = await getCurrentUser()

  try {
    const student = await prisma.student.findUnique({
      where: { email: studentEmail },
      include: { resources: true }
    })

    if (!student) throw new Error("Aluno não encontrado")

    // Lógica de Gamificação:
    // Se tirou mais que 70, ganha recompensas.
    const passed = score >= 70
    let rewardMessage = "Tente novamente para ganhar recursos."
    
    if (passed) {
      // Cálculo da Recompensa (Ex: 10 de Ouro e 50 XP fixo)
      const goldReward = 10
      const xpReward = 50

      // Atualiza o Aluno (Transação Atômica)
      await prisma.$transaction([
        // 1. Registra a tentativa
        prisma.activityAttempt.create({
          data: {
            studentId: student.id,
            activityId: activityId,
            score: score,
            response: {}, // Poderíamos salvar as respostas exatas aqui
            rewarded: true
          }
        }),
        // 2. Deposita o Ouro e XP
        prisma.student.update({
          where: { id: student.id },
          data: {
            xp: { increment: xpReward },
            resources: {
              update: {
                gold: { increment: goldReward }
              }
            }
          }
        })
      ])
      
      rewardMessage = `Parabéns! Você ganhou +${goldReward} Ouro e +${xpReward} XP!`
    } else {
        // Apenas registra a tentativa falha
        await prisma.activityAttempt.create({
            data: {
              studentId: student.id,
              activityId: activityId,
              score: score,
              response: {},
              rewarded: false
            }
          })
    }

    return { success: true, message: rewardMessage, passed }

  } catch (error) {
    console.error("Erro ao submeter:", error)
    return { success: false, message: "Erro ao salvar resultado." }
  }
}

// app/actions.ts

// ... (códigos anteriores)

// Definição dos Prédios Disponíveis (Hardcoded por enquanto)
const BUILDINGS = BUILDING_CONFIG;

export async function buyBuilding(type: string, x: number, y: number) {
  const studentEmail = await getCurrentUser()

  try {
    const student = await prisma.student.findUnique({
      where: { email: studentEmail },
      include: { resources: true }
    })

    if (!student || !student.resources) return // Apenas return vazio

    const buildingInfo = BUILDINGS[type as keyof typeof BUILDINGS]
    
    // Se não tiver ouro, apenas para a execução (sem retornar objeto de erro por enquanto)
    /*if (student.resources.gold < buildingInfo.cost) {
      return 
    }*/

    const currentCity = (student.cityData as any) || { buildings: [] }
    const isOccupied = currentCity.buildings.find((b: any) => b.x === x && b.y === y)
    
    if (isOccupied) return 

    // Adiciona o prédio
    const newBuilding = { id: Date.now(), type, x, y }
    currentCity.buildings.push(newBuilding)

    await prisma.student.update({
      where: { id: student.id },
      data: {
        resources: {
          update: { gold: { decrement: buildingInfo.cost } }
        },
        cityData: currentCity
      }
    })

    // Atualiza a tela
    revalidatePath('/student/city')
    
    // REMOVA o "return { success: true ... }"
    // Ao não retornar nada, a função vira Promise<void>, e o erro do formulário somem.

  } catch (error) {
    console.error(error)
  }
}

async function getCurrentUser() {
  const email = (await cookies()).get("lumen_session")?.value
  if (!email) redirect("/login") // Se não tiver cookie, manda pro login
  return email
}

// app/actions.ts (adicione ao final)

export async function createStudent(formData: FormData) {
  const teacherEmail = await getCurrentUser() // Garante que é um prof logado
  
  // Buscar a escola do professor
  const teacher = await prisma.teacher.findUnique({ where: { email: teacherEmail } })
  if (!teacher) return { error: "Erro de permissão" }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = "123" // Senha padrão inicial (pode mudar depois)

  try {
    await prisma.student.create({
      data: {
        name,
        email,
        password, // Em prod, usaríamos bcrypt para hashear
        schoolId: teacher.schoolId,
        resources: {
           create: { gold: 100, wood: 0, energy: 100 } // Kit inicial
        },
        cityData: { buildings: [] } // Cidade vazia
      }
    })
    
    revalidatePath("/teacher/students")
    return { success: true }
  } catch (e) {
    return { error: "Erro ao criar aluno (Email já existe?)" }
  }
}

// app/actions.ts

// ... (suas outras funções: buyBuilding, generateQuiz, etc)

export async function rotateBuildingAction(buildingId: number, newRotation: number) {
  const studentEmail = await getCurrentUser();

  try {
    const student = await prisma.student.findUnique({
      where: { email: studentEmail }
    });

    if (!student) return;

    const cityData = (student.cityData as any) || { buildings: [] };
    
    // Localiza e atualiza a rotação do prédio específico
    cityData.buildings = cityData.buildings.map((b: any) => 
      b.id === buildingId ? { ...b, rotation: newRotation } : b
    );

    await prisma.student.update({
      where: { id: student.id },
      data: { cityData }
    });

    revalidatePath('/student/city');
  } catch (error) {
    console.error("Erro ao rotacionar no banco:", error);
  }
}

export async function demolishBuildingAction(buildingId: number) {
  const studentEmail = await getCurrentUser();

  try {
    const student = await prisma.student.findUnique({
      where: { email: studentEmail }
    });

    if (!student) return;

    const cityData = (student.cityData as any) || { buildings: [] };
    
    // Remove o prédio da lista
    cityData.buildings = cityData.buildings.filter((b: any) => b.id !== buildingId);

    await prisma.student.update({
      where: { id: student.id },
      data: { cityData }
    });

    revalidatePath('/student/city');
  } catch (error) {
    console.error("Erro ao demolir no banco:", error);
  }
}