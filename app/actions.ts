// app/actions.ts
'use server'

import Groq from 'groq-sdk'
import { PrismaClient, Activity } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from "next/headers"
import { BUILDING_CONFIG, BuildingType } from '@/app/config/buildings'


const prisma = new PrismaClient()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateQuiz(formData: FormData) {
  const topic = formData.get('topic') as string
  const teacherEmail = await getCurrentUser()
  let newActivity: Activity;

  if (!topic) return

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Você é um assistente pedagógico especializado em criar material didático gamificado. Sua tarefa é gerar um Quiz sobre o tema fornecido. A saída DEVE ser estritamente um JSON válido seguindo exatamente esta estrutura, sem texto adicional antes ou depois:
          
          {
            "title": "Título Criativo e Curto",
            "description": "Uma descrição engajadora de 1 frase",
            "questions": [
              {
                "text": "O enunciado da pergunta",
                "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
                "correct": 0
              }
            ]
          }
          
          Gere 3 perguntas.`
        },
        { 
          role: "user", 
          content: `Gere um quiz sobre o tema: ${topic}` 
        }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" } 
    });

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error("Sem resposta da Groq")

    const quizData = JSON.parse(content)

    const teacher = await prisma.teacher.findFirst({
      where: { email: teacherEmail }
    })

    if (!teacher) {
      throw new Error("Professor não encontrado.")
    }

    newActivity = await prisma.activity.create({
      data: {
        title: quizData.title,
        description: quizData.description,
        type: 'QUIZ',
        difficulty: 1,
        teacherId: teacher.id,
        payload: { 
            questions: quizData.questions 
        } 
      }
    })
    
  } catch (error) {
    console.error("Erro na geração:", error)
    throw new Error("Falha ao gerar o quiz com IA.");
  }

  revalidatePath('/teacher')
  redirect(`/teacher/activity/${newActivity.id}/edit`)
}

export async function createManualQuiz(title: string, description: string, questions: any[]) {
    const teacherEmail = await getCurrentUser();
    let newActivity: Activity;

    if (!title || questions.length === 0) {
        throw new Error("Título e ao menos uma questão são obrigatórios.");
    }

    try {
        const teacher = await prisma.teacher.findUnique({
            where: { email: teacherEmail },
        });

        if (!teacher) {
            throw new Error("Professor não encontrado.");
        }

        newActivity = await prisma.activity.create({
            data: {
                title,
                description: description || "Quiz criado manualmente", 
                type: 'QUIZ',
                difficulty: 1, // Padrão
                teacherId: teacher.id,
                payload: { questions },
            },
        });

    } catch (error) {
        console.error("Erro ao criar quiz manual:", error);
        if (error instanceof Error) {
            throw new Error(`Não foi possível salvar a atividade: ${error.message}`);
        }
        throw new Error("Não foi possível salvar a atividade devido a um erro desconhecido.");
    }

    revalidatePath('/teacher');
    redirect(`/teacher/activity/${newActivity.id}/edit?created=true`);
}


export async function deleteActivity(formData: FormData) {
  const id = formData.get('id') as string
  
  if (!id) return

  try {
    await prisma.activity.delete({
      where: { id }
    })
    
    revalidatePath('/teacher')
  } catch (error) {
    console.error("Erro ao deletar:", error)
  }
}

export async function submitQuizResult(activityId: string, score: number) {
  const studentEmail = await getCurrentUser()

  try {
    const student = await prisma.student.findUnique({
      where: { email: studentEmail },
      include: { resources: true }
    })

    if (!student) throw new Error("Aluno não encontrado")

    const passed = score >= 70
    let rewardMessage = "Tente novamente para ganhar recursos."
    
    if (passed) {
      const goldReward = 10
      const xpReward = 50

      await prisma.$transaction([
        prisma.activityAttempt.create({
          data: {
            studentId: student.id,
            activityId: activityId,
            score: score,
            response: {},
            rewarded: true
          }
        }),
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

const BUILDINGS = BUILDING_CONFIG;

export async function buyBuilding(type: string, x: number, y: number) {
  const studentEmail = await getCurrentUser()

  try {
    const student = await prisma.student.findUnique({
      where: { email: studentEmail },
      include: { resources: true }
    })

    if (!student || !student.resources) return

    const buildingInfo = BUILDINGS[type as keyof typeof BUILDINGS]
    
    const currentCity = (student.cityData as any) || { buildings: [] }
    const isOccupied = currentCity.buildings.find((b: any) => b.x === x && b.y === y)
    
    if (isOccupied) return 

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

    revalidatePath('/student/city')
    
  } catch (error) {
    console.error(error)
  }
}

async function getCurrentUser() {
  const email = (await cookies()).get("lumen_session")?.value
  if (!email) redirect("/login")
  return email
}

export async function createStudent(formData: FormData) {
  const teacherEmail = await getCurrentUser()
  
  const teacher = await prisma.teacher.findUnique({ where: { email: teacherEmail } })
  if (!teacher) return { error: "Erro de permissão" }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = "123"

  try {
    await prisma.student.create({
      data: {
        name,
        email,
        password,
        schoolId: teacher.schoolId,
        resources: {
           create: { gold: 100, wood: 0, energy: 100 }
        },
        cityData: { buildings: [] }
      }
    })
    
    revalidatePath("/teacher/students")
    return { success: true }
  } catch (e) {
    return { error: "Erro ao criar aluno (Email já existe?)" }
  }
}

export async function rotateBuildingAction(buildingId: number, newRotation: number) {
  const studentEmail = await getCurrentUser();

  try {
    const student = await prisma.student.findUnique({
      where: { email: studentEmail }
    });

    if (!student) return;

    const cityData = (student.cityData as any) || { buildings: [] };
    
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

export async function updateCityName(studentId: string, newName: string) {
  if (!newName || newName.trim().length === 0) return { error: "Nome inválido" };
  if (newName.length > 20) return { error: "Nome muito longo" };

  try {
    const student = await prisma.student.findUnique({
        where: { id: studentId}, include: { resources: true } 
    });

    if (!student) return { error: "Aluno não encontrado" };

    const currentResources = (student.resources as any) || {};
    
    const newResources = {
        ...currentResources,
        cityName: newName
    };

    await prisma.student.update({
        where: { id: studentId },
        data: {
            resources: newResources
        }
    });

    revalidatePath('/');
    return { success: true };

  } catch (error) {
    console.error("Erro ao atualizar nome:", error);
    return { error: "Erro ao salvar" };
  }
}

// Ação para buscar dados de uma atividade específica
export async function getActivityById(id: string) {
  const activity = await prisma.activity.findUnique({
    where: { id },
  });
  if (!activity) throw new Error("Atividade não encontrada");
  return activity;
}

// Ação para atualizar um quiz
export async function updateQuiz(id: string, title: string, description: string, questions: any[]) {
    if (!id || !title || questions.length === 0) {
        throw new Error("Dados inválidos para atualização.");
    }

    try {
        await prisma.activity.update({
            where: { id },
            data: {
                title,
                description,
                payload: { questions },
            },
        });

        // Apenas revalida o painel para onde estamos indo.
        revalidatePath('/teacher');
    } catch (error) {
        console.error("Erro ao atualizar quiz:", error);
        throw new Error("Falha ao salvar as alterações.");
    }

    redirect('/teacher?updated=true');
}
