# Gráficos do Dashboard Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melhorar os dois gráficos SVG existentes do dashboard admin (tooltip no hover) e adicionar três novas visualizações (barrinha inline no ranking de barbeiros, barra empilhada de faturamento por categoria, linha de novos assinantes por mês), tudo sem biblioteca de gráficos nova.

**Architecture:** `SimpleLineChart` e `SimpleBarChart` (hoje Server Components sem interação) viram Client Components com estado local de hover — isso exige remover a prop `formatValue` (função) de ambos, já que Server Components não podem passar funções como prop pra Client Components; no lugar, `SimpleBarChart` formata sempre em R$ (seu único uso) e `SimpleLineChart` recebe um `formatType: 'currency' | 'count'` (string, serializável) pra cobrir seus dois usos (faturamento em R$, novos assinantes em contagem). Os dois novos cards (`FaturamentoPorCategoriaCard`, `NovosAssinantesCard`) reaproveitam dados que já existem (`getFechamentoCaixa`) ou uma nova função pura em `derive.ts` (`getNovosAssinantesPorMes`).

**Tech Stack:** Next.js App Router (Server/Client Components), Tailwind CSS v4, SVG + React state (sem lib de gráficos), Vitest (para a função pura nova).

---

## Como testar cada tarefa

Não há suíte de testes de componente neste projeto (só `src/lib/derive.test.ts` cobre funções puras) — a verificação de UI é `tsc`/lint + conferência visual no navegador local. A função nova em `derive.ts` (Tarefa 5) segue TDD de verdade, com teste real.

Antes da Tarefa 1, suba o servidor local numa aba separada:

```bash
npm run dev -- -p 3002
```

(Ajuste a porta se `3002` já estiver em uso.) Acesse `http://localhost:3002/admin` logado como dono, e deixe essa aba aberta pra conferir cada tarefa.

---

### Tarefa 1: `SimpleBarChart` — tooltip por barra no hover

**Files:**
- Modify: `src/components/ui/Chart/SimpleBarChart.tsx`
- Modify: `src/components/dashboard/ServicosMaisVendidosCard.tsx`

- [ ] **Passo 1: Reescrever `SimpleBarChart.tsx` inteiro**

Troque todo o conteúdo de `src/components/ui/Chart/SimpleBarChart.tsx` por:

```tsx
'use client'

import { useState } from 'react'
import { formatBRL } from '../../../lib/format'

interface DataPoint {
  label: string
  value: number
  quantidade?: number
}

interface SimpleBarChartProps {
  data: DataPoint[]
  height?: number
  barColorClassName?: string
}

export function SimpleBarChart({
  data,
  height = 140,
  barColorClassName = 'bg-brass',
}: SimpleBarChartProps) {
  const [hoverLabel, setHoverLabel] = useState<string | null>(null)
  if (data.length === 0) return null
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex w-full items-end gap-1 sm:gap-2" style={{ height }}>
      {data.map((d) => {
        const percent = (d.value / max) * 100
        const emHover = hoverLabel === d.label
        return (
          <div
            key={d.label}
            className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 sm:gap-1.5"
            onMouseEnter={() => setHoverLabel(d.label)}
            onMouseLeave={() => setHoverLabel(null)}
          >
            {emHover && (
              <div className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-sm">
                <span className="mono-value text-text-primary">{formatBRL(d.value)}</span>
                {d.quantidade !== undefined && <span className="text-text-secondary"> · {d.quantidade}x</span>}
              </div>
            )}
            <span className="mono-value w-full truncate text-center text-[10px] text-text-secondary sm:text-xs">
              {formatBRL(d.value)}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t transition-[filter] ${barColorClassName} ${emHover ? 'brightness-110' : ''}`}
                style={{ height: `${percent}%` }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] text-text-secondary sm:text-xs" title={d.label}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Passo 2: Passar `quantidade` pro gráfico em `ServicosMaisVendidosCard.tsx`**

Em `src/components/dashboard/ServicosMaisVendidosCard.tsx`, troque a linha:

```tsx
  const data = top5.map((s) => ({ label: s.servicoNome, value: s.faturamento }))
```

por:

```tsx
  const data = top5.map((s) => ({ label: s.servicoNome, value: s.faturamento, quantidade: s.quantidade }))
```

E troque:

```tsx
            <SimpleBarChart data={data} formatValue={formatBRL} />
```

