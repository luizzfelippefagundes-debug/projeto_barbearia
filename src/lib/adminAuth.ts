import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getBarbeiroByClerkId } from '../db/queries/barbeiros'

/** Garante que quem está acessando /admin é o DONO de alguma barbearia já
 * cadastrada. Cadastro de barbearia nova (e do primeiro dono dela) é feito
 * manualmente por trás — não existe auto-cadastro de "primeiro dono" aqui,
 * já que isso só fazia sentido quando só existia uma barbearia no sistema
 * (hoje várias barbearias compartilham o mesmo banco/deploy). Um barbeiro
 * comum (papel !== 'dono') é redirecionado pra própria área. */
export async function requireAdminAccess() {
  const { userId } = await auth()
  if (!userId) redirect('/entrar/dono')

  const existente = await getBarbeiroByClerkId(userId)
  if (!existente) redirect('/sem-acesso')
  if (existente.papel !== 'dono') redirect('/barbeiro')
  return existente
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
