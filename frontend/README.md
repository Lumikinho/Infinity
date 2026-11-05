# Infinity — Frontend

Painel minimalista de cadastro e gerenciamento de usuários, consumindo a API Express/Prisma do backend da Infinity.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Motion (animações)
- Sem bibliotecas de UI ou ícones externos

## Como rodar

O backend precisa estar em execução. Por padrão usamos `http://localhost:8089` no desenvolvimento.

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Configuração da API

Copie o `.env.example` para `.env` e ajuste os valores:

```bash
cp .env.example .env
```

```env
# Desenvolvimento: backend local (o Vite faz proxy de /api e /uploads).
VITE_API_URL_LOCAL=http://localhost:8089

# Produção: URL pública da API usada no build.
# Deixe vazio se o frontend e a API estiverem na mesma origem.
VITE_API_URL_PUBLIC=https://api.seu-dominio.com
```

- **Local (`npm run dev`)**: o navegador chama `http://localhost:5173/api/...` e o Vite encaminha para `VITE_API_URL_LOCAL`. Não precisa de CORS.
- **Pública (`npm run build`)**: as requisições usam `VITE_API_URL_PUBLIC`. Se ela ficar vazia, o frontend consome a API na mesma origem (ideal quando o backend serve o `dist`).
- **Dev contra a API pública**: aponte `VITE_API_URL_LOCAL` para a URL pública; o proxy continua evitando CORS.
- Os nomes antigos `VITE_PROXY_TARGET` e `VITE_API_URL` ainda funcionam como fallback.

> Ao usar `VITE_API_URL`/`VITE_API_URL_PUBLIC` de forma direta (sem proxy), habilite CORS no backend.

## Scripts

| Comando             | Descrição                     |
| ------------------- | ----------------------------- |
| `npm run dev`       | Ambiente de desenvolvimento   |
| `npm run build`     | Typecheck + build de produção |
| `npm run preview`   | Pré-visualiza o build         |
| `npm run typecheck` | Apenas verificação de tipos   |

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
