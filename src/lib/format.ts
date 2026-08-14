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
