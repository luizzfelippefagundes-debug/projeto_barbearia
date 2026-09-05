import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getBarbeiroByClerkId } from '../db/queries/barbeiros'
import { getClienteRowByClerkId } from '../db/queries/clientePorClerkId'

/** A raiz do site é o start_url do PWA — a mesma URL que abre pra todo
 * mundo que instala o app na tela inicial, seja dono, barbeiro ou cliente.
 * Por isso não pode redirecionar pra um destino fixo: precisa decidir pra
 * onde mandar cada um com base em quem está logado. */
export default async function Home() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const barbeiro = await getBarbeiroByClerkId(userId)
  if (barbeiro) redirect(barbeiro.papel === 'dono' ? '/admin/agenda' : '/barbeiro')

  const cliente = await getClienteRowByClerkId(userId)
  if (cliente) redirect('/cliente')

  redirect('/sign-in')
}
