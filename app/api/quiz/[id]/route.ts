// app/api/quiz/[id]/route.ts
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const activity = await prisma.activity.findUnique({
    where: { id }
  })

  if (!activity) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
  }

  return NextResponse.json(activity)
}