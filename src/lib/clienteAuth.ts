import { cache } from 'react'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { criarClienteComClerkId, getClienteRowByClerkId } from '../db/queries/clientePorClerkId'
import { getClienteComHistorico } from '../db/queries/clientes'

/** Garante que o usuário logado tem um registro de cliente vinculado —
 * cria automaticamente no primeiro acesso à área pública. Sem "reclamar"
 * cadastros antigos por telefone nesta etapa (exigiria coletar telefone
 * no cadastro do Clerk, que não está configurado). `cache()` evita repetir
 * a consulta quando layout e página chamam isso na mesma requisição. */
export const requireClienteAtual = cache(async function requireClienteAtual() {
  const { userId } = await auth()
  if (!userId) redirect('/entrar/cliente')

  let clienteRow = await getClienteRowByClerkId(userId)
  if (!clienteRow) {
    const user = await currentUser()
    const nome =
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      user?.emailAddresses[0]?.emailAddress ||
      'Cliente'
    const telefone = user?.phoneNumbers[0]?.phoneNumber ?? ''
    clienteRow = await criarClienteComClerkId(userId, nome, telefone)
  }

  const cliente = await getClienteComHistorico(clienteRow.id)
  if (!cliente) redirect('/sign-in')
  return cliente
})

/** Usado dentro de Server Actions do cliente — sem cache (ações são one-shot)
 * e sem auto-criar cliente (isso só acontece via requireClienteAtual, no
 * primeiro acesso à área pública). Retorna a linha crua do banco. */
export async function getClienteAtualOuFalhar() {
  const { userId } = await auth()
  if (!userId) throw new Error('Não autenticado')
  const cliente = await getClienteRowByClerkId(userId)
  if (!cliente) throw new Error('Cliente não encontrado')
  return cliente
}
