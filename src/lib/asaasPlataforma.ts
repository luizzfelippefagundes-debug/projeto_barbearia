import { AsaasError } from './asaas'

const BASE_URLS = {
  sandbox: 'https://api-sandbox.asaas.com/v3',
  production: 'https://api.asaas.com/v3',
} as const

function getBaseUrl(): string {
  const env = process.env.ASAAS_PLATAFORMA_ENV === 'production' ? 'production' : 'sandbox'
  return BASE_URLS[env]
}

async function asaasPlataformaFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.ASAAS_PLATAFORMA_API_KEY
  if (!apiKey) throw new Error('ASAAS_PLATAFORMA_API_KEY não configurada')

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'NexoBarber-Plataforma/1.0',
      access_token: apiKey,
      ...init?.headers,
    },
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    console.error('[asaas-plataforma] erro', res.status, JSON.stringify(body))
    throw new AsaasError(res.status, body)
  }
  return body as T
}

export interface AsaasPlataformaCustomer {
  id: string
}

/** Cria o cliente (a barbearia) na conta Asaas da plataforma — chamado uma
 * vez, no onboarding de uma barbearia nova. */
export async function criarClienteAsaasPlataforma(params: {
  name: string
  cpfCnpj: string
  email?: string
  mobilePhone?: string
  externalReference?: string
}): Promise<AsaasPlataformaCustomer> {
  return asaasPlataformaFetch<AsaasPlataformaCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export interface AsaasPlataformaSubscription {
  id: string
}

const VALOR_MENSALIDADE = 250

/** Cria a assinatura mensal fixa de R$250 — o único valor cobrado hoje,
 * sem diferenciação por plano (Básico/Pro/Premium fica pra uma etapa
 * futura, decidida separadamente). */
export async function criarAssinaturaMensalidadeAsaas(params: {
  customer: string
  nextDueDate: string
}): Promise<AsaasPlataformaSubscription> {
  return asaasPlataformaFetch<AsaasPlataformaSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      customer: params.customer,
      billingType: 'UNDEFINED',
      nextDueDate: params.nextDueDate,
      value: VALOR_MENSALIDADE,
      cycle: 'MONTHLY',
      description: 'Mensalidade NexoBarber',
    }),
  })
}

/** Busca a assinatura direto — usada pra saber a data da próxima cobrança
 * (`nextDueDate`) mesmo antes do Asaas gerar a fatura desse ciclo, o que
 * só acontece alguns dias antes do vencimento. */
export async function buscarAssinaturaPlataforma(
  subscriptionId: string,
): Promise<{ nextDueDate: string }> {
  return asaasPlataformaFetch<{ nextDueDate: string }>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
  )
}

export interface AsaasPlataformaPayment {
  id: string
  status: string
  invoiceUrl: string
  value: number
  dueDate: string
}

const STATUS_EM_ABERTO = new Set(['PENDING', 'OVERDUE'])

/** Busca a cobrança em aberto mais antiga (pendente ou atrasada) da
 * assinatura — o `invoiceUrl` dela é o link que se manda pro dono da
 * barbearia pagar (Pix ou cartão, o Asaas decide a tela pelo billingType
 * UNDEFINED). Não existe fluxo automático de reenvio ainda — isso é feito
 * manualmente no onboarding.
 *
 * A Asaas não garante a ordem das cobranças nessa lista — depois de alguns
 * meses de assinatura existem várias (algumas já pagas, outras futuras
 * ainda não vencidas), então pegar a primeira da resposta sem filtrar/
 * ordenar pode pegar a cobrança errada. Filtramos só as que ainda importam
 * (pendente/atrasada) e pegamos a de vencimento mais próximo. */
export async function buscarPrimeiroPagamentoDaAssinaturaPlataforma(
  subscriptionId: string,
): Promise<AsaasPlataformaPayment | null> {
  const result = await asaasPlataformaFetch<{ data: AsaasPlataformaPayment[] }>(
    `/payments?subscription=${encodeURIComponent(subscriptionId)}&limit=100`,
  )
  const emAberto = result.data
    .filter((pagamento) => STATUS_EM_ABERTO.has(pagamento.status))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  return emAberto[0] ?? null
}

export async function buscarStatusPagamentoPlataforma(paymentId: string): Promise<AsaasPlataformaPayment> {
  return asaasPlataformaFetch<AsaasPlataformaPayment>(`/payments/${encodeURIComponent(paymentId)}`)
}

export interface AsaasPlataformaPixQrCode {
  encodedImage: string
  payload: string
  expirationDate: string | null
}

/** QR code + código copia-e-cola do Pix pra pagar a mensalidade. */
export async function buscarPixQrCodePlataforma(paymentId: string): Promise<AsaasPlataformaPixQrCode> {
  return asaasPlataformaFetch<AsaasPlataformaPixQrCode>(`/payments/${encodeURIComponent(paymentId)}/pixQrCode`)
}

/** Trava a cobrança em cartão de crédito e devolve o link seguro hospedado
 * pelo Asaas — mesma lógica de `definirCobrancaComoCartao` em lib/asaas.ts,
 * só que na conta da plataforma. */
export async function definirCobrancaComoCartaoPlataforma(
  paymentId: string,
  value: number,
  dueDate: string,
): Promise<AsaasPlataformaPayment> {
  return asaasPlataformaFetch<AsaasPlataformaPayment>(`/payments/${encodeURIComponent(paymentId)}`, {
    method: 'PUT',
    body: JSON.stringify({ billingType: 'CREDIT_CARD', value, dueDate }),
  })
}
