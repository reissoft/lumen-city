import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Exporta as rotas para o Next.js saber lidar com a requisição
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});