# Infinity — Frontend

Painel minimalista de cadastro e gerenciamento de usuários, consumindo a API Express/Prisma do backend da Infinity.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Motion (animações)
- Sem bibliotecas de UI ou ícones externos

## Como rodar

O backend precisa estar em execução (por padrão em `http://localhost:9000`).

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

Em desenvolvimento, o Vite faz proxy de `/api` e `/uploads` para o backend, então não há necessidade de CORS.

Para apontar para outra porta/API, crie um `.env`:

```bash
VITE_PROXY_TARGET=http://localhost:9000
# ou, fora do proxy:
# VITE_API_URL=https://sua-api.exemplo.com
```

> Se usar `VITE_API_URL` direto (sem proxy), habilite CORS no backend.

## Scripts

| Comando           | Descrição                        |
| ----------------- | -------------------------------- |
| `npm run dev`     | Ambiente de desenvolvimento      |
| `npm run build`   | Typecheck + build de produção    |
| `npm run preview` | Pré-visualiza o build            |
| `npm run typecheck` | Apenas verificação de tipos    |

## Funcionalidades

- Listagem de usuários com avatar, função e data de cadastro
- Cadastro com upload de foto e revisão dos dados antes de confirmar
- Edição com confirmação das alterações antes de salvar
- Editor de foto: arraste para reposicionar, zoom e recorte 1:1
- Imagem de origem até 20 MB, redimensionada para 512×512 antes do envio
- Exclusão com confirmação
- Busca por nome/email (ignora acentos) e filtro por função
- Atalho `/` para focar a busca
- Estados de carregamento, vazio, erro e offline
- Layout responsivo (tabela no desktop, cartões no mobile)
- Animações com Motion e respeito a `prefers-reduced-motion`

## Endpoints consumidos

- `GET /api/user`
- `POST /api/user` (multipart: `name`, `email`, `password`, `profilePic`)
- `PUT /api/user/:UUID` (multipart; senha e foto opcionais)
- `DELETE /api/user/:UUID`

## Observação sobre o backend

O cadastro usa bcrypt e a velocidade depende do `SALTS` no `.env` do backend. O valor atual está em `12` (~0,4s por hash). Evite valores altos como `20`, que deixam cada cadastro lento (dezenas de segundos).
