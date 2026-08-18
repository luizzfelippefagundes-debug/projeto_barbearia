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

export function formatHoraCurta(dataHoraISO: string): string {
  const date = new Date(dataHoraISO)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