por (o componente agora formata em R$ sozinho, não recebe mais `formatValue`):

```tsx
            <SimpleBarChart data={data} />
```

Se o import de `formatBRL` nesse arquivo ficar sem mais nenhum uso depois dessa troca, remova o import — confira com `grep -n formatBRL src/components/dashboard/ServicosMaisVendidosCard.tsx` (ele ainda é usado na lista abaixo do gráfico, então o import deve continuar).

- [ ] **Passo 3: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros novos.

- [ ] **Passo 4: Conferir visualmente**

Em `/admin` (dashboard), passe o mouse sobre as barras do card "Serviços mais vendidos este mês" — deve aparecer um tooltip acima da barra com o valor em R$ e a quantidade (ex: "R$ 3.320,00 · 83x"), e a barra fica levemente mais clara enquanto o mouse está em cima.

- [ ] **Passo 5: Commit**

```bash
git add src/components/ui/Chart/SimpleBarChart.tsx src/components/dashboard/ServicosMaisVendidosCard.tsx
git commit -m "feat: adiciona tooltip por barra no SimpleBarChart"
```

---

### Tarefa 2: `SimpleLineChart` — grade, crosshair e tooltip no hover

**Files:**
- Modify: `src/components/ui/Chart/SimpleLineChart.tsx`
- Modify: `src/components/dashboard/FaturamentoMesCard.tsx`
- Modify: `src/components/financeiro/RevenueAccumulatedChart.tsx`

- [ ] **Passo 1: Reescrever `SimpleLineChart.tsx` inteiro**

Troque todo o conteúdo de `src/components/ui/Chart/SimpleLineChart.tsx` por:

