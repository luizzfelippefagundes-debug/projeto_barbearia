const BASE_URLS = {
  sandbox: 'https://api-sandbox.asaas.com/v3',
  production: 'https://api.asaas.com/v3',
} as const

function getBaseUrl(): string {
  const env = process.env.ASAAS_ENV === 'production' ? 'production' : 'sandbox'
  return BASE_URLS[env]
}

export class AsaasError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`Asaas respondeu ${status}`)
    this.name = 'AsaasError'
    this.status = status
    this.body = body
  }
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.ASAAS_API_KEY
  if (!apiKey) throw new Error('ASAAS_API_KEY não configurada')

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'BarbeariaVidalFilhos/1.0',
      access_token: apiKey,
      ...init?.headers,
    },
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    console.error('[asaas] erro', res.status, JSON.stringify(body))
    throw new AsaasError(res.status, body)
  }
  return body as T
}

export interface AsaasCustomer {
  id: string
}

export async function criarClienteAsaas(params: {
  name: string
  cpfCnpj: string
  email?: string
  mobilePhone?: string
  externalReference?: string
}): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export interface AsaasSubscription {
  id: string
}

export async function criarAssinaturaAsaas(params: {
  customer: string
  nextDueDate: string
  value: number
  description: string
}): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      customer: params.customer,
      billingType: 'UNDEFINED',
      nextDueDate: params.nextDueDate,
      value: params.value,
      cycle: 'MONTHLY',
      description: params.description,
    }),
  })
}

/** Busca a assinatura direto — usada pra manter `proximaCobranca` sempre
 * atualizada. O `nextDueDate` aqui é o do PRÓXIMO ciclo ainda não faturado,
 * diferente do `dueDate` de um pagamento específico. */
export async function buscarAssinatura(subscriptionId: string): Promise<{ nextDueDate: string; billingType: string }> {
  return asaasFetch<{ nextDueDate: string; billingType: string }>(`/subscriptions/${encodeURIComponent(subscriptionId)}`)
}

export function tokenCartaoMaisRecente(pagamentos: AsaasPayment[]): string | null {
  const pagos = pagamentos
    .filter(
      (p) =>
        ['RECEIVED', 'CONFIRMED'].includes(p.status) &&
        p.billingType === 'CREDIT_CARD' &&
        p.creditCard?.creditCardToken,
    )
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
  return pagos[0]?.creditCard?.creditCardToken ?? null
}

export interface AsaasPayment {
  id: string
  status: string
  invoiceUrl: string
  value: number
  dueDate: string
  billingType?: string
  creditCard?: {
    creditCardToken?: string
  }
}

const STATUS_EM_ABERTO = new Set(['PENDING', 'OVERDUE'])

/** Busca o pagamento em aberto mais antigo (pendente ou vencido) da
 * assinatura — funciona em qualquer ciclo, não só no primeiro mês.
 * Filtra e ordena pelo vencimento igual à versão da plataforma, senão
 * `data[0]` retorna a primeira cobrança (já paga) mesmo em renovações. */
export async function buscarTodosPagamentosDaAssinatura(subscriptionId: string): Promise<AsaasPayment[]> {
  const result = await asaasFetch<{ data: AsaasPayment[] }>(
    `/payments?subscription=${encodeURIComponent(subscriptionId)}&limit=100`,
  )
  return result.data ?? []
}

export async function buscarPrimeiroPagamentoDaAssinatura(
  subscriptionId: string,
): Promise<AsaasPayment | null> {
  const result = await asaasFetch<{ data: AsaasPayment[] }>(
    `/payments?subscription=${encodeURIComponent(subscriptionId)}&limit=100`,
  )
  const emAberto = result.data
    .filter((p) => STATUS_EM_ABERTO.has(p.status))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  return emAberto[0] ?? null
}

/** Liga a cobrança automática no cartão. O PUT /subscriptions ignora
 * creditCardToken — o cartão só fica vinculado via /updateCreditCard, que
 * exige o IP do cliente. updatePendingPayments leva a mudança pra fatura
 * do mês seguinte, que o Asaas já gera logo após o pagamento atual. */
export async function vincularCartaoNaAssinatura(
  subscriptionId: string,
  creditCardToken: string,
  remoteIp: string,
): Promise<void> {
  const id = encodeURIComponent(subscriptionId)
  await asaasFetch(`/subscriptions/${id}/updateCreditCard`, {
    method: 'POST',
    body: JSON.stringify({ creditCardToken, remoteIp }),
  })
  await asaasFetch(`/subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ billingType: 'CREDIT_CARD', updatePendingPayments: true }),
  })
}

export async function buscarStatusPagamento(paymentId: string): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${encodeURIComponent(paymentId)}`)
}

/** Busca o pagamento mais recente de uma assinatura independente do status —
 * fallback pra quando o payment ID não foi salvo (sandbox auto-confirma antes
 * do loop de tentativas conseguir capturar o ID). */
export async function buscarQualquerPagamentoDaAssinatura(
  subscriptionId: string,
): Promise<AsaasPayment | null> {
  const result = await asaasFetch<{ data: AsaasPayment[] }>(
    `/payments?subscription=${encodeURIComponent(subscriptionId)}&limit=1`,
  )
  return result.data?.[0] ?? null
}

export interface AsaasPixQrCode {
  encodedImage: string
  payload: string
  expirationDate: string | null
}

/** QR code + código copia-e-cola do Pix pra uma cobrança específica —
 * funciona em qualquer cobrança, independente do billingType dela. */
export async function buscarPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(`/payments/${encodeURIComponent(paymentId)}/pixQrCode`)
}

/** Cobra um pagamento pendente usando o token do cartão salvo pelo cliente
 * em pagamento anterior — permite cobrar faturas abertas sem o cliente
 * precisar entrar no app e re-informar o cartão. */
export async function cobrarPagamentoComTokenCartao(
  paymentId: string,
  creditCardToken: string,
): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${encodeURIComponent(paymentId)}/payWithCreditCard`, {
    method: 'POST',
    body: JSON.stringify({ creditCardToken }),
  })
}

/** Trava uma cobrança específica em cartão de crédito — usado quando o
 * cliente escolhe pagar com cartão na nossa tela, pra a página hospedada
 * do Asaas mostrar só o formulário de cartão (sem Pix nem boleto juntos).
 * value/dueDate são obrigatórios nesse endpoint mesmo sem mudar de valor. */
export async function definirCobrancaComoCartao(
  paymentId: string,
  value: number,
  dueDate: string,
): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${encodeURIComponent(paymentId)}`, {
    method: 'PUT',
    body: JSON.stringify({ billingType: 'CREDIT_CARD', value, dueDate }),
  })
}

const STATUS_PAGO = new Set(['RECEIVED', 'CONFIRMED'])
const STATUS_VENCIDO = new Set(['OVERDUE'])

/** Traduz o status de pagamento do Asaas pro nosso enum de assinatura — usado
 * tanto pelo webhook quanto pela verificação manual (fallback pra quando o
 * webhook ainda não está configurado ou falha em chegar). */
export function mapStatusPagamentoAsaas(statusAsaas: string): 'em_dia' | 'atrasado' | null {
  if (STATUS_PAGO.has(statusAsaas)) return 'em_dia'
  if (STATUS_VENCIDO.has(statusAsaas)) return 'atrasado'
  return null
}

export async function cancelarAssinaturaAsaas(subscriptionId: string): Promise<void> {
  await asaasFetch(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: 'DELETE',
  })
}
