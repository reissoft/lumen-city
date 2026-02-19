// app/teacher/create-activity/actions.ts
"use server"

import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

// Ação para buscar as turmas de um professor
export async function getTeacherClasses() {
    const cookieStore = cookies();
    const email = cookieStore.get("lumen_session")?.value;
    if (!email) redirect("/login");

    try {
        const teacher = await prisma.teacher.findUnique({
            where: { email },
            select: {
                classes: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        if (!teacher) {
            throw new Error("Professor não encontrado.");
        }

        return teacher.classes;

    } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        // Retornar um array vazio em caso de erro para não quebrar o cliente
        return []; 
    }
}