```tsx
'use client'

import { useState, type MouseEvent } from 'react'
import { formatBRL } from '../../../lib/format'

interface DataPoint {
  label: string
  value: number
}

interface SimpleLineChartProps {
  data: DataPoint[]
  height?: number
  /** 'currency' (padrão) formata em R$; 'count' mostra o número puro —
   * usado pelo gráfico de novos assinantes por mês. */
  formatType?: 'currency' | 'count'
}

const WIDTH = 480

function formatValor(value: number, formatType: 'currency' | 'count'): string {
  return formatType === 'count' ? `${value}` : formatBRL(value)
}

export function SimpleLineChart({ data, height = 160, formatType = 'currency' }: SimpleLineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  if (data.length === 0) return null

  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(0, ...data.map((d) => d.value))
  const range = max - min || 1

  const stepX = WIDTH / Math.max(1, data.length - 1)
  const points = data.map((d, i) => {
    const x = i * stepX
    const y = height - ((d.value - min) / range) * height
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${WIDTH} ${height} L 0 ${height} Z`

  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    let menorDistancia = Infinity
    points.forEach((p, i) => {
      const distancia = Math.abs(p.x - relativeX)
      if (distancia < menorDistancia) {
        menorDistancia = distancia
        nearest = i
      }
    })
    setHoverIndex(nearest)
  }

  const hover = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico de previsão de faturamento"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <line x1={0} y1={height * 0.25} x2={WIDTH} y2={height * 0.25} stroke="var(--color-border)" strokeWidth={1} />
        <line x1={0} y1={height * 0.5} x2={WIDTH} y2={height * 0.5} stroke="var(--color-border)" strokeWidth={1} />
        <line x1={0} y1={height * 0.75} x2={WIDTH} y2={height * 0.75} stroke="var(--color-border)" strokeWidth={1} />
        <path d={areaD} fill="var(--color-accent-muted)" stroke="none" />
        <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r={3} fill="var(--color-accent)" />
        ))}
        {hover && (
          <>
            <line
              x1={hover.x}
              y1={0}
              x2={hover.x}
              y2={height}
              stroke="var(--color-accent)"
              strokeWidth={1}
              strokeDasharray="3,3"
              opacity={0.5}
            />
            <circle cx={hover.x} cy={hover.y} r={5} fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth={2} />
          </>
        )}
      </svg>
      {hover ? (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-sm"
          style={{ left: `${(hover.x / WIDTH) * 100}%` }}
        >
          <span className="text-text-secondary">{hover.label}: </span>
          <span className="mono-value text-text-primary">{formatValor(hover.value, formatType)}</span>
        </div>
      ) : (
        <div className="mt-2 flex justify-between text-xs text-text-secondary">
          <span>{formatValor(data[0].value, formatType)}</span>
          <span>{formatValor(data[data.length - 1].value, formatType)}</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Passo 2: Atualizar `FaturamentoMesCard.tsx`**

Troque:

```tsx
          <SimpleLineChart data={data} formatValue={formatBRL} />
```

por (formato padrão já é `'currency'`, não precisa passar nada):

```tsx
          <SimpleLineChart data={data} />
```

- [ ] **Passo 3: Atualizar `RevenueAccumulatedChart.tsx`**

Mesma troca — ache a linha com `<SimpleLineChart data={data} formatValue={formatBRL} />` e troque por `<SimpleLineChart data={data} />`.

- [ ] **Passo 4: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros novos. Se `formatBRL` ficar sem uso em algum desses dois arquivos depois da troca, remova o import (confira com `grep -n formatBRL <arquivo>` — em ambos ele deve continuar em uso em outro lugar do próprio arquivo).

- [ ] **Passo 5: Conferir visualmente**

No card "Faturamento em serviços e produtos este mês" (dashboard) e também em `/admin/financeiro`, passe o mouse sobre a linha do gráfico — deve aparecer uma linha vertical tracejada acompanhando o cursor, um ponto destacado, e um tooltip acima mostrando o dia + valor em R$. Confira também que a grade horizontal sutil apareceu.

- [ ] **Passo 6: Commit**

```bash
git add src/components/ui/Chart/SimpleLineChart.tsx src/components/dashboard/FaturamentoMesCard.tsx src/components/financeiro/RevenueAccumulatedChart.tsx
git commit -m "feat: adiciona grade, crosshair e tooltip no hover do SimpleLineChart"
```

---

### Tarefa 3: Barrinha inline proporcional no ranking de barbeiros

**Files:**
- Modify: `src/components/dashboard/RankingBarbeirosCard.tsx`

- [ ] **Passo 1: Adicionar a barra inline em cada linha**

Em `src/components/dashboard/RankingBarbeirosCard.tsx`, troque o bloco do `.map`:

```tsx
          comMovimento.map((r, i) => (
            <div key={r.barbeiro.id} className="flex items-center gap-3 px-5 py-3">
              <span
                className={cn(
                  'flex w-5 shrink-0 items-center justify-center text-sm font-semibold',
                  i < 3 ? MEDALHAS[i] : 'text-text-secondary',
                )}
              >
                {i < 3 ? <Trophy size={16} aria-hidden="true" /> : i + 1}
              </span>
              <Avatar nome={r.barbeiro.nome} src={r.barbeiro.avatarUrl} size="sm" />
              <div className="flex-1">
                <p className="text-sm text-text-primary">{r.barbeiro.nome}</p>
                <p className="text-xs text-text-secondary">{r.cortes} cortes</p>
              </div>
              <span className="mono-value text-sm text-text-primary">{formatBRL(r.faturamento)}</span>
            </div>
          ))
```

por (calcula `maiorFaturamento` uma vez fora do `.map`, e adiciona a barrinha embaixo do nome):

```tsx
          comMovimento.map((r, i) => (
            <div key={r.barbeiro.id} className="flex items-center gap-3 px-5 py-3">
              <span
                className={cn(
                  'flex w-5 shrink-0 items-center justify-center text-sm font-semibold',
                  i < 3 ? MEDALHAS[i] : 'text-text-secondary',
                )}
              >
                {i < 3 ? <Trophy size={16} aria-hidden="true" /> : i + 1}
              </span>
              <Avatar nome={r.barbeiro.nome} src={r.barbeiro.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">{r.barbeiro.nome}</p>
                <p className="text-xs text-text-secondary">{r.cortes} cortes</p>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bg">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(r.faturamento / maiorFaturamento) * 100}%` }}
                  />
                </div>
              </div>
              <span className="mono-value text-sm text-text-primary">{formatBRL(r.faturamento)}</span>
            </div>
          ))
```

E logo acima da linha `const comMovimento = ranking.filter((r) => r.cortes > 0)`, adicione:

```tsx
  const maiorFaturamento = Math.max(...ranking.map((r) => r.faturamento), 1)
