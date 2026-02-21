// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Resend } from 'resend'; // 1. Importar o Resend

// 2. Inicializar o Resend com sua chave de API
// É uma boa prática usar variáveis de ambiente para a chave (process.env.RESEND_API_KEY)
const resend = new Resend(process.env.RESEND_API_KEY); 

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 3. Adicionar a palavra-chave 'async'
export async function sendEmail(to: string, subject: string, body: string) {
  try {
    // Agora o 'await' funcionará corretamente
    await resend.emails.send({
      from: "onboarding@finansistema.online", 
      to: to,
      subject: subject,
      html: body,
    });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
  }
}
