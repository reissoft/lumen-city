//import { OurFileRouter } from "@/app/api/uploading/core";
import {
    generateUploadButton,
    generateUploadDropzone,
  } from "@uploadthing/react";
  import type { OurFileRouter } from "~/app/api/uploadthing/core"; // Ajuste o caminho se necessário
  
  export const UploadButton = generateUploadButton<OurFileRouter>();
  export const UploadDropzone = generateUploadDropzone<OurFileRouter>();