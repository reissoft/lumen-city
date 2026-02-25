// app/actions.ts
'use server'

import Groq from 'groq-sdk'
import { PrismaClient, Activity } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from "next/headers"
import bcrypt from 'bcryptjs'
import { BUILDING_CONFIG, BuildingType } from '@/app/config/buildings'

const prisma = new PrismaClient()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function getCurrentUser() {
  const session = (await cookies()).get("lumen_session")?.value
  if (!session) redirect("/login")
  return session
}

// --- ACTIVITY CREATION ---

export async function generateQuiz(formData: FormData) {
  const topic = formData.get('topic') as string
  const contextText = formData.get('contextText') as string
  const additionalNotes = formData.get('additionalNotes') as string
  const classIdsJSON = formData.get('classIds') as string;
  const classIds = JSON.parse(classIdsJSON);
  
  const teacherEmail = await getCurrentUser()
  let newActivity: Activity;

  if (!topic || !classIds || classIds.length === 0) {
      throw new Error("O tema e ao menos uma turma são obrigatórios.");
  }


  const systemPrompt = `
    Você é um assistente pedagógico especializado em criar material didático gamificado.
    Sua tarefa é gerar um Quiz sobre o tema fornecido. A saída DEVE ser estritamente um JSON válido seguindo esta estrutura, sem texto adicional antes ou depois:
    {
        "title": "Título Criativo sobre o Tema",
        "description": "Uma descrição curta e engajadora do quiz",
        "questions": [
            {
                "text": "O enunciado da pergunta 1",
                "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
                "correct": 0
            },
            {
                "text": "O enunciado da pergunta 2",
                "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
                "correct": 1
            }
        ]
    }
    Gere 5 perguntas caso não seja informado a quantidade.
    ${contextText ? 
    `---CONTEXTO---\nUse o seguinte texto como fonte primária e obrigatória para criar as perguntas e respostas. As perguntas devem ser diretamente baseadas neste conteúdo:\n${contextText}\n---FIM DO CONTEXTO---` 
    : ''
    }
    ${additionalNotes ? 
    `---INSTRUÇÕES ADICIONAIS---\nLeve em consideração as seguintes instruções do professor ao gerar o quiz:\n${additionalNotes}\n---FIM DAS INSTRUÇÕES---` 
    : ''
    }
  `;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Gere um quiz sobre o tema: ${topic}` }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" } 
    });

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error("Sem resposta da IA.")

    const quizData = JSON.parse(content)

    const teacher = await prisma.teacher.findFirst({ where: { email: teacherEmail } })
    if (!teacher) throw new Error("Professor não encontrado.")

    newActivity = await prisma.activity.create({
      data: {
        title: topic,
        description: quizData.description || `Quiz sobre ${topic}`,
        type: 'QUIZ',
        difficulty: 1, 
        teacherId: teacher.id,
        payload: { questions: quizData.questions },
        classes: { 
          connect: classIds.map((id: string) => ({ id }))
        }
      }
    });
    
  } catch (error) {
    console.error("Erro na geração com IA:", error)
    throw new Error("Falha ao gerar o quiz com IA.");
  }

  revalidatePath('/teacher')
  redirect(`/teacher/activity/${newActivity.id}/edit?created=true`)
}

export async function createManualQuiz(title: string, description: string, questions: any[], classIds: string[]) {
    const teacherEmail = await getCurrentUser();
    let newActivity: Activity;

    if (!title || questions.length === 0 || !classIds || classIds.length === 0) {
        throw new Error("Título, ao menos uma questão e uma turma são obrigatórios.");
    }

    try {
        const teacher = await prisma.teacher.findUnique({ where: { email: teacherEmail } });
        if (!teacher) throw new Error("Professor não encontrado.");

        newActivity = await prisma.activity.create({
            data: {
                title,
                description: description || "Quiz criado manualmente", 
                type: 'QUIZ',
                difficulty: 1,
                teacherId: teacher.id,
                payload: { questions },
                classes: {
                    connect: classIds.map((id: string) => ({ id }))
                }
            },
        });

    } catch (error) {
        console.error("Erro ao criar quiz manual:", error);
        throw new Error("Não foi possível salvar a atividade.");
    }

    revalidatePath('/teacher');
    redirect(`/teacher/activity/${newActivity.id}/edit?created=true`);
}

// --- ACTIVITY MANAGEMENT ---

export async function getActivityById(id: string) {
  const activity = await prisma.activity.findUnique({ 
    where: { id },
    include: {
      classes: {
        select: { id: true }
      }
    }
  });
  if (!activity) throw new Error("Atividade não encontrada");
  return activity;
}

export async function updateQuiz(id: string, title: string, description: string, questions: any[], reviewMaterials: {url: string, type: string}[], classIds: string[]) {
    if (!id || !title || questions.length === 0) {
        throw new Error("Dados inválidos para atualização.");
    }
    if (!classIds) { 
        throw new Error("A seleção de turmas é inválida.");
    }

    try {
        // Normaliza o tipo e transforma o array de objetos em um array de strings JSON
        const materialsAsJsonStrings = reviewMaterials.map(material => {
            let simpleType = material.type;
            if (material.type === 'application/pdf') {
                simpleType = 'pdf';
            } else if (material.type && material.type.startsWith('image/')) {
                simpleType = 'image';
            }
            return JSON.stringify({ url: material.url, type: simpleType });
        });

        await prisma.activity.update({
            where: { id },
            data: {
                title,
                description,
                payload: { questions },
                reviewMaterials: materialsAsJsonStrings, // Salva o array de strings normalizadas
                classes: {
                  set: classIds.map(id => ({ id }))
                }
            },
        });

        revalidatePath('/teacher');
        revalidatePath(`/teacher/activity/${id}/edit`);

    } catch (error) {
        console.error("Erro ao atualizar quiz:", error);
        throw new Error("Falha ao salvar as alterações.");
    }

    redirect('/teacher?updated=true');
}


export async function deleteActivity(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) return
  try {
    await prisma.activity.delete({ where: { id } })
    revalidatePath('/teacher')
  } catch (error) {
    console.error("Erro ao deletar:", error)
  }
}

// --- STUDENT & SUBMISSIONS ---

const getTotalXpForLevelStart = (level: number): number => {
    if (level <= 1) return 0;
    const n = level - 1;
    const a1 = 100;
    const an = n * 100;
    return (n * (a1 + an)) / 2;
};

const calculateXp = (score: number, difficulty: number): number => {
    if (score < 0) return 0;
    return Math.round(score * (1 + (difficulty - 1) * 0.5));
};

export async function submitQuizResult(activityId: string, score: number) {
    const userIdentifier = await getCurrentUser();

    const student = await prisma.student.findUnique({
        where: { username: userIdentifier }, // Busca pelo username
        select: { id: true, xp: true, level: true, resources: true }
    });

    if (!student) throw new Error("Estudante não encontrado.");

    const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        select: { difficulty: true }
    });

    if (!activity) throw new Error("Atividade não encontrada.");

    const bestPreviousAttempt = await prisma.activityAttempt.findFirst({
        where: { studentId: student.id, activityId: activityId },
        orderBy: { score: 'desc' }
    });

    const previousBestScore = bestPreviousAttempt?.score || 0;

    if (score <= previousBestScore) {
        await prisma.activityAttempt.create({
            data: {
                studentId: student.id,
                activityId: activityId,
                score: score,
                response: {},
                rewarded: false,
            }
        });

        revalidatePath('/student');
        return {
            success: true,
            message: `Você conseguiu ${score}%. Sua melhor pontuação é ${previousBestScore}%. Tente de novo para ganhar mais XP!`,
            passed: score >= 70
        };
    }

    const xpFromNewScore = calculateXp(score, activity.difficulty);
    const xpFromOldScore = calculateXp(previousBestScore, activity.difficulty);
    const xpGained = xpFromNewScore - xpFromOldScore;
    
    const passed = score >= 70;
    const goldReward = passed ? 10 : 0;

    const newTotalXp = student.xp + xpGained;
    
    let newLevel = student.level;
    while (newTotalXp >= getTotalXpForLevelStart(newLevel + 1)) {
        newLevel++;
    }
    
    await prisma.$transaction([
        prisma.activityAttempt.create({
            data: {
                studentId: student.id,
                activityId: activityId,
                score: score,
                response: {},
                rewarded: true,
            }
        }),
        prisma.student.update({
            where: { id: student.id },
            data: {
                xp: newTotalXp,
                level: newLevel,
                resources: {
                    upsert: {
                        create: { gold: goldReward },
                        update: {
                            gold: {
                                increment: goldReward
                            }
                        }
                    }
                }
            }
        })
    ]);

    revalidatePath('/student');
    
    let rewardMessage = `Parabéns! Você superou sua pontuação e ganhou +${xpGained} XP!`;
    if (goldReward > 0) {
        rewardMessage += ` E também +${goldReward} de Ouro!`;
    }

    return {
        success: true,
        message: rewardMessage,
        passed: passed
    };
}


export async function createStudent(formData: FormData) {
  const teacherEmail = await getCurrentUser()
  const teacher = await prisma.teacher.findUnique({ where: { email: teacherEmail } })
  if (!teacher) return { error: "Erro de permissão" }

  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const guardianEmail = formData.get("guardianEmail") as string
  const guardianPhone = formData.get("guardianPhone") as string

  if (!username) {
    return { error: "O nome de usuário é obrigatório." };
  }

  const password = "123" // Senha padrão
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.student.create({
      data: {
        name,
        username,
        password: hashedPassword,
        guardianEmail,
        guardianPhone,
        schoolId: teacher.schoolId,
        resources: { create: { gold: 100, wood: 0, energy: 100 } },
        cityData: { buildings: [] }
      }
    })
    
    revalidatePath("/teacher/students")
    return { success: true }
  } catch (e: any) {
     if (e.code === 'P2002' && e.meta?.target?.includes('username')) {
        return { error: "Este nome de usuário já está em uso. Tente outro." };
    }
    return { error: "Erro ao criar aluno. Verifique os dados e tente novamente." }
  }
}

// --- CITY & RESOURCES ---

const BUILDINGS = BUILDING_CONFIG;

export async function buyBuilding(type: string, x: number, y: number) {
  const studentUsername = await getCurrentUser();

  try {
    const student = await prisma.student.findUnique({
      where: { username: studentUsername },
      include: { resources: true },
    });

    if (!student) {
      console.error("Ação 'buyBuilding': Aluno não encontrado.");
      return;
    }

    // VERIFICA E CRIA RECURSOS SE NÃO EXISTIREM (SOLUÇÃO ROBUSTA)
    let studentResources = student.resources;
    if (!studentResources) {
      console.log(`Criando registro de recursos para o aluno: ${student.id}`);
      studentResources = await prisma.studentResources.create({
        data: {
          studentId: student.id,
          gold: 0, // Valor inicial padrão
        },
      });
    }

    const buildingInfo = BUILDINGS[type as keyof typeof BUILDINGS];

    // VERIFICA SE TEM OURO SUFICIENTE
   /* if (studentResources.gold < buildingInfo.cost) {
      console.error("Ação 'buyBuilding': Ouro insuficiente.");
      return; // Retorna para não continuar a execução
    }*/

    const currentCity = (student.cityData as any) || { buildings: [] };
    const isOccupied = currentCity.buildings.find((b: any) => b.x === x && b.y === y);

    if (isOccupied) {
      console.error("Ação 'buyBuilding': Local já ocupado.");
      return;
    }

    const newBuilding = { id: Date.now(), type, x, y, rotation: 0 };
    
    // SOLUÇÃO DE IMUTABILIDADE: Cria um novo objeto cityData
    const newCityData = {
        ...currentCity,
        buildings: [...currentCity.buildings, newBuilding]
    };

    // Executa a atualização no banco de dados
    await prisma.student.update({
      where: { id: student.id },
      data: {
        resources: {
          update: {
            gold: { decrement: buildingInfo.cost },
          },
        },
        cityData: newCityData, // Salva o novo objeto
      },
    });

    console.log("Debug: Construção salva no banco de dados!");
    revalidatePath('/student/city');

  } catch (error) {
    console.error("Erro na função 'buyBuilding':", error);
  }
}

export async function rotateBuildingAction(buildingId: number, newRotation: number) {
  const studentUsername = await getCurrentUser();

  try {
    const student = await prisma.student.findUnique({
      where: { username: studentUsername }
    });

    if (!student) return;

    const cityData = (student.cityData as any) || { buildings: [] };
    
    // SOLUÇÃO DE IMUTABILIDADE
    const newBuildings = cityData.buildings.map((b: any) => 
      b.id === buildingId ? { ...b, rotation: newRotation } : b
    );
    const newCityData = { ...cityData, buildings: newBuildings };

    await prisma.student.update({
      where: { id: student.id },
      data: { cityData: newCityData }
    });

    revalidatePath('/student/city');
  } catch (error) {
    console.error("Erro ao rotacionar no banco:", error);
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

export async function demolishBuildingAction(buildingId: number) {
  const studentUsername = await getCurrentUser();

  try {
    const student = await prisma.student.findUnique({
      where: { username: studentUsername }
    });

    if (!student) return;

    const cityData = (student.cityData as any) || { buildings: [] };
    
    // SOLUÇÃO DE IMUTABILIDADE
    const newBuildings = cityData.buildings.filter((b: any) => b.id !== buildingId);
    const newCityData = { ...cityData, buildings: newBuildings };


    await prisma.student.update({
      where: { id: student.id },
      data: { cityData: newCityData }
    });

    revalidatePath('/student/city');
  } catch (error) {
    console.error("Erro ao demolir no banco:", error);
  }
}
