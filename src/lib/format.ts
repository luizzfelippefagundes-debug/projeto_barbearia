export function formatBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatPercent(valor: number): string {
  return `${valor}%`
}

export function formatDataCurta(dataISO: string): string {
  const [year, month, day] = dataISO.split('-')
  return `${day}/${month}/${year.slice(2)}`
}

/** Retorna a próxima data de cobrança real a partir de hoje, usando o
 * dia de vencimento embutido em proximaCobrancaISO. Corrige o caso onde
 * o Asaas salva nextDueDate 2 ciclos à frente (quando gera a fatura do
 * próximo ciclo imediatamente após um pagamento ser confirmado). */
export function proximaBillingDate(proximaCobrancaISO: string): string {
  const billingDay = parseInt(proximaCobrancaISO.slice(8, 10), 10)
  const hoje = new Date()
  let ano = hoje.getUTCFullYear()
  let mes = hoje.getUTCMonth() // 0-indexed
  if (billingDay <= hoje.getUTCDate()) {
    mes += 1
    if (mes > 11) { mes = 0; ano += 1 }
  }
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(billingDay).padStart(2, '0')}`
}

export function formatHoraCurta(dataHoraISO: string): string {
  const date = new Date(dataHoraISO)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
