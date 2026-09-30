# Histórico Considera Agendamentos Vencidos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O histórico e a contagem "Cortes no total" do cliente passam a incluir agendamentos `confirmado` cujo horário já passou (mesma regra já usada pro faturamento), sem tocar o banco nem a fidelidade.

**Architecture:** Reaproveita a função `contaComoAtendimento` (hoje privada em `lib/derive.ts`) exportando-a. Uma nova query em `db/queries/agendamentos.ts` busca os agendamentos `confirmado` de um cliente; `getClienteComHistorico` filtra os vencidos com `contaComoAtendimento` e sintetiza uma entrada de histórico por serviço, misturando com os `haircut_records` reais. Um campo `pendente?: boolean` no tipo `HaircutRecord` marca essas entradas sintéticas, e `ClienteVisitHistory` usa isso pra esconder o link "Avaliar" nelas.

**Tech Stack:** Next.js (Server Components), Drizzle ORM, Vitest (só a exportação da função pura, sem teste novo de query — este projeto não tem suíte de teste de banco/componente).

---

## Como testar cada tarefa

Não há suíte de testes de query/componente neste projeto (só `src/lib/derive.test.ts` cobre funções puras). A verificação aqui é `tsc`/lint + os testes existentes de `derive.ts` (garantir que exportar a função não quebra nada) + conferência visual no navegador local.

Antes da Tarefa 1, suba o servidor local numa aba separada:

```bash
npm run dev -- -p 3002
```

(Ajuste a porta se `3002` estiver em uso.)

---

### Tarefa 1: Exportar `contaComoAtendimento` e adicionar `pendente` ao tipo

**Files:**
- Modify: `src/lib/derive.ts:25`
- Modify: `src/types/cliente.ts`

- [ ] **Passo 1: Exportar a função**

Em `src/lib/derive.ts`, ache a linha:

```ts
function contaComoAtendimento(a: Pick<Agendamento, 'status' | 'continuacaoDeId' | 'data' | 'hora'>): boolean {
```

Troque só o `function` por `export function` (o resto da função continua idêntico):

```ts
export function contaComoAtendimento(a: Pick<Agendamento, 'status' | 'continuacaoDeId' | 'data' | 'hora'>): boolean {
```

- [ ] **Passo 2: Adicionar o campo `pendente` ao tipo `HaircutRecord`**

Em `src/types/cliente.ts`, troque:

```ts
export interface HaircutRecord {
  id: string
  data: string
  barbeiroId: string
  servicoId: string
  fotoUrl?: string
  notas?: string
  avaliacao?: ThumbUpDown
}
```

por (adiciona `pendente` no final):

```ts
export interface HaircutRecord {
  id: string
  data: string
  barbeiroId: string
  servicoId: string
  fotoUrl?: string
  notas?: string
  avaliacao?: ThumbUpDown
  /** true = agendamento vencido ainda não confirmado pelo barbeiro, exibido
   * como se fosse atendido (mesma regra do faturamento) — não existe
   * haircut_record de verdade por trás, então não pode ser avaliado. */
  pendente?: boolean
}
```

- [ ] **Passo 3: Rodar os testes existentes de `derive.ts` (não deve quebrar nada — só exportou uma função já existente)**

```bash
npx vitest run derive.test.ts
```

Esperado: todos os testes continuam passando (mesma quantidade de antes).

- [ ] **Passo 4: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros novos.

- [ ] **Passo 5: Commit**

```bash
git add src/lib/derive.ts src/types/cliente.ts
git commit -m "feat: exporta contaComoAtendimento e adiciona campo pendente a HaircutRecord"
```

---

### Tarefa 2: Nova query — agendamentos confirmados de um cliente

**Files:**
- Modify: `src/db/queries/agendamentos.ts`

- [ ] **Passo 1: Adicionar a função nova**

Em `src/db/queries/agendamentos.ts`, adicione essa função (pode ser logo depois de `getProximosAgendamentosDoCliente`, no final do arquivo):

```ts
/** Agendamentos 'confirmado' (sem contar continuações de slot) de um
 * cliente — inclui tanto os futuros quanto os já vencidos. Quem decide
 * quais contam como "provavelmente atendido" é `contaComoAtendimento`,
 * em lib/derive.ts, chamada por quem consome isso (ex: getClienteComHistorico). */
export async function getAgendamentosConfirmadosDoCliente(clienteId: string): Promise<Agendamento[]> {
  const rows = await getDb()
    .select()
    .from(agendamentos)
    .where(
      and(
        eq(agendamentos.clienteId, clienteId),
        eq(agendamentos.status, 'confirmado'),
        isNull(agendamentos.continuacaoDeId),
      ),
    )
  return mapearComServicos(rows)
}
```

`and`, `eq`, `isNull` já estão importados no topo do arquivo (mesma linha `import { and, eq, gte, inArray, isNull, lt } from 'drizzle-orm'`) — confirme com `grep -n "^import.*drizzle-orm" src/db/queries/agendamentos.ts` que `isNull` já está na lista antes de rodar o próximo passo (se não estiver, adicione).

- [ ] **Passo 2: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros novos. (Essa função ainda não é usada em nenhum lugar — isso acontece na Tarefa 3.)

- [ ] **Passo 3: Commit**

```bash
git add src/db/queries/agendamentos.ts
git commit -m "feat: adiciona getAgendamentosConfirmadosDoCliente"
```

---

### Tarefa 3: Misturar agendamentos vencidos no histórico do cliente

