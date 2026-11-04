/**
 * Verifica assinaturas ativas com billingType UNDEFINED no Asaas e corrige:
 * 1. Busca o creditCardToken do último pagamento com cartão confirmado
 * 2. Se tiver fatura pendente, cobra agora com o token
 * 3. Atualiza a assinatura para CREDIT_CARD (recorrência automática futura)
 *
 * Rodar: npx dotenv-cli -e .env.local -- npx tsx scripts/corrigir-recorrencia-cartao.ts
 */

import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, inArray } from 'drizzle-orm'
import { assinaturas, clientes } from '../src/db/schema'

const BASE_URL = 'https://api.asaas.com/v3'

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'BarbeariaVidalFilhos/1.0',
      access_token: process.env.ASAAS_API_KEY!,
      ...init?.headers,
    },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(`Asaas ${res.status}: ${JSON.stringify(body)}`)
  return body as T
}

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!))

  // Busca assinaturas ativas com ID no Asaas
  const ativas = await db
    .select({
      id: assinaturas.id,
      clienteId: assinaturas.clienteId,
      asaasSubscriptionId: assinaturas.asaasSubscriptionId,
      nomeCliente: clientes.nome,
    })
    .from(assinaturas)
    .innerJoin(clientes, eq(clientes.id, assinaturas.clienteId))
    .where(inArray(assinaturas.status, ['em_dia', 'atrasado']))

  const comId = ativas.filter(a => a.asaasSubscriptionId)
  console.log(`\n${comId.length} assinaturas ativas com ID Asaas encontradas\n`)

  let corrigidas = 0
  let cobradas = 0
  let semToken = 0
  let pixOuOk = 0

  for (const a of comId) {
    const subId = a.asaasSubscriptionId!
    try {
      // Verifica o billingType da assinatura
      const sub = await asaasFetch<{ billingType: string; nextDueDate: string }>(`/subscriptions/${subId}`)
      if (sub.billingType !== 'UNDEFINED') {
        pixOuOk++
        continue
      }

      // Busca o token do último pagamento com cartão confirmado
      const pagamentos = await asaasFetch<{ data: Array<{ id: string; status: string; billingType: string; dueDate: string; creditCard?: { creditCardToken?: string } }> }>(
        `/payments?subscription=${subId}&limit=100`
      )
      const comToken = pagamentos.data
        .filter(p => ['RECEIVED', 'CONFIRMED'].includes(p.status) && p.billingType === 'CREDIT_CARD' && p.creditCard?.creditCardToken)
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate))

      if (comToken.length === 0) {
        console.log(`⚠️  ${a.nomeCliente} — sem token de cartão no histórico (paga por Pix ou nunca pagou com cartão)`)
        semToken++
        continue
      }

      const token = comToken[0].creditCard!.creditCardToken!

      // Atualiza assinatura para CREDIT_CARD com o token
      await asaasFetch(`/subscriptions/${subId}`, {
        method: 'PUT',
        body: JSON.stringify({ billingType: 'CREDIT_CARD', creditCardToken: token }),
      })
      corrigidas++

      // Busca fatura pendente (PENDING ou OVERDUE) e cobra agora
      const pendentes = pagamentos.data.filter(p => ['PENDING', 'OVERDUE'].includes(p.status))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

      if (pendentes.length > 0) {
        const fatura = pendentes[0]
        await asaasFetch(`/payments/${fatura.id}/payWithCreditCard`, {
          method: 'POST',
          body: JSON.stringify({ creditCardToken: token }),
        })
        console.log(`✅  ${a.nomeCliente} — recorrência ativada + fatura ${fatura.id} cobrada agora`)
        cobradas++
      } else {
        console.log(`✅  ${a.nomeCliente} — recorrência ativada (sem fatura pendente no momento)`)
      }
    } catch (err) {
      console.error(`❌  ${a.nomeCliente} (${subId}) — erro:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`\n--- Resumo ---`)
  console.log(`Verificadas: ${comId.length}`)
  console.log(`Recorrência ativada: ${corrigidas}`)
  console.log(`Faturas cobradas agora: ${cobradas}`)
  console.log(`Já OK (Pix ou cartão já configurado): ${pixOuOk}`)
  console.log(`Sem token de cartão (precisam pagar pelo app): ${semToken}`)
}

main().catch(console.error).finally(() => process.exit(0))
