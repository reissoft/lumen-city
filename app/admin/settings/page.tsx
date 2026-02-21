// app/admin/settings/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import SettingsClientPage from "./settings-client-page";

const prisma = new PrismaClient();

async function getSettingsData() {
    const session = cookies().get("lumen_session")?.value;
    if (!session) {
        redirect("/login");
    }

    const admin = await prisma.teacher.findFirst({
        where: {
            email: session,
            isSchoolAdmin: true,
        },
    });

    if (!admin) {
        // Adicionar tratamento de erro, talvez redirecionar ou mostrar uma mensagem
        redirect("/login");
    }

    const school = await prisma.school.findUnique({
        where: {
            id: admin.schoolId,
        },
    });

    if (!school) {
        throw new Error("Escola não encontrada para o administrador logado.");
    }

    return { admin, school };
}

export default async function AdminSettingsPage() {
    const { admin, school } = await getSettingsData();

    return <SettingsClientPage admin={admin} school={school} />;
}
