import { Elysia } from 'elysia'

const app = new Elysia()
  .get("/", () => ({
    nome: 'infinity API',
    status: "online"
  }))
  .get("/health", () => ({
    status: 'ok'
  }))
  .listen(3000)

console.log(`API disponível em http://${app.server?.hostname}:${app.server?.port}`);




