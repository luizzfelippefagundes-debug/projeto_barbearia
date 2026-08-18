import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  getBarbeiroByClerkId,
  getConviteBarbeiroPorEmail,
  vincularClerkIdAoBarbeiro,
} from '../db/queries/barbeiros'

/** Garante que quem está acessando /barbeiro é um barbeiro (ou dono)
 * cadastrado. Se a conta ainda não está ligada mas existe um convite
 * pendente (cadastrado pelo dono) com o mesmo e-mail, liga automaticamente
 * no primeiro login. */
export async function requireBarbeiroAccess() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const existente = await getBarbeiroByClerkId(userId)
  if (existente) return existente

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress?.toLowerCase()
  if (email) {
    const convite = await getConviteBarbeiroPorEmail(email)
    if (convite) return vincularClerkIdAoBarbeiro(convite.id, userId)
  }

  redirect('/sem-acesso')
}

/** Usado dentro de Server Actions da área do barbeiro — qualquer barbeiro
 * (ou dono) cadastrado pode chamar, mas a ação sempre fica presa ao próprio id. */
export async function assertBarbeiroLogado() {
  const { userId } = await auth()
  if (!userId) throw new Error('Não autenticado')
  const barbeiro = await getBarbeiroByClerkId(userId)
  if (!barbeiro) throw new Error('Sem acesso')
  return barbeiro
}
