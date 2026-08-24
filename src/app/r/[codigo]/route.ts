import { NextResponse } from 'next/server'
import { getClienteIdPorCodigoIndicacao } from '../../../db/queries/clientes'

const NOME_COOKIE_INDICACAO = 'ref_cliente_id'

/** Link de "indique um amigo" — não exige login pra visitar. Só guarda quem
 * indicou num cookie e manda pro cadastro; a indicação em si só é aplicada
 * de verdade quando a conta de cliente é criada (ver requireClienteAtual). */
export async function GET(request: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const clienteIndicadorId = await getClienteIdPorCodigoIndicacao(codigo)

  const destino = new URL('/cadastro/cliente', request.url)
  const resposta = NextResponse.redirect(destino)

  if (clienteIndicadorId) {
    resposta.cookies.set(NOME_COOKIE_INDICACAO, clienteIndicadorId, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  }

  return resposta
}
