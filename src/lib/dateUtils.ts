export function getHojeISO(): string {
  return toISO(new Date())
}

export const TIME_SLOTS = [
  '09:00',
  '09:45',
  '10:30',
  '11:15',
  '12:00',
  '13:30',
  '14:15',
  '15:00',
  '15:45',
  '16:30',
  '17:15',
  '18:00',
  '18:45',
]

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

function parseISO(dataISO: string): Date {
  const [year, month, day] = dataISO.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(dataISO: string, delta: number): string {
  const date = parseISO(dataISO)
  date.setDate(date.getDate() + delta)
  return toISO(date)
}

export function formatDateDisplay(dataISO: string): string {
  const date = parseISO(dataISO)
  const diaSemana = DIAS_SEMANA[date.getDay()]
  const mes = MESES[date.getMonth()]
  return `${diaSemana}, ${date.getDate()} de ${mes}`
}

export function mesReferenciaDeData(dataISO: string): string {
  return dataISO.slice(0, 7)
}

export function isSameDate(a: string, b: string): boolean {
  return a === b
}
