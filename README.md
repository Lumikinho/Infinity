# Infinity

Plataforma de gestão e vitrine de esports: times, jogadores, jogos, campeonatos e partidas em um só lugar.

O projeto é dividido em dois apps:

- **`backend/`** — API REST em Express + Prisma + PostgreSQL, responsável por usuários, jogadores, times, jogos, campeonatos, partidas e upload de imagens.
- **`frontend/`** — site público e painel administrativo em React + Vite + Tailwind CSS.

## Funcionalidades

### Site público

- Página inicial com contadores, premiação total, jogos em destaque, jogadores e agenda de partidas.
- Listagem de jogos; cada jogo tem sua própria página com premiação, elenco e calendário de partidas.
- Perfil de jogador com país, foto e times.
- Acompanhamento de campeonatos com partidas agrupadas por status (`Em andamento`, `Próximas`, `Encerradas`).
- Layout responsivo, estados de carregamento/vazio/erro e respeito a `prefers-reduced-motion`.

### Painel

- Login por email e senha.
- CRUD de usuários com avatar, função (`USER`, `ADMIN`, `PLAYER`) e edição de perfil.
- CRUD de jogadores, vinculados a uma conta de usuário.
- CRUD de times com logo, jogo e elenco.
- CRUD de jogos.
- CRUD de campeonatos e partidas, com placar, status e horário.
- Busca de times externos na Liquipedia ao montar uma partida.
- Área do jogador com os times e campeonatos em que atua.

## Stack

| Camada     | Tecnologias                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| Backend    | Node.js / Bun, TypeScript, Express 5, Prisma 7, PostgreSQL (Neon), Multer     |
| Autenticação | bcrypt                                                                     |
| Storage    | Disco local em desenvolvimento; Neon Object Storage (S3) em produção          |
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS v4, Motion                          |

## Estrutura do repositório

```text
Infinity/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # modelos e enums
│   │   └── migrations/            # histórico de migrações
│   ├── src/
│   │   ├── config/                # Prisma Client (adapter pg) e Multer
│   │   ├── controllers/           # validação e resposta HTTP
│   │   ├── generated/prisma/      # client gerado (não versionado)
│   │   ├── middlewares/           # upload de imagens
│   │   ├── repository/            # acesso a dados
│   │   ├── routes/                # definição das rotas
│   │   ├── services/              # integração com a Liquipedia
│   │   ├── storage/               # disco local / S3
│   │   ├── types/                 # tipos de entrada
│   │   └── server.ts              # bootstrap do Express
│   ├── uploads/                   # imagens locais (desenvolvimento)
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/            # UI reutilizável
    │   ├── lib/                   # API, rotas, sessão e formatação
    │   ├── pages/                 # páginas públicas e do painel
    │   ├── App.tsx
    │   └── main.tsx
    └── .env.example
```

## Pré-requisitos

