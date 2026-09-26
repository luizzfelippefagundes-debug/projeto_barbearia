# Gráficos do dashboard admin

## Contexto

O dashboard admin (`src/app/admin/(dashboard)/page.tsx`) já tem dois gráficos
feitos em SVG puro: um de linha (`SimpleLineChart`, faturamento acumulado no
mês) e um de barras (`SimpleBarChart`, serviços mais vendidos). O usuário
pediu pra melhorar esses dois e adicionar mais visualizações — os atuais "tão
meio bosta": sem interatividade (só mostram primeiro/último valor ou o valor
fixo acima da barra), sem grade, e faltam gráficos pra outras métricas
importantes (comparação entre barbeiros, composição do faturamento,
crescimento de assinantes).

Decidido via brainstorm com mockup interativo (usando o método do skill de
visualização de dados do projeto: forma pela função do dado, cor por último,
interação por padrão).

## Escopo

### 1. Melhorias nos gráficos existentes

- **`SimpleLineChart`** (usado em `FaturamentoMesCard`): adiciona grade
  horizontal sutil (3 linhas de referência) e um crosshair — ao passar o
  mouse sobre a linha, mostra uma linha vertical tracejada no ponto mais
  próximo e um tooltip com o dia + valor exato daquele ponto. Hoje só mostra
  o primeiro e o último valor abaixo do gráfico.
- **`SimpleBarChart`** (usado em `ServicosMaisVendidosCard`): adiciona
  tooltip por barra — ao passar o mouse sobre uma barra, destaca ela
  (leve aumento de brilho) e mostra um tooltip com o valor exato e a
  quantidade.

Essas duas mudanças ficam nos componentes compartilhados
(`src/components/ui/Chart/`), então qualquer outra tela que já usa esses
dois componentes ganha a melhoria de graça.

### 2. Comparativo entre barbeiros (`RankingBarbeirosCard`)

Mantém o layout de lista atual (medalha/posição, avatar, nome, nº de cortes,
faturamento) — **não vira um gráfico de barras separado** (testado no
mockup, o usuário preferiu manter a lista). Adiciona uma barra fina inline
em cada linha, com largura proporcional ao faturamento do barbeiro em
relação ao maior faturamento do mês (mesma lógica de escala do
`SimpleBarChart`: `valor / max * 100%`). Sem tooltip adicional aqui — os
números já estão todos visíveis na própria linha.

### 3. Faturamento por categoria (novo — `FaturamentoPorCategoriaCard`)

Card novo mostrando a composição do faturamento do mês: avulso (cortes),
assinaturas, produtos. Os três valores já existem prontos — vêm de
`getFechamentoCaixa()` (`{ avulso, produtos, assinatura, total }`), calculado
no próprio `page.tsx` do dashboard como `fechamentoDoMes`. Não precisa de
nenhuma query nova.

Forma: **barra horizontal única, empilhada** (100% da largura, dividida em 3
segmentos proporcionais) — não pizza/rosca (pra "parte de um todo" com
poucas categorias, barra empilhada compara mais fácil que fatias). Cada
segmento tem uma cor categórica fixa (mesma ordem sempre: avulso → indigo
accent, assinaturas → brass, produtos → um terceiro tom, a definir na
implementação seguindo o validador de paleta do skill de dataviz). Legenda
abaixo com as 3 cores + nomes. Tooltip por segmento ao passar o mouse:
categoria, valor em R$, percentual do total.

Se algum dos três valores for zero (ex: barbearia não vende produtos ainda),
o segmento correspondente simplesmente não aparece na barra (largura 0) e
não entra na legenda.

### 4. Novos assinantes por mês (novo — `NovosAssinantesCard`)

Gráfico de linha simples mostrando quantos assinantes novos entraram em cada
um dos últimos 6 meses (contagem de `assinaturas` agrupadas pelo mês de
`criadoEm`).

**Limitação assumida conscientemente:** o banco não guarda quando uma
assinatura foi cancelada (só `criadoEm`), então não é possível reconstruir
"quantos assinantes estavam ativos em cada mês passado" — só "quantos
entraram". Por isso o gráfico mostra **entradas por mês**, não "ativos por
mês". Isso ainda conta uma história real de crescimento (ou desaceleração)
sem inventar dado que o sistema não tem.

Precisa de uma função nova em `src/lib/derive.ts` (ex:
`getNovosAssinantesPorMes(assinaturas, mesReferencia)`) que agrupa por mês de
criação e devolve os últimos 6 meses (incluindo meses com zero, pra não
quebrar a escala do gráfico).

## Fora de escopo

- Filtro de período nos gráficos (ex: escolher "últimos 3 meses" vs "6
  meses") — todos os gráficos usam janelas fixas por enquanto.
- Exportar/baixar os gráficos como imagem.
- Gráficos em outras telas além do dashboard (agenda, financeiro, etc.) —
  cada uma dessas é uma rodada futura separada, se quiser.
- Reconstrução de "assinantes ativos por mês" — exigiria rastrear
  cancelamento, que é uma mudança de schema fora do escopo deste pedido.

## Abordagem técnica

Sem biblioteca de gráficos nova — tudo em SVG feito à mão, do mesmo jeito que
`SimpleLineChart`/`SimpleBarChart` já são hoje. Interatividade (crosshair,
tooltip) implementada com estado local do React (`onMouseMove`/`onMouseLeave`
no `<svg>`, calculando o ponto/barra mais próximo do cursor) — sem
dependência nova.