```

(o `, 1` no final evita divisão por zero se todo mundo tiver faturamento 0 — mesma lógica já usada em `SimpleBarChart`.)

- [ ] **Passo 2: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros novos.

- [ ] **Passo 3: Conferir visualmente**

No card "Ranking de barbeiros este mês", cada linha deve ter uma barrinha fina embaixo do nome, proporcional ao faturamento (a do primeiro colocado deve estar cheia ou quase cheia).

- [ ] **Passo 4: Commit**

```bash
git add src/components/dashboard/RankingBarbeirosCard.tsx
git commit -m "feat: adiciona barra proporcional inline no ranking de barbeiros"
```

---

### Tarefa 4: Card de faturamento por categoria (barra empilhada)

**Files:**
- Modify: `src/app/globals.css` (dois tokens de cor novos, dentro do `@theme`)
- Create: `src/components/dashboard/FaturamentoPorCategoriaCard.tsx`

- [ ] **Passo 1: Adicionar os tokens de cor categórica**

Em `src/app/globals.css`, dentro do bloco `@theme { ... }`, logo depois de `--color-brass-muted: #e3f7f5;`, adicione:

```css
  /* Cores categóricas pra gráficos com múltiplas séries (ex: composição de
   * faturamento por categoria) — validadas com o script de paleta do skill
   * de dataviz pros dois temas (claro e escuro), por isso um valor único
   * já funciona nos dois, sem precisar repetir em :root[data-theme="dark"].
   * --color-accent já é a primeira cor categórica (categoria 1); estas são
   * a 2ª e 3ª. */
  --color-chart-2: #0d9488;
  --color-chart-3: #a855f7;
```

- [ ] **Passo 2: Criar `FaturamentoPorCategoriaCard.tsx`**

Crie `src/components/dashboard/FaturamentoPorCategoriaCard.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Card, SectionHeading } from '../../components/ui'
import { formatBRL } from '../../lib/format'

interface Categoria {
  chave: string
  label: string
  valor: number
  corClassName: string
}

export function FaturamentoPorCategoriaCard({
  avulso,
  assinatura,
  produtos,
}: {
  avulso: number
  assinatura: number
  produtos: number
}) {
  const [hoverChave, setHoverChave] = useState<string | null>(null)
  const total = avulso + assinatura + produtos

  const categorias: Categoria[] = [
    { chave: 'avulso', label: 'Avulso', valor: avulso, corClassName: 'bg-accent' },
    { chave: 'assinatura', label: 'Assinaturas', valor: assinatura, corClassName: 'bg-chart-2' },
    { chave: 'produtos', label: 'Produtos', valor: produtos, corClassName: 'bg-chart-3' },
  ].filter((c) => c.valor > 0)

  return (
    <div>
      <SectionHeading>Faturamento por categoria este mês</SectionHeading>
      <Card className="flex flex-col gap-3 p-5">
        {total === 0 ? (
          <p className="text-sm text-text-secondary">Sem faturamento este mês ainda.</p>
        ) : (
          <>
            <div className="flex h-7 w-full overflow-hidden rounded-md">
              {categorias.map((c) => (
                <div
                  key={c.chave}
                  className={`relative flex items-center justify-center transition-[filter] ${c.corClassName} ${hoverChave === c.chave ? 'brightness-110' : ''}`}
                  style={{ width: `${(c.valor / total) * 100}%` }}
                  onMouseEnter={() => setHoverChave(c.chave)}
                  onMouseLeave={() => setHoverChave(null)}
                >
                  {hoverChave === c.chave && (
                    <div className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-sm">
                      <span className="text-text-primary">{c.label}: </span>
                      <span className="mono-value text-text-primary">{formatBRL(c.valor)}</span>
                      <span className="text-text-secondary"> ({Math.round((c.valor / total) * 100)}%)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {categorias.map((c) => (
                <div key={c.chave} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className={`h-2 w-2 rounded-sm ${c.corClassName}`} />
                  {c.label}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
```

- [ ] **Passo 3: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros novos. (O componente ainda não é usado em nenhuma tela — isso acontece na Tarefa 6.)

- [ ] **Passo 4: Commit**

```bash
git add src/app/globals.css src/components/dashboard/FaturamentoPorCategoriaCard.tsx
git commit -m "feat: cria FaturamentoPorCategoriaCard (barra empilhada por categoria)"
```

---

### Tarefa 5: `getNovosAssinantesPorMes` + card de novos assinantes

**Files:**
- Modify: `src/lib/derive.ts`
- Test: `src/lib/derive.test.ts`
- Create: `src/components/dashboard/NovosAssinantesCard.tsx`

