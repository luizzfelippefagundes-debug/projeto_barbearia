'use server'

import { and, eq, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { agendamentos, assinaturas, clientes, haircutRecords, vendas } from '../db/schema'
import { getClienteAtualOuFalhar } from '../lib/clienteAuth'

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

/** Compara só os últimos 11 dígitos — o WhatsApp sempre manda o telefone
 * com o DDI 55 na frente, mas o cadastro do site normalmente não tem DDI
 * nenhum. Comparando os dígitos inteiros isso nunca batia, e a mesma
 * pessoa ficava com dois cadastros que o merge nunca encontrava. */
function mesmoTelefone(a: string, b: string): boolean {
  const da = apenasDigitos(a)
  const dbb = apenasDigitos(b)
  if (!da || !dbb) return false
  return da.slice(-11) === dbb.slice(-11)
}

/** Atualiza o telefone do cliente logado. Se já existir um cadastro avulso
 * com esse mesmo telefone (criado pelo bot do WhatsApp, ou por atendimento
 * avulso registrado pelo dono/barbeiro, sem login nenhum), funde os dois —
 * todo agendamento, histórico, assinatura etc. desse avulso passa pro
 * cadastro de login, e o avulso é apagado. Sem isso, quem usou o bot antes
 * de criar conta no site fica com dois cadastros que nunca se encontram. */
/** Retorna `{ error }` em vez de lançar exceção — em produção, o Next.js
 * esconde a mensagem de erros lançados numa Server Action (troca por um
 * texto genérico tipo "Minified React error #441"), então a única forma
 * confiável do cliente ver a mensagem de verdade é recebendo ela como
 * dado normal de retorno, não como erro. */
export async function atualizarMeuTelefone(
  telefoneInput: string,
): Promise<{ error: string } | { error?: undefined }> {
  const clienteAtual = await getClienteAtualOuFalhar()
  const telefone = apenasDigitos(telefoneInput)
  if (telefone.length < 10 || telefone.length > 13) {
    return { error: 'Digite um telefone válido, com DDD.' }
  }

  const db = getDb()

  const outros = await db
    .select()
    .from(clientes)
    .where(and(ne(clientes.id, clienteAtual.id), eq(clientes.barbeariaId, clienteAtual.barbeariaId)))
  const duplicado = outros.find((c) => mesmoTelefone(c.telefone, telefone))

  if (!duplicado) {
    await db.update(clientes).set({ telefone }).where(eq(clientes.id, clienteAtual.id))
    revalidatePath('/cliente/perfil')
    return {}
  }

  if (duplicado.clerkUserId) {
    return { error: 'Esse telefone já está em uso por outra conta com login — fala com a gente pra resolver.' }
  }

  // Repointa tudo do cadastro avulso pro cadastro de login ANTES de apagar
  // o avulso — nessa ordem, se algo falhar no meio, nada se perde (só fica
  // faltando repontar o resto, dá pra tentar de novo).
  await db.update(assinaturas).set({ clienteId: clienteAtual.id }).where(eq(assinaturas.clienteId, duplicado.id))
  await db.update(agendamentos).set({ clienteId: clienteAtual.id }).where(eq(agendamentos.clienteId, duplicado.id))
  await db
    .update(haircutRecords)
    .set({ clienteId: clienteAtual.id })
    .where(eq(haircutRecords.clienteId, duplicado.id))
  await db.update(vendas).set({ clienteId: clienteAtual.id }).where(eq(vendas.clienteId, duplicado.id))
  await db.update(clientes).set({ indicadoPor: clienteAtual.id }).where(eq(clientes.indicadoPor, duplicado.id))

  const novaLoyalty = Math.min(
    clienteAtual.loyaltyCortesAtual + duplicado.loyaltyCortesAtual,
    clienteAtual.loyaltyCortesMeta,
  )
  await db
    .update(clientes)
    .set({
      telefone,
      loyaltyCortesAtual: novaLoyalty,
      asaasCustomerId: clienteAtual.asaasCustomerId ?? duplicado.asaasCustomerId,
    })
    .where(eq(clientes.id, clienteAtual.id))

  await db.delete(clientes).where(eq(clientes.id, duplicado.id))

  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/clientes')
  return {}
}
