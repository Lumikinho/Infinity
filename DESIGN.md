# Infinity — Design Direction

## Identidade

Plataforma competitiva da Infinity: vitrine de jogos, elencos, premiações e calendário de partidas.

## Personalidade

Transmissão de campeonato. Direta, competitiva, com cara de placar e overlay de broadcast. Nada de "startup suave": tipografia condensada, números tabulares, bordas retas e um único acento ácido.

## Paleta

| Token            | Valor     | Uso                                              |
| ---------------- | --------- | ------------------------------------------------ |
| `canvas`         | `#0A0B0D` | Fundo da página                                  |
| `surface`        | `#121417` | Painéis, cards, cabeçalho                        |
| `ink`            | `#F3F5F4` | Texto principal                                  |
| `muted`          | `#98A1A8` | Texto secundário                                 |
| `line`           | `#24292F` | Bordas decorativas e divisores                   |
| `line-strong`    | `#5F6770` | Bordas de controles (inputs, botões secundários) |
| `accent`         | `#C8F751` | CTA principal, premiação, item ativo, "ao vivo"  |
| `accent-strong`  | `#B4E63A` | Hover do acento                                  |

Acento único e escasso. Erros usam texto claro sobre `neutral-100`, não vermelho decorativo.

## Tipografia

- **Display:** Barlow Condensed 600/700, caixa alta, para títulos, navegação e números de placar. Voz de broadcast esportivo.
- **Corpo:** Barlow 400/500/600. Grotesca industrial legível em blocos densos.
- **Números:** `font-variant-numeric: tabular-nums` em placares e premiações.

## Forma e movimento

- Raio pequeno: 1 a 4 px. Cantos retos; `rounded-full` só em avatares e indicadores.
- Sem sombras difusas; hierarquia por borda, cor de fundo e escala tipográfica.
- Sem glassmorphism, sem glow, sem grade de fundo.
- Movimento: apenas transições de hover/focus (MOTION 1).

## Dials

`ENERGY 2 / RHYTHM 3 / MOTION 1`

## Regras de composição

- Um foco por tela: na home, a próxima partida; na página do jogo, o bloco de premiação.
- Micro-rótulos em caixa alta com tracking curto (10 a 11 px).
- Verde-limão nunca em áreas grandes de texto corrido; em superfícies sólidas, o texto por cima é `canvas`.
- Estados vazio, carregando e erro sempre presentes e com texto.