- [ ] **Passo 1: Escrever o teste (falhando)**

Em `src/lib/derive.test.ts`, adicione ao final do arquivo:

```ts
describe('getNovosAssinantesPorMes — últimos 6 meses, incluindo meses sem nenhuma', () => {
  it('agrupa por mês de criação e preenche meses vazios com zero', () => {
    const assinaturas = [
      assinatura({ id: 's1', clienteId: 'c1', planoId: 'plano129', criadoEm: '2026-07-10' }),
      assinatura({ id: 's2', clienteId: 'c2', planoId: 'plano129', criadoEm: '2026-07-20' }),
      assinatura({ id: 's3', clienteId: 'c3', planoId: 'plano129', criadoEm: '2026-09-05' }),
    ]
    const resultado = getNovosAssinantesPorMes(assinaturas, '2026-09-15')
    expect(resultado).toEqual([
      { mes: '2026-04', quantidade: 0 },
      { mes: '2026-05', quantidade: 0 },
      { mes: '2026-06', quantidade: 0 },
      { mes: '2026-07', quantidade: 2 },
      { mes: '2026-08', quantidade: 0 },
      { mes: '2026-09', quantidade: 1 },
    ])
  })
})
```

Adicione `getNovosAssinantesPorMes` ao import de `'./derive'` no topo do arquivo de teste (mesma linha `import { ... } from './derive'` já existente).

- [ ] **Passo 2: Rodar o teste e confirmar que falha**

```bash
npx vitest run derive.test.ts -t "getNovosAssinantesPorMes"
```

Esperado: FAIL — `getNovosAssinantesPorMes` não existe ainda.

- [ ] **Passo 3: Implementar a função**

Em `src/lib/derive.ts`, troque a linha de import do `dateUtils`:

```ts
import { getHojeISO, getHoraAtualBrasil } from './dateUtils'
```

por:

```ts
import { addDays, getHojeISO, getHoraAtualBrasil } from './dateUtils'
```

E adicione a função (perto de `getAssinantesEmDia`, por exemplo logo depois dela):

```ts
/** Novos assinantes por mês, últimos 6 meses (incluindo o atual). Meses sem
 * nenhuma assinatura nova entram com quantidade 0, pra não quebrar a escala
 * do gráfico de linha. Não é "assinantes ativos por mês" — o banco não
 * guarda quando uma assinatura foi cancelada, só quando foi criada, então
 * só dá pra mostrar entradas, não o total ativo em cada mês passado. */
export function getNovosAssinantesPorMes(
  assinaturas: Assinatura[],
  hojeISO: string,
): Array<{ mes: string; quantidade: number }> {
  let mes = mesReferenciaDeData(hojeISO)
  const meses: string[] = [mes]
  for (let i = 0; i < 5; i++) {
    mes = mesReferenciaDeData(addDays(`${mes}-01`, -1))
    meses.unshift(mes)
  }

  const porMes = new Map<string, number>()
  assinaturas.forEach((a) => {
    const mesCriacao = mesReferenciaDeData(a.criadoEm)
    porMes.set(mesCriacao, (porMes.get(mesCriacao) ?? 0) + 1)
  })

  return meses.map((mesRef) => ({ mes: mesRef, quantidade: porMes.get(mesRef) ?? 0 }))
}
```

- [ ] **Passo 4: Rodar o teste de novo e confirmar que passa**

```bash
npx vitest run derive.test.ts -t "getNovosAssinantesPorMes"
```

Esperado: PASS.

- [ ] **Passo 5: Rodar a suíte inteira, garantir que nada quebrou**

```bash
npm run test
```

Esperado: todos os testes passando (inclui os que já existiam).

- [ ] **Passo 6: Criar `NovosAssinantesCard.tsx`**

Crie `src/components/dashboard/NovosAssinantesCard.tsx`:

```tsx
import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { SimpleLineChart } from '../../components/ui/Chart/SimpleLineChart'

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function formatMesAbrev(mesReferencia: string): string {
  const indice = Number(mesReferencia.slice(5, 7)) - 1
  return MESES_ABREV[indice]
}

export function NovosAssinantesCard({
  pontos,
}: {
  pontos: Array<{ mes: string; quantidade: number }>
}) {
  const data = pontos.map((p) => ({ label: formatMesAbrev(p.mes), value: p.quantidade }))
  const temAssinante = pontos.some((p) => p.quantidade > 0)

  return (
    <div>
      <SectionHeading>Novos assinantes por mês</SectionHeading>
      <Card className="p-5">
        {temAssinante ? (
          <SimpleLineChart data={data} height={100} formatType="count" />
        ) : (
          <EmptyState
            title="Sem novos assinantes ainda"
            description="Assim que alguém assinar um plano, o crescimento aparece aqui."
          />
        )}
      </Card>
    </div>
  )
}
```

