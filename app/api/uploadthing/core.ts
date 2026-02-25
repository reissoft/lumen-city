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
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload de anexo de atividade completo! URL:", file.url);
      
      // Simplifica o tipo de arquivo antes de retornar
      const fileType = file.type.startsWith("image/") ? "image" : (file.type === "application/pdf" ? "pdf" : "link");

      return { url: file.url, type: fileType };
    }),

} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;
