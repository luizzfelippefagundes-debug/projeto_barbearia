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
      billingType: 'PIX',
      nextDueDate: params.nextDueDate,
      value: params.value,
      cycle: 'MONTHLY',
      description: params.description,
    }),
  })
}

export interface AsaasPayment {
  id: string
  status: string
}

export async function buscarPrimeiroPagamentoDaAssinatura(
  subscriptionId: string,
): Promise<AsaasPayment | null> {
  const result = await asaasFetch<{ data: AsaasPayment[] }>(
    `/payments?subscription=${encodeURIComponent(subscriptionId)}`,
  )
  return result.data[0] ?? null
}

export interface AsaasPixQrCode {
  encodedImage: string
  payload: string
  expirationDate: string
}

export async function buscarPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(`/payments/${encodeURIComponent(paymentId)}/pixQrCode`)
}

export async function cancelarAssinaturaAsaas(subscriptionId: string): Promise<void> {
  await asaasFetch(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: 'DELETE',
  })
}
