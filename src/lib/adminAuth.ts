import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  countBarbeiros,
  criarBarbeiroComClerkId,
  getBarbeiroByClerkId,
} from '../db/queries/barbeiros'

/** Garante que quem está acessando /admin é um barbeiro/dono cadastrado.
 * Se ninguém foi cadastrado ainda (banco zerado), a primeira pessoa que
 * fizer login vira automaticamente o dono fundador — não há fluxo de
 * "virar barbeiro" auto-serviço depois disso. */
export async function requireAdminAccess() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const existente = await getBarbeiroByClerkId(userId)
  if (existente) return existente

  const totalBarbeiros = await countBarbeiros()
  if (totalBarbeiros === 0) {
    const user = await currentUser()
    const nome =
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      user?.emailAddresses[0]?.emailAddress ||
      'Dono da barbearia'
    return criarBarbeiroComClerkId(userId, nome)
  }

  redirect('/sem-acesso')
}

/** Usado dentro de Server Actions — elas são endpoints públicos, então cada
 * uma precisa revalidar autenticação por conta própria, sem depender só do proxy. */
export async function assertAdmin() {
  const { userId } = await auth()
  if (!userId) throw new Error('Não autenticado')
  const barbeiro = await getBarbeiroByClerkId(userId)
  if (!barbeiro) throw new Error('Sem acesso ao painel administrativo')
  return barbeiro
}