- [ ] **Passo 7: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros novos.

- [ ] **Passo 8: Commit**

```bash
git add src/lib/derive.ts src/lib/derive.test.ts src/components/dashboard/NovosAssinantesCard.tsx
git commit -m "feat: adiciona getNovosAssinantesPorMes e NovosAssinantesCard"
```

---

### Tarefa 6: Ligar os dois cards novos no dashboard

**Files:**
- Modify: `src/app/admin/(dashboard)/page.tsx`

- [ ] **Passo 1: Importar os dois cards novos e a função nova**

No topo de `src/app/admin/(dashboard)/page.tsx`, adicione os dois imports de componente junto dos outros (logo depois da linha do `ServicosMaisVendidosCard`):

```tsx
import { FaturamentoPorCategoriaCard } from '../../../components/dashboard/FaturamentoPorCategoriaCard'
import { NovosAssinantesCard } from '../../../components/dashboard/NovosAssinantesCard'
```

E adicione `getNovosAssinantesPorMes` na lista de imports de `'../../../lib/derive'` (que hoje é `{ getAssinantesEmDia, getFaturamentoAcumuladoPorDia, getFechamentoCaixaDoDia, getFechamentoCaixa, getRankingBarbeiros, getServicosMaisVendidosNoMes }`):

```tsx
import {
  getAssinantesEmDia,
  getFaturamentoAcumuladoPorDia,
  getFechamentoCaixaDoDia,
  getFechamentoCaixa,
  getNovosAssinantesPorMes,
  getRankingBarbeiros,
  getServicosMaisVendidosNoMes,
} from '../../../lib/derive'
```

- [ ] **Passo 2: Calcular os novos assinantes por mês**

Logo depois da linha `const servicosMaisVendidos = getServicosMaisVendidosNoMes(agendamentosMes, servicos, mesReferencia)`, adicione:

```tsx
  const novosAssinantesPorMes = getNovosAssinantesPorMes(assinaturas, hojeISO)
```

- [ ] **Passo 3: Renderizar os dois cards novos**

Troque:

```tsx
      <RankingBarbeirosCard ranking={rankingBarbeiros} />

      <ServicosMaisVendidosCard servicos={servicosMaisVendidos} />

      <div>
        <SectionHeading>Links de acesso</SectionHeading>
```

por:

```tsx
      <RankingBarbeirosCard ranking={rankingBarbeiros} />

      <ServicosMaisVendidosCard servicos={servicosMaisVendidos} />

      <FaturamentoPorCategoriaCard
        avulso={fechamentoDoMes.avulso}
        assinatura={fechamentoDoMes.assinatura}
        produtos={fechamentoDoMes.produtos}
      />

      <NovosAssinantesCard pontos={novosAssinantesPorMes} />

      <div>
        <SectionHeading>Links de acesso</SectionHeading>
```

- [ ] **Passo 4: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros novos.

- [ ] **Passo 5: Conferir visualmente**

Em `/admin` (dashboard), role até depois do ranking de barbeiros e dos serviços mais vendidos — devem aparecer os dois cards novos: a barra empilhada de faturamento por categoria (com legenda e tooltip por segmento) e o gráfico de linha de novos assinantes por mês (6 pontos, rótulos "abr" a "set" ou o range correspondente ao mês atual). Se a barbearia de teste não tiver produtos/assinaturas ainda, confira que o segmento correspondente simplesmente não aparece (sem erro).

- [ ] **Passo 6: Commit**

```bash
git add "src/app/admin/(dashboard)/page.tsx"
git commit -m "feat: liga FaturamentoPorCategoriaCard e NovosAssinantesCard no dashboard"
```

---

## Depois deste plano

Não faz parte deste plano: deploy para produção (fica pra depois de validar em localhost) nem gráficos em outras telas (agenda, financeiro além do que já existe, etc.) — cada uma dessas é uma rodada futura.
