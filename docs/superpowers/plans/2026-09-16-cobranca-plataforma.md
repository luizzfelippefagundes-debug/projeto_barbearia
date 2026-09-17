# Cobrança da plataforma — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada barbearia paga R$250/mês fixo pro dono do sistema via Asaas (conta da plataforma, separada da conta de cada barbearia). Se atrasar, o painel do dono/barbeiro dessa barbearia fica bloqueado até pagar. Cliente final não é afetado.

**Architecture:** Espelha o padrão que já existe pra cobrança do cliente final (`src/lib/asaas.ts` + webhook + enum `status_pagamento`), mas numa conta Asaas diferente (`ASAAS_PLATAFORMA_API_KEY`), numa rota de webhook separada, e escrevendo direto em `barbearias` em vez de `assinaturas`. Sem tela de pagamento pro dono nesta etapa — a primeira cobrança é enviada manualmente (link) durante o onboarding, que continua sendo um script pontual.

**Tech Stack:** Next.js App Router, Drizzle ORM, Postgres (Neon), API REST do Asaas, TypeScript.

---

## ⚠️ Aviso de segurança pra quem for executar

`ASAAS_PLATAFORMA_API_KEY` (em `.env.local`) é uma **chave de produção** (`$aact_prod_...`), não sandbox — diferente da `ASAAS_API_KEY` (cliente final), que é sandbox (`$aact_hmlg_...`). **Nenhuma etapa deste plano deve chamar `criarClienteAsaasPlataforma` ou `criarAssinaturaMensalidadeAsaas` de verdade contra a API** — isso criaria um cliente e uma assinatura recorrente reais no Asaas. A verificação dessas funções é só por `tsc`/`build` (tipagem e compilação), nunca por execução. A primeira execução de verdade do script de onboarding (Task 8) só deve acontecer quando o Luiz decidir onboardar uma barbearia de verdade, fora do escopo "testar o plano".

---

### Task 1: Schema — campos de cobrança em `barbearias`

**Files:**
- Modify: `src/db/schema.ts:58-65`

- [ ] **Step 1: Adicionar as colunas**

Em `src/db/schema.ts`, substituir a definição atual de `barbearias`:

```ts
export const barbearias = pgTable('barbearias', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  /** Identificador curto e único (ex: "jota-pe") — hoje só usado internamente
   * pra referência; ainda não vira subdomínio/URL própria. */
  slug: text('slug').notNull().unique(),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
})
```

por:

```ts
export const barbearias = pgTable('barbearias', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  /** Identificador curto e único (ex: "jota-pe") — hoje só usado internamente
   * pra referência; ainda não vira subdomínio/URL própria. */
  slug: text('slug').notNull().unique(),
  /** Cobrança da MENSALIDADE DA PLATAFORMA (a barbearia pagando o dono do
   * sistema) — conta Asaas separada da conta de cada barbearia, que cobra
   * o cliente final. Nulo até o onboarding criar a assinatura. */
  asaasCustomerId: text('asaas_customer_id').unique(),
  asaasSubscriptionId: text('asaas_subscription_id').unique(),
  statusPagamento: statusPagamentoEnum('status_pagamento').notNull().default('em_dia'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
})
```

`statusPagamentoEnum` já existe (usado em `assinaturas.status`, valores `em_dia`/`atrasado`/`aguardando`/`cancelado`) — não precisa criar enum novo.

- [ ] **Step 2: Subir o schema**

Run: `npm run db:push`
Expected: confirma a criação das 3 colunas em `barbearias` sem pedir pra dropar nada.

- [ ] **Step 3: Verificar direto no banco**

Run:
```bash
node -e "
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const rows = await sql\`select id, nome, asaas_customer_id, asaas_subscription_id, status_pagamento from barbearias\`;
  console.log(JSON.stringify(rows, null, 2));
})();
"
```
Expected: lista as 3 barbearias existentes, todas com `status_pagamento: 'em_dia'` e os dois campos Asaas `null`.

- [ ] **Step 4: Commit**