- Node.js 20+ (ou Bun 1.2+)
- PostgreSQL acessível — o projeto foi configurado para o [Neon](https://neon.tech), mas qualquer Postgres funciona
- npm (ou Bun)

## Como rodar

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Preencha o `.env`:

| Variável                 | Descrição                                                                 |
| ------------------------ | ------------------------------------------------------------------------- |
| `SERVER_PORT`            | Porta da API (ex.: `8089`)                                                |
| `SALTS`                  | Custo do bcrypt (recomendado: `12`; valores altos deixam o cadastro lento) |
| `NODE_ENV`               | `development` ou `production`                                             |
| `DATABASE_URL`           | Connection string **pooled** usada pela aplicação em runtime               |
| `DATABASE_URL_UNPOOLED`  | Connection string **direta**, usada pela CLI do Prisma (migrações)          |
| `S3_BUCKET`              | Bucket do Neon Object Storage (apenas produção)                            |
| `AWS_ENDPOINT_URL_S3`    | Endpoint S3 do branch (apenas produção)                                    |
| `AWS_ACCESS_KEY_ID`      | Credencial do object storage (apenas produção)                             |
| `AWS_SECRET_ACCESS_KEY`  | Credencial do object storage (apenas produção)                             |
| `AWS_REGION`             | Região do bucket (apenas produção)                                         |

Depois:

```bash
npm run db:g     # gera o Prisma Client em src/generated/prisma
npm run db:m     # aplica as migrações (prisma migrate dev)
npm run dev      # inicia a API com tsx watch
```

A API sobe em `http://localhost:$SERVER_PORT` e as imagens locais ficam em `GET /uploads/...`.

> O diretório `src/generated/prisma` é ignorado pelo Git. Sempre rode `npm run db:g` após instalar as dependências.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abra `http://localhost:5173`.

| Variável             | Descrição                                                                 |
| -------------------- | ------------------------------------------------------------------------- |
| `VITE_PROXY_TARGET`  | Destino do proxy do Vite em desenvolvimento (padrão: `http://localhost:8089`) |
| `VITE_API_URL`       | URL absoluta da API quando o frontend é servido separado. Deixe vazio para usar `/api` via proxy |

Em desenvolvimento, o Vite faz proxy de `/api` e `/uploads` para o backend, então não é necessário configurar CORS. Se usar `VITE_API_URL` direto, habilite CORS no backend.

## Rotas do frontend

A navegação usa hash routing, sem biblioteca de rotas.

| Rota                        | Tela                             | Acesso   |
| --------------------------- | -------------------------------- | -------- |
| `#/`                        | Início                           | Público  |
| `#/jogos`                   | Lista de jogos                   | Público  |
| `#/jogos/:id`               | Página do jogo                   | Público  |
| `#/jogadores`               | Lista de jogadores               | Público  |
| `#/jogadores/:id`           | Perfil do jogador                | Público  |
| `#/entrar`                  | Login                            | Público  |
| `#/usuarios`                | Usuários                         | Painel   |
| `#/gerenciar/jogadores`     | Gerenciar jogadores              | Painel   |
| `#/gerenciar/times`         | Gerenciar times                  | Painel   |
| `#/gerenciar/jogos`         | Gerenciar jogos                  | Painel   |
| `#/campeonatos`             | Campeonatos e partidas           | Painel   |
| `#/jogador`                 | Meu espaço                       | Jogador  |

Após o login, usuários com função `PLAYER` são levados para `#/jogador`; os demais acessam o painel administrativo.

## API

Base: `/api`.

### Autenticação

| Método | Rota         | Descrição                          |
| ------ | ------------ | ---------------------------------- |
| `POST` | `/auth/login` | Autentica por `email` e `password` |

### Usuários

| Método   | Rota              | Descrição                                         |
| -------- | ----------------- | ------------------------------------------------- |
| `GET`    | `/user`           | Lista usuários                                    |
| `POST`   | `/user`           | Cria usuário (`multipart`: `name`, `email`, `password`, `role`, `profilePic`) |
| `PUT`    | `/user/:UUID`     | Atualiza usuário (campos opcionais)               |
| `DELETE` | `/user/:UUID`     | Remove usuário e suas imagens                     |

### Jogadores

| Método   | Rota                    | Descrição                                          |
| -------- | ----------------------- | -------------------------------------------------- |
| `GET`    | `/player`               | Lista jogadores com times                          |
| `GET`    | `/player/user/:userId`  | Busca o jogador vinculado a uma conta              |
| `GET`    | `/player/:id`           | Busca jogador por id                               |
| `POST`   | `/player`               | Cria jogador (`multipart`: `nickname`, `realName`, `country`, `userId`, `photo`) |
| `PUT`    | `/player/:id`           | Atualiza jogador                                   |
| `DELETE` | `/player/:id`           | Remove jogador                                     |

### Times

| Método   | Rota          | Descrição                                                     |
| -------- | ------------- | ------------------------------------------------------------- |
| `GET`    | `/team`       | Lista times com jogo e elenco                                 |
| `GET`    | `/team/:id`   | Busca time por id                                             |
| `POST`   | `/team`       | Cria time (`multipart`: `name`, `tag`, `gameId`, `playerIds` em JSON, `logo`) |
| `PUT`    | `/team/:id`   | Atualiza time e elenco                                        |
| `DELETE` | `/team/:id`   | Remove time                                                   |

### Jogos

| Método   | Rota          | Descrição              |
| -------- | ------------- | ---------------------- |
| `GET`    | `/game`       | Lista jogos            |
| `POST`   | `/game`       | Cria jogo (`name`)     |
| `PUT`    | `/game/:id`   | Renomeia jogo          |
| `DELETE` | `/game/:id`   | Remove jogo sem vínculos |

### Campeonatos

| Método   | Rota                       | Descrição                                  |
| -------- | -------------------------- | ------------------------------------------ |
| `GET`    | `/championship`            | Lista campeonatos com partidas             |
| `GET`    | `/championship/player/:userId` | Campeonatos dos times do jogador       |
| `POST`   | `/championship`            | Cria campeonato                            |
| `PUT`    | `/championship/:id`        | Atualiza campeonato                        |
| `DELETE` | `/championship/:id`        | Remove campeonato e partidas em cascata    |

### Partidas

| Método   | Rota           | Descrição                     |
| -------- | -------------- | ----------------------------- |
| `GET`    | `/match`       | Lista partidas                |
| `POST`   | `/match`       | Cria partida                  |
| `PUT`    | `/match/:id`   | Atualiza partida              |
| `DELETE` | `/match/:id`   | Remove partida                |

Uma partida aceita times cadastrados (`homeTeamId` / `awayTeamId`) ou times externos apenas pelo nome (`homeTeamName` / `awayTeamName`). O status pode ser `SCHEDULED`, `LIVE` ou `FINISHED`; partidas finalizadas exigem placar.

### Times externos

| Método | Rota              | Descrição                                                        |
| ------ | ----------------- | ---------------------------------------------------------------- |
| `GET`  | `/external-team`  | Sugere times na Liquipedia (`?gameId=...&q=...`, mínimo 2 caracteres) |

A integração usa a API `opensearch` da Liquipedia, com cache em memória de 5 minutos, limite de 10 sugestões e intervalo mínimo de 2 segundos entre requisições.

## Modelo de dados

- `Users` — conta de acesso (`USER`, `ADMIN`, `PLAYER`), com senha em bcrypt.
- `Players` — perfil de jogador, ligado 1:1 a `Users`.
- `Team` — time de um `Game`, com tag e logo.
- `TeamPlayer` — relação N:N entre times e jogadores.
- `Game` — jogo/modalidade, com nome único.
- `Championship` — campeonato de um `Game`, com data de início, término opcional e premiação.
- `Match` — partida de um campeonato, com times locais ou externos, horário, status e placar.

## Uploads e armazenamento

- Formatos aceitos: JPEG, PNG e WebP.
- Tamanho máximo: 5 MB.
- Em `NODE_ENV=development`, os arquivos são gravados em `backend/uploads/` e servidos por `/uploads`.
- Em `NODE_ENV=production`, os arquivos vão para o Neon Object Storage (S3) e a API devolve URLs assinadas com validade de 7 dias.
- Ao trocar ou remover uma imagem, o arquivo anterior também é apagado.

## Scripts

### Backend

| Comando            | Descrição                                              |
| ------------------ | ------------------------------------------------------ |
| `npm run dev`      | API em modo watch com `tsx`                            |
| `npm run dev:bun`  | API em modo watch com Bun                              |
| `npm run check`    | Verificação de tipos (`tsc --noEmit`)                  |
| `npm run build`    | Executa `tsc` (typecheck — o `tsconfig` atual usa `noEmit`) |
| `npm run fmt`      | Formatação com Prettier                                |
| `npm run db:g`     | Gera o Prisma Client                                   |
| `npm run db:m`     | Roda `prisma migrate dev`                              |

### Frontend

| Comando             | Descrição                     |
| ------------------- | ----------------------------- |
| `npm run dev`       | Servidor de desenvolvimento   |
| `npm run build`     | Typecheck + build de produção |
| `npm run preview`   | Pré-visualiza o build         |
| `npm run typecheck` | Apenas verificação de tipos   |

## Segurança e limitações conhecidas

- O login valida email e senha, mas a API **não emite token/JWT** e as rotas não têm middleware de autorização. O controle de acesso por função existe apenas no frontend (sessão em `localStorage`). Para produção, o ideal é adicionar autenticação por token e proteger as rotas de escrita.
- Não há CORS configurado no backend. Em desenvolvimento, use o proxy do Vite.
- Não há suíte de testes automatizados.
- O `npm run build` do backend apenas executa o typecheck, pois o `tsconfig.json` define `noEmit: true`; para gerar `dist/`, ajuste essa configuração ou use um bundler.
- `src/generated/prisma` não é versionado e precisa ser regenerado com `npm run db:g`.

## Licença

Este repositório ainda não possui um arquivo de licença definido.
