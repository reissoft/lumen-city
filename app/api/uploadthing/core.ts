import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  churchLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completo! URL:", file.url);
      return { url: file.url };
    }),
  
  activityAttachment: f({
    image: { maxFileSize: "4MB" },
    pdf: { maxFileSize: "16MB" },
    audio: { maxFileSize: "8MB" }, // Adicionado suporte para áudio
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload de anexo de atividade completo! URL:", file.url, "Tipo:", file.type);
      
      // Lógica aprimorada para simplificar o tipo de arquivo
      let simpleType: string;
      if (file.type.startsWith("image/")) {
        simpleType = "image";
      } else if (file.type === "application/pdf") {
        simpleType = "pdf";
      } else if (file.type.startsWith("audio/")) {
        simpleType = "audio";
      } else {
        simpleType = "link"; // Fallback para outros tipos
      }

      return { url: file.url, type: simpleType };
    }),

} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;
