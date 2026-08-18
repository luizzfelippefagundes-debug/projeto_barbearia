import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  countBarbeiros,
  criarDonoComClerkId,
  getBarbeiroByClerkId,
} from '../db/queries/barbeiros'

/** Garante que quem está acessando /admin é o DONO. Se ninguém foi
 * cadastrado ainda (banco zerado), a primeira pessoa que fizer login vira
 * automaticamente o dono fundador — não há fluxo de auto-serviço depois disso.
 * Um barbeiro comum (papel !== 'dono') é redirecionado pra própria área. */
export async function requireAdminAccess() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const existente = await getBarbeiroByClerkId(userId)
  if (existente) {
    if (existente.papel !== 'dono') redirect('/barbeiro')
    return existente
  }

  const totalBarbeiros = await countBarbeiros()
  if (totalBarbeiros === 0) {
    const user = await currentUser()
    const nome =
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      user?.emailAddresses[0]?.emailAddress ||
      'Dono da barbearia'
    return criarDonoComClerkId(userId, nome)
  }

  redirect('/sem-acesso')
}

/** Usado dentro de Server Actions do painel do dono — elas são endpoints
 * públicos, então cada uma precisa revalidar autenticação por conta própria,
 * sem depender só do proxy. Exige papel 'dono'. */
export async function assertAdmin() {
  const { userId } = await auth()
  if (!userId) throw new Error('Não autenticado')
  const barbeiro = await getBarbeiroByClerkId(userId)
  if (!barbeiro || barbeiro.papel !== 'dono') throw new Error('Sem acesso ao painel administrativo')
  return barbeiro
}
