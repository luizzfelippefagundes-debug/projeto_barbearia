import 'server-only'
import { headers } from 'next/headers'

/** IP de quem está fazendo a requisição agora. O Asaas exige o IP do
 * CLIENTE (nunca o do nosso servidor) pra qualquer operação com cartão —
 * por isso só chamar isso dentro de uma ação disparada pelo próprio cliente
 * na tela dele. Tenta vários cabeçalhos porque cada proxy usa um. */
export async function capturarIpCliente(): Promise<string | null> {
  const h = await headers()
  const candidatos = [
    h.get('x-forwarded-for')?.split(',')[0],
    h.get('x-real-ip'),
    h.get('cf-connecting-ip'),
    h.get('x-vercel-forwarded-for')?.split(',')[0],
  ]
  for (const bruto of candidatos) {
    const ip = bruto?.trim()
    if (ip) return ip
  }
  return null
}
