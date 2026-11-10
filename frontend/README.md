# Infinity — Frontend

Aplicação React + Vite + Tailwind CSS, sem backend e sem chamadas de API. Todos os dados
ficam no `localStorage` do navegador.

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Acesso de demonstração

| Perfil    | Email                | Senha     |
| --------- | -------------------- | --------- |
| Painel    | `admin@infinity.gg`  | `admin123` |
| Jogador   | `player@infinity.gg` | `player123` |

## Telas

- `#/` — home com um único bloco que leva para a página do Brawl Stars.
- `#/brawl-stars` — tela dedicada do Brawl Stars: times, elenco, campeonatos e calendário.
- `#/jogos` — catálogo de jogos.
- `#/jogos/:id` — página de um jogo.
- `#/jogadores` — elenco público.
- `#/jogadores/:id` — perfil do jogador.
- `#/entrar` — login.

## Dados

A base de demonstração é criada automaticamente na primeira execução. As alterações feitas
no painel são persistidas em `localStorage` na chave `infinity:data:v1`.

Para voltar ao estado inicial, remova essa chave no DevTools do navegador:

```js
localStorage.removeItem('infinity:data:v1')
```

## Scripts

| Comando             | Descrição                     |
| ------------------- | ----------------------------- |
| `npm run dev`       | Ambiente de desenvolvimento   |
| `npm run build`     | Typecheck + build de produção |
| `npm run preview`   | Pré-visualiza o build         |
| `npm run typecheck` | Apenas verificação de tipos   |
