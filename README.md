# Infinity

Plataforma de vitrine de esports: jogos, times, jogadores, campeonatos e partidas.

O projeto é **somente frontend**. Não existe backend, servidor ou chamada de API: os dados
de demonstração ficam no `localStorage` do navegador e podem ser editados pelo painel.

## Funcionalidades

- Home com um único bloco de destaque que abre a página do Brawl Stars.
- Tela dedicada do Brawl Stars com times, elenco, premiações e calendário de partidas.
- Catálogo de jogos e páginas de jogo.
- Elenco público e perfil de jogador.
- Login local e painel administrativo (usuários, jogadores, times, jogos e campeonatos).
- Área do jogador com os times e campeonatos em que atua.
- Layout responsivo, estados de carregamento/vazio/erro e respeito a `prefers-reduced-motion`.

## Stack

| Camada    | Tecnologias                                          |
| --------- | ---------------------------------------------------- |
| Frontend  | React 19, TypeScript, Vite, Tailwind CSS v4, Motion   |
| Dados     | `localStorage` (base de demonstração semeada)        |

## Estrutura

```text
Infinity/
├── frontend/
│   ├── src/
│   │   ├── components/   # UI reutilizável
│   │   ├── lib/          # dados locais, rotas, sessão e formatação
│   │   ├── pages/        # páginas públicas e do painel
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── DESIGN.md
└── README.md
```

## Como rodar

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`.

### Acesso de demonstração

| Perfil  | Email                | Senha      |
| ------- | -------------------- | ---------- |
| Painel  | `admin@infinity.gg`  | `admin123` |
| Jogador | `player@infinity.gg` | `player123` |

## Rotas

A navegação usa hash routing, sem biblioteca de rotas.

| Rota                    | Tela                        | Acesso   |
| ----------------------- | --------------------------- | -------- |
| `#/`                    | Início (bloco Brawl Stars)  | Público  |
| `#/brawl-stars`         | Página do Brawl Stars       | Público  |
| `#/jogos`               | Lista de jogos              | Público  |
| `#/jogos/:id`           | Página do jogo              | Público  |
| `#/jogadores`           | Lista de jogadores          | Público  |
| `#/jogadores/:id`       | Perfil do jogador           | Público  |
| `#/entrar`              | Login                       | Público  |
| `#/usuarios`            | Usuários                    | Painel   |
| `#/gerenciar/jogadores` | Gerenciar jogadores         | Painel   |
| `#/gerenciar/times`     | Gerenciar times             | Painel   |
| `#/gerenciar/jogos`     | Gerenciar jogos             | Painel   |
| `#/campeonatos`         | Campeonatos e partidas      | Painel   |
| `#/jogador`             | Meu espaço                  | Jogador  |

## Dados locais

A base de demonstração é semeada na primeira execução e persistida em
`localStorage` na chave `infinity:data:v1`.

```js
// Voltar ao estado inicial
localStorage.removeItem('infinity:data:v1')
```

## Scripts

| Comando             | Descrição                     |
| ------------------- | ----------------------------- |
| `npm run dev`       | Servidor de desenvolvimento   |
| `npm run build`     | Typecheck + build de produção |
| `npm run preview`   | Pré-visualiza o build         |
| `npm run typecheck` | Apenas verificação de tipos   |

## Licença

Este repositório ainda não possui um arquivo de licença definido.