```bash
git add src/db/schema.ts
git commit -m "$(cat <<'EOF'
Adiciona campos de cobrança da plataforma em barbearias

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `src/lib/asaasPlataforma.ts` — cliente Asaas da conta da plataforma

**Files:**
- Create: `src/lib/asaasPlataforma.ts`

Espelha `src/lib/asaas.ts`, mas autentica com `ASAAS_PLATAFORMA_API_KEY` e usa `ASAAS_PLATAFORMA_ENV` (mesmo padrão de `ASAAS_ENV`, mas separado — as duas contas podem estar em ambientes diferentes). Reaproveita `AsaasError` de `./asaas` em vez de duplicar a classe.

- [ ] **Step 1: Criar o arquivo**

```ts
import { AsaasError } from './asaas'

const BASE_URLS = {
  sandbox: 'https://api-sandbox.asaas.com/v3',
  production: 'https://api.asaas.com/v3',
} as const

function getBaseUrl(): string {
  const env = process.env.ASAAS_PLATAFORMA_ENV === 'production' ? 'production' : 'sandbox'
  return BASE_URLS[env]
}

async function asaasPlataformaFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.ASAAS_PLATAFORMA_API_KEY
  if (!apiKey) throw new Error('ASAAS_PLATAFORMA_API_KEY não configurada')

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'NexoBarber-Plataforma/1.0',
      access_token: apiKey,
      ...init?.headers,
    },
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    console.error('[asaas-plataforma] erro', res.status, JSON.stringify(body))
    throw new AsaasError(res.status, body)
  }
  return body as T
}

export interface AsaasPlataformaCustomer {
  id: string
}

/** Cria o cliente (a barbearia) na conta Asaas da plataforma — chamado uma
 * vez, no onboarding de uma barbearia nova. */
export async function criarClienteAsaasPlataforma(params: {
  name: string
  cpfCnpj: string
  email?: string
  mobilePhone?: string
  externalReference?: string
}): Promise<AsaasPlataformaCustomer> {
  return asaasPlataformaFetch<AsaasPlataformaCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export interface AsaasPlataformaSubscription {
  id: string
}

const VALOR_MENSALIDADE = 250

/** Cria a assinatura mensal fixa de R$250 — o único valor cobrado hoje,
 * sem diferenciação por plano (Básico/Pro/Premium fica pra uma etapa
 * futura, decidida separadamente). */
export async function criarAssinaturaMensalidadeAsaas(params: {
  customer: string
  nextDueDate: string
}): Promise<AsaasPlataformaSubscription> {
  return asaasPlataformaFetch<AsaasPlataformaSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      customer: params.customer,
      billingType: 'UNDEFINED',
      nextDueDate: params.nextDueDate,
      value: VALOR_MENSALIDADE,
      cycle: 'MONTHLY',
      description: 'Mensalidade NexoBarber',
    }),
  })
}

export interface AsaasPlataformaPayment {
  id: string
  status: string
  invoiceUrl: string
  value: number
  dueDate: string
}

/** Busca a primeira cobrança gerada pela assinatura — o `invoiceUrl` dela é
 * o link que se manda pro dono da barbearia pagar (Pix ou cartão, o Asaas
 * decide a tela pelo billingType UNDEFINED). Não existe fluxo automático de
 * reenvio ainda — isso é feito manualmente no onboarding. */