**Files:**
- Modify: `src/db/queries/clientes.ts`

- [ ] **Passo 1: Adicionar os imports novos**

No topo de `src/db/queries/clientes.ts`, troque:

```ts
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '../index'
import { clientes, haircutRecords } from '../schema'
import { nullToUndefined } from '../../lib/db-map'
import type { Cliente, HaircutRecord } from '../../types'
```

por:

```ts
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '../index'
import { clientes, haircutRecords } from '../schema'
import { nullToUndefined } from '../../lib/db-map'
import { contaComoAtendimento } from '../../lib/derive'
import { getAgendamentosConfirmadosDoCliente } from './agendamentos'
import type { Cliente, HaircutRecord } from '../../types'
```

- [ ] **Passo 2: Misturar os agendamentos vencidos no histórico**

Em `src/db/queries/clientes.ts`, troque a função `getClienteComHistorico`:

```ts
export async function getClienteComHistorico(id: string, barbeariaId: string): Promise<Cliente | null> {
  const db = getDb()
  const [clienteRow] = await db
    .select()
    .from(clientes)
    .where(and(eq(clientes.id, id), eq(clientes.barbeariaId, barbeariaId)))
    .limit(1)
  if (!clienteRow) return null

  const historicoRows = await db
    .select()
    .from(haircutRecords)
    .where(eq(haircutRecords.clienteId, id))
    .orderBy(desc(haircutRecords.data))

  return toAppCliente(clienteRow, historicoRows.map(toAppHaircutRecord))
}
```

por:

```ts
export async function getClienteComHistorico(id: string, barbeariaId: string): Promise<Cliente | null> {
  const db = getDb()
  const [clienteRow] = await db
    .select()
    .from(clientes)
    .where(and(eq(clientes.id, id), eq(clientes.barbeariaId, barbeariaId)))
    .limit(1)
  if (!clienteRow) return null

  const historicoRows = await db
    .select()
    .from(haircutRecords)
    .where(eq(haircutRecords.clienteId, id))
    .orderBy(desc(haircutRecords.data))

  const agendamentosConfirmados = await getAgendamentosConfirmadosDoCliente(id)
  const pendentes: HaircutRecord[] = agendamentosConfirmados
    .filter(contaComoAtendimento)
    .flatMap((a) =>
      a.servicoIds.map((servicoId) => ({
        id: `${a.id}-${servicoId}`,
        data: a.data,
        barbeiroId: a.barbeiroId,
        servicoId,
        pendente: true,
      })),
    )

  const historico = [...historicoRows.map(toAppHaircutRecord), ...pendentes].sort((a, b) =>
    b.data.localeCompare(a.data),
  )

  return toAppCliente(clienteRow, historico)
}
```

- [ ] **Passo 3: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros novos.

- [ ] **Passo 4: Commit**

```bash
git add src/db/queries/clientes.ts
git commit -m "feat: getClienteComHistorico mistura agendamentos vencidos como pendentes"
```

---

### Tarefa 4: Esconder "Avaliar" nas entradas pendentes + conferência final

**Files:**
- Modify: `src/components/clientes/ClienteVisitHistory.tsx`

- [ ] **Passo 1: Não mostrar o link "Avaliar" em entradas pendentes**

Em `src/components/clientes/ClienteVisitHistory.tsx`, troque:

```tsx
              {!h.avaliacao && mostrarAvaliar && (
                <Link href={`/cliente/avaliar/${h.id}`} className="text-xs text-accent underline">
                  Avaliar
                </Link>
              )}
```

por:

```tsx
              {!h.avaliacao && mostrarAvaliar && !h.pendente && (
                <Link href={`/cliente/avaliar/${h.id}`} className="text-xs text-accent underline">
                  Avaliar
                </Link>
              )}
```

- [ ] **Passo 2: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros novos.

- [ ] **Passo 3: Conferir visualmente**

Pra testar de verdade, precisa de um agendamento `confirmado` com data/hora já passada e que nunca foi marcado como atendido nem "não compareceu". Se não tiver um assim à mão, crie um rapidinho pelo `/admin/agenda` marcando um horário pra alguns minutos atrás (ou um cliente que você já sabe que tem um agendamento assim, como o "Luiz Felippe Silva Fagundes" da investigação anterior — mas nesse caso específico os agendamentos dele estavam com data futura, então não vai aparecer nada ainda; funciona só quando a data/hora já passou de verdade).

Depois de ter um caso assim:
- Em `/cliente/perfil` (logado como esse cliente): "Cortes no total" deve contar esse agendamento vencido, e ele deve aparecer na lista de "Histórico" — sem o link "Avaliar".
- Em `/admin/clientes` (logado como dono, abrindo o mesmo cliente): mesmo comportamento — o histórico ali também deve incluir esse agendamento vencido.
- Confirme que um `haircut_record` real (de um corte já registrado antes) continua aparecendo normalmente, com o link "Avaliar" quando ainda não avaliado.

- [ ] **Passo 4: Commit**

```bash
git add src/components/clientes/ClienteVisitHistory.tsx
git commit -m "feat: esconde link Avaliar em entradas de historico pendentes"
```

---

## Depois deste plano

Não faz parte deste plano: deploy pra produção (fica pra depois de validar em localhost, por pedido explícito do usuário) nem qualquer ajuste na fidelidade (`loyaltyCortesAtual`) — essa continua exigindo confirmação manual do barbeiro, por design.
