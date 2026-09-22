# Redesign visual — fundação de design

## Contexto

O NexoBarber já está em uso real (Jota Pê Barbearia + clientes pagando). O pedido foi
melhorar o visual do sistema para algo "muito mais profissional", indo tela por tela,
sem um redesign completo de uma vez. Este documento fecha a **fundação visual**
(cor, acabamento de componente, tratamento de números, animação) decidida via
brainstorm com mockups interativos. Aplicação tela por tela vem depois, usando esta
fundação como base — não é escopo deste documento.

## Paleta — indigo refinado

Mantém os dois temas (`data-theme="light"` / `"dark"`) já existentes em
`src/app/globals.css`, só com o indigo mais contrastado/saturado do que o atual:

| Token | Claro (atual → novo) | Escuro (atual → novo) |
|---|---|---|
| `--color-accent` | `#4756e6` → `#4650d6` | `#6472f5` → `#5865f2` |
| `--color-accent-hover` | `#3a46c4` → `#3a43b8` | `#7c87f7` → `#818cf8` |

Os demais tokens (`--color-bg`, `--color-surface`, `--color-border`, `--color-brass`,
status verde/âmbar/vermelho) ficam como estão — não fizeram parte da revisão.

## Acabamento de componente — "seco"

Direção final após duas rodadas de descarte (uma versão com sombra colorida/gradiente
foi rejeitada por parecer "template de IA"):

- **Sem gradiente** em botões ou cards.
- **Sem sombra colorida/glow.** Cards usam borda fina (`--color-border`) ou nenhuma.
- Hierarquia visual vem de **peso de fonte e tamanho**, não de decoração.
- Cor (`--color-accent`) só aparece na ação principal (botão primário, valores de
  destaque) — não em toda superfície.

## Números e destaque — hero stat

Para telas com estatísticas (dashboard, relatórios), evitar grade de cards todos
iguais. Padrão adotado:

- Números grandes usam `--font-mono` (`JetBrains Mono`, já existe no projeto,
  hoje pouco usado) em vez da fonte padrão — reforça a leitura de dado/métrica.
- Um card de destaque (ex.: faturamento do mês) ocupa mais espaço e usa
  `--color-accent` como fundo sólido, texto branco — os demais cards ficam
  neutros (`--color-surface`/`--color-surface-raised`) ao redor.
- Esse tratamento é para a métrica mais importante da tela, não para todo dado —
  usar com moderação para não perder o efeito.

## Animação — sutil

Duas rodadas testadas; a primeira (card sobe 3px + brilho colorido no hover) foi
julgada exagerada. Versão aprovada:

- **Entrada da tela**: fade-in + subida de 4px, ~300–350ms, `ease-out`,
  escalonada por card (~20-40ms de defasagem entre cards vizinhos).
- **Hover em card**: só clareia a borda (`--color-border` → um tom mais claro).
  Sem deslocamento de posição, sem sombra.
- **Hover em linha de lista**: fundo escurece/clareia levemente (~12% opacidade).
- **Botão**: hover muda o tom do fundo (`--color-accent` → `--color-accent-hover`);
  clique reduz opacidade momentaneamente. Sem scale/bounce.
- Nada de easing "elástico" ou bounce — sempre `ease`/`ease-out` linear e rápido.

## Fora de escopo

- Aplicação tela por tela (agenda, clientes, assinaturas, etc.) — feita depois,
  incrementalmente, reaproveitando esta fundação.
- Mudança de tokens não-relacionados a cor de destaque (`--color-bg`,
  `--color-brass`, cores de status).
- Qualquer mudança de estrutura/rota — é puramente visual.
