import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getBarbeiroByClerkId } from '../db/queries/barbeiros'

/** Garante que quem está acessando /barbeiro é um barbeiro (ou dono)
 * cadastrado — não auto-provisiona ninguém aqui, só o caminho do dono faz isso. */
export async function requireBarbeiroAccess() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const barbeiro = await getBarbeiroByClerkId(userId)
  if (!barbeiro) redirect('/sem-acesso')

  return barbeiro
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