export async function buscarPrimeiroPagamentoDaAssinaturaPlataforma(
  subscriptionId: string,
): Promise<AsaasPlataformaPayment | null> {
  const result = await asaasPlataformaFetch<{ data: AsaasPlataformaPayment[] }>(
    `/payments?subscription=${encodeURIComponent(subscriptionId)}`,
  )
  return result.data[0] ?? null
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/lib/asaasPlataforma.ts
git commit -m "$(cat <<'EOF'
Adiciona cliente Asaas da conta da plataforma (mensalidade da barbearia)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `salvarCobrancaPlataforma` em `db/queries/barbearias.ts`

**Files:**
- Modify: `src/db/queries/barbearias.ts`

- [ ] **Step 1: Adicionar a função**

No fim de `src/db/queries/barbearias.ts`, adicionar:

```ts
/** Grava os ids da cobrança da plataforma numa barbearia — chamado uma vez
 * no onboarding, depois de criar o cliente e a assinatura no Asaas. */
export async function salvarCobrancaPlataforma(
  barbeariaId: string,
  dados: { asaasCustomerId: string; asaasSubscriptionId: string },
) {
  await getDb()
    .update(barbearias)
    .set({ asaasCustomerId: dados.asaasCustomerId, asaasSubscriptionId: dados.asaasSubscriptionId })
    .where(eq(barbearias.id, barbeariaId))
}
```

(`eq` e `barbearias` já estão importados no topo do arquivo.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/db/queries/barbearias.ts
git commit -m "$(cat <<'EOF'
Adiciona salvarCobrancaPlataforma pra gravar ids da assinatura Asaas na barbearia

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Variáveis de ambiente novas

**Files:**
- Modify: `.env.local` (local, não committed)
- Vercel: env vars de produção

- [ ] **Step 1: Gerar o token do webhook**

Run: `openssl rand -hex 32`
Expected: uma string hex de 64 caracteres. Guardar o resultado — vai virar `ASAAS_PLATAFORMA_WEBHOOK_TOKEN`.

- [ ] **Step 2: Adicionar em `.env.local`**

Adicionar duas linhas (o `ASAAS_PLATAFORMA_API_KEY` já existe):

```
ASAAS_PLATAFORMA_ENV="production"
ASAAS_PLATAFORMA_WEBHOOK_TOKEN="<valor gerado no Step 1>"
```

- [ ] **Step 3: Adicionar em produção (Vercel)**

Run (repetir pra cada variável, substituindo o valor):
```bash
printf '%s' 'production' | vercel env add ASAAS_PLATAFORMA_ENV production
printf '%s' '<valor gerado no Step 1>' | vercel env add ASAAS_PLATAFORMA_WEBHOOK_TOKEN production
```
Expected: `vercel env add` confirma que a variável foi criada.

- [ ] **Step 4: Commit**

Nada pra commitar aqui (`.env.local` não é versionado) — pular pra próxima task.

---

### Task 5: Webhook `/api/webhooks/asaas-plataforma`

**Files:**
- Create: `src/app/api/webhooks/asaas-plataforma/route.ts`

Mesmo padrão do webhook existente (`src/app/api/webhooks/asaas/route.ts`), mas: token diferente, atualiza `barbearias` em vez de `assinaturas`, revalida as rotas do admin.

- [ ] **Step 1: Criar o arquivo**

```ts
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getDb } from '../../../../db'
import { asaasWebhookEventos, barbearias } from '../../../../db/schema'
import { mapStatusPagamentoAsaas } from '../../../../lib/asaas'

interface AsaasWebhookPayload {
  id: string
  event: string
  payment?: {
    id: string
    subscription?: string
    status: string
  }
}

export async function POST(req: Request) {
  const token = req.headers.get('asaas-access-token')
  if (!token || token !== process.env.ASAAS_PLATAFORMA_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 })
  }

  const payload = (await req.json().catch(() => null)) as AsaasWebhookPayload | null
  if (!payload?.id || !payload.event) {
    return NextResponse.json({ ok: true })
  }

  const db = getDb()

  const inseridas = await db
    .insert(asaasWebhookEventos)
    .values({
      asaasEventId: payload.id,
      evento: payload.event,
      paymentId: payload.payment?.id,
    })
    .onConflictDoNothing()
    .returning()

  if (inseridas.length === 0) {
    return NextResponse.json({ ok: true, duplicado: true })
  }

  const subscriptionId = payload.payment?.subscription
  if (!subscriptionId) {
    return NextResponse.json({ ok: true })
  }

  const novoStatus = payload.payment?.status ? mapStatusPagamentoAsaas(payload.payment.status) : null
  if (!novoStatus) {
    return NextResponse.json({ ok: true })
  }

  await db
    .update(barbearias)
    .set({ statusPagamento: novoStatus })
    .where(eq(barbearias.asaasSubscriptionId, subscriptionId))

  revalidatePath('/admin', 'layout')
  revalidatePath('/barbeiro', 'layout')

  return NextResponse.json({ ok: true })
}
```

Nota: `asaasWebhookEventos` já é compartilhada entre as duas contas Asaas (não tem `barbeariaId`, é só uma tabela de idempotência por `asaas_event_id` — cabe evento de qualquer uma das duas, sem conflito, porque o id do evento do Asaas já é globalmente único).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Testar autenticação e idempotência manualmente**

Com o servidor local rodando (`npm run dev`), em outro terminal:

```bash
# sem token — espera 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/webhooks/asaas-plataforma \
  -H "Content-Type: application/json" -d '{"id":"evt_teste","event":"PAYMENT_RECEIVED"}'

# com token errado — espera 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/webhooks/asaas-plataforma \
  -H "Content-Type: application/json" -H "asaas-access-token: token-errado" \
  -d '{"id":"evt_teste","event":"PAYMENT_RECEIVED"}'

# com token certo, sem payment.subscription — espera 200 ok:true
curl -s -X POST http://localhost:3000/api/webhooks/asaas-plataforma \
  -H "Content-Type: application/json" -H "asaas-access-token: $(grep ASAAS_PLATAFORMA_WEBHOOK_TOKEN .env.local | cut -d'\"' -f2)" \
  -d '{"id":"evt_teste_local","event":"PAYMENT_RECEIVED"}'

# repetir a mesma chamada de novo — espera "duplicado":true
curl -s -X POST http://localhost:3000/api/webhooks/asaas-plataforma \
  -H "Content-Type: application/json" -H "asaas-access-token: $(grep ASAAS_PLATAFORMA_WEBHOOK_TOKEN .env.local | cut -d'\"' -f2)" \
  -d '{"id":"evt_teste_local","event":"PAYMENT_RECEIVED"}'
```
Expected: 401, 401, `{"ok":true}`, `{"ok":true,"duplicado":true}` — nessa ordem.

- [ ] **Step 4: Limpar o evento de teste**

```bash
node -e "
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  await sql\`delete from asaas_webhook_eventos where asaas_event_id = 'evt_teste_local'\`;
  console.log('limpo');
})();
"
```

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/webhooks/asaas-plataforma/route.ts"
git commit -m "$(cat <<'EOF'
Adiciona webhook da cobrança da plataforma (conta Asaas separada da do cliente final)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Página `/pagamento-pendente`

**Files:**
- Create: `src/app/pagamento-pendente/page.tsx`

Página informativa simples, sem lógica de pagamento (isso fica pra uma etapa futura).

- [ ] **Step 1: Criar a página**

```tsx
export default function PagamentoPendentePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-text-primary">Pagamento pendente</h1>
        <p className="mt-3 text-text-secondary">
          A mensalidade do sistema está em atraso. O acesso ao painel fica temporariamente
          bloqueado até a confirmação do pagamento.
        </p>
        <p className="mt-6 text-sm text-text-secondary">
          Já pagou? Pode levar alguns minutos até confirmar automaticamente. Se o problema
          persistir, entre em contato pelo WhatsApp de suporte.
        </p>
      </div>
    </div>
  )
}
```

Ajustar as classes de cor (`text-text-primary`/`text-text-secondary`/`bg-bg`) se os tokens reais do projeto tiverem outro nome — conferir em `src/app/planos/page.tsx`, que já usa esses tokens de tema.

- [ ] **Step 2: Verificar visualmente**

Run: `npm run dev`, abrir `http://localhost:3000/pagamento-pendente`.
Expected: página centralizada, legível em claro e escuro (o tema é herdado do layout raiz, não precisa de nada especial aqui).

- [ ] **Step 3: Commit**

```bash
git add src/app/pagamento-pendente/page.tsx
git commit -m "$(cat <<'EOF'
Adiciona página de pagamento pendente

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Bloquear admin/barbeiro quando `atrasado`

**Files:**
- Modify: `src/app/admin/(dashboard)/layout.tsx`
- Modify: `src/app/barbeiro/(dashboard)/layout.tsx`

- [ ] **Step 1: Editar o layout do admin**

Em `src/app/admin/(dashboard)/layout.tsx`, trocar:

```tsx
import { Sidebar } from '../../../components/admin/Sidebar'
import { requireAdminAccess } from '../../../lib/adminAuth'
import { getBarbeariaPorId } from '../../../db/queries/barbearias'
import { getLogoBarbearia } from '../../../lib/logoBarbearia'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dono = await requireAdminAccess()
  const barbearia = await getBarbeariaPorId(dono.barbeariaId)
```

por:

```tsx
import { redirect } from 'next/navigation'
import { Sidebar } from '../../../components/admin/Sidebar'
import { requireAdminAccess } from '../../../lib/adminAuth'
import { getBarbeariaPorId } from '../../../db/queries/barbearias'
import { getLogoBarbearia } from '../../../lib/logoBarbearia'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dono = await requireAdminAccess()
  const barbearia = await getBarbeariaPorId(dono.barbeariaId)
  if (barbearia?.statusPagamento === 'atrasado') redirect('/pagamento-pendente')
```

(o resto do arquivo continua igual.)

- [ ] **Step 2: Editar o layout do barbeiro**

Em `src/app/barbeiro/(dashboard)/layout.tsx`, mesma mudança:

```tsx
import { redirect } from 'next/navigation'
import { BarbeiroSidebar } from '../../../components/barbeiro-self/BarbeiroSidebar'
import { requireBarbeiroAccess } from '../../../lib/barbeiroAuth'
import { getBarbeariaPorId } from '../../../db/queries/barbearias'
import { getLogoBarbearia } from '../../../lib/logoBarbearia'

export default async function BarbeiroDashboardLayout({ children }: { children: React.ReactNode }) {
  const barbeiro = await requireBarbeiroAccess()
  const barbearia = await getBarbeariaPorId(barbeiro.barbeariaId)
  if (barbearia?.statusPagamento === 'atrasado') redirect('/pagamento-pendente')
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Testar o bloqueio de verdade, sem mexer em Asaas**

Marcar a Jota Pê como atrasada direto no banco (só pra testar o redirect, sem passar pelo Asaas):

```bash
node -e "
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  await sql\`update barbearias set status_pagamento = 'atrasado' where slug = 'jota-pe'\`;
  console.log('marcado como atrasado');
})();
"
```

Com `npm run dev` rodando, logar como dono ou barbeiro da Jota Pê e acessar `/admin` (ou `/barbeiro`).
Expected: redireciona pra `/pagamento-pendente` em vez de mostrar o dashboard.

Reverter:

```bash
node -e "
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  await sql\`update barbearias set status_pagamento = 'em_dia' where slug = 'jota-pe'\`;
  console.log('revertido');
})();
"
```

Acessar `/admin` de novo.
Expected: volta a mostrar o dashboard normalmente.

- [ ] **Step 5: Confirmar que o cliente final não é afetado**

Com a Jota Pê ainda `em_dia` (já revertido no Step 4), esse passo é só uma checagem de leitura de código: confirmar que `src/app/cliente/layout.tsx` **não** foi tocado nesta task e não faz nenhuma checagem de `statusPagamento` — cliente final da barbearia continua acessível independente do status de pagamento da barbearia com o dono.

- [ ] **Step 6: Commit**

```bash
git add "src/app/admin/(dashboard)/layout.tsx" "src/app/barbeiro/(dashboard)/layout.tsx"
git commit -m "$(cat <<'EOF'
Bloqueia admin/barbeiro quando a mensalidade da plataforma está atrasada

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Script de onboarding (documentado, não executado contra produção neste plano)

**Files:**
- Nenhum arquivo novo commitado — script de uso único, seguindo o mesmo padrão já usado nesta sessão pra scripts de migração/seed (arquivo temporário, deletado depois de rodar).

Esta task só documenta o padrão a seguir na próxima vez que uma barbearia nova for cadastrada — **não deve ser executada de verdade como parte da verificação deste plano**, porque chamaria a API de produção do Asaas de verdade (ver aviso no topo do plano).

- [ ] **Step 1: Modelo do script (referência, não rodar agora)**

Ao cadastrar uma barbearia nova, depois de já ter os ids gerados pro `insert` de `barbearias`/`barbeiros` (fluxo manual já existente), acrescentar ao mesmo script:

```ts
import 'dotenv/config'
import { criarClienteAsaasPlataforma, criarAssinaturaMensalidadeAsaas, buscarPrimeiroPagamentoDaAssinaturaPlataforma } from '../src/lib/asaasPlataforma'
import { salvarCobrancaPlataforma } from '../src/db/queries/barbearias'

async function onboardCobranca(barbeariaId: string, params: { nomeDono: string; cpfCnpjDono: string; emailDono?: string }) {
  const cliente = await criarClienteAsaasPlataforma({
    name: params.nomeDono,
    cpfCnpj: params.cpfCnpjDono,
    email: params.emailDono,
  })

  const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const assinatura = await criarAssinaturaMensalidadeAsaas({
    customer: cliente.id,
    nextDueDate: amanha,
  })

  await salvarCobrancaPlataforma(barbeariaId, {
    asaasCustomerId: cliente.id,
    asaasSubscriptionId: assinatura.id,
  })

  const pagamento = await buscarPrimeiroPagamentoDaAssinaturaPlataforma(assinatura.id)
  console.log('Link de pagamento pra mandar pro dono:', pagamento?.invoiceUrl)
}
```

- [ ] **Step 2: Como rodar quando for onboardar de verdade**

`npx tsx <caminho-do-script-temporário>.ts` (o `tsx` não precisa estar instalado como dependência — o `npx` resolve na hora). Exige `CPF/CNPJ` do dono (obrigatório pro Asaas criar o cliente) e um e-mail opcional. O link impresso no fim (`invoiceUrl`) é o que se manda pro dono pagar a primeira mensalidade.

- [ ] **Step 3: Nada pra commitar nesta task** — é só documentação de processo, incorporada ao próprio script de onboarding pontual (que é descartado depois de usado, como os anteriores desta sessão).

---

## Depois de tudo

- [ ] Configurar o webhook no painel da conta Asaas da plataforma (não é uma chamada de API neste plano — é uma ação manual no painel do Asaas): URL `https://<domínio-de-produção>/api/webhooks/asaas-plataforma`, evento pelo menos `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, com o token gerado na Task 4 configurado como "Token de acesso" do webhook.
- [x] Rodar `npm run build` uma vez no final, com todas as tasks aplicadas, pra confirmar que o projeto inteiro compila. ✅ Build e `npm test` (22/22) limpos.

## Gap conhecido, aceito conscientemente pro merge (decisão do Luiz em 2026-09-16)

O bloqueio por atraso hoje só cobre navegação de página (`src/app/admin/(dashboard)/layout.tsx` e `src/app/barbeiro/(dashboard)/layout.tsx`) — **não cobre Server Actions** (`assertAdmin` em `src/lib/adminAuth.ts`, `assertBarbeiroLogado` em `src/lib/barbeiroAuth.ts`, usadas em 18 pontos de entrada ao todo). Quem já está com o painel aberto numa aba continua conseguindo mutar dados da própria barbearia (criar agendamento, editar caixa etc.) mesmo depois de atrasado, até fazer uma navegação nova (refresh/nova página). Não é vazamento entre barbearias — é só uma janela de tempo em que o bloqueio não pega uma sessão já aberta.

Decisão consciente: mergear assim e resolver depois, não antes. Achado durante a revisão final desta branch (não fazia parte do plano original de 8 tasks). Quando for endereçar: o ponto natural pra centralizar a checagem é `src/proxy.ts` (já intercepta toda requisição sob `/admin` e `/barbeiro`, incluindo as chamadas de Server Action, ao contrário de duplicar a checagem em 18 call sites) — mas rodar em Edge runtime tem custo/latência de fazer lookup no banco ali — vale pesar isso antes de decidir a abordagem.
