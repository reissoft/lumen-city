// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Resend } from 'resend'; // 1. Importar o Resend

// 2. Inicializar o Resend com sua chave de API
// É uma boa prática usar variáveis de ambiente para a chave (process.env.RESEND_API_KEY)
const resend = new Resend("re_DCLXvzAd_8qNp53tkvrwkjZggMNaMuxJA"); 

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 3. Adicionar a palavra-chave 'async'
export async function sendEmail(to: string, subject: string, body: string) {
  try {
    // Agora o 'await' funcionará corretamente
    await resend.emails.send({
      from: "lumen@finansistema.online", 
      to: to,
      subject: subject,
      html: body,
    });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
  }
}

export async function sendWhatsApp(number: string, text: string) {
  const evolutionApiUrl = "https://evolution-api-production-6a59.up.railway.app";
  const evolutionApiKey = "Jesus_Te_Ama_2026";

  if (!evolutionApiUrl || !evolutionApiKey) {
    console.error("❌ ERRO FATAL: Variáveis da Evolution API não configuradas.");
    return;
  }

  const cleanNumber = "55" + number.replace(/\D/g, "");

  try {
    const response = await fetch(`${evolutionApiUrl}/message/sendText/instancia_principal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": evolutionApiKey
      },
      body: JSON.stringify({
        number: cleanNumber,
        options: { delay: 1200, presence: "composing" },
        text: text 
      })
    });

    if (!response.ok) {
       console.error(`      ❌ Erro da API Zap: ${response.status} - ${response.statusText}`);
    } else {
       console.log("      ✨ Sucesso API Zap!");
    }
  } catch (error) {
    console.error("      ❌ Erro de Conexão:", error);
  }
}
