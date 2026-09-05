/** A Vercel roda as funções em UTC, não no fuso da barbearia — sem fixar o
 * fuso aqui, "hoje" viraria amanhã a partir das 21h (horário de Brasília).
 * Por isso "agora" sempre passa por esse fuso explícito, nunca pelo fuso
 * default do servidor. */
const FUSO_BARBEARIA = 'America/Sao_Paulo'

export function getHojeISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: FUSO_BARBEARIA })
}

/** Hora atual (HH:MM) no fuso da barbearia — usado pra esconder horários
 * de hoje que já passaram. */
export function getHoraAtualBrasil(): string {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: FUSO_BARBEARIA,
    hour: '2-digit',
    minute: '2-digit',
  })
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

export const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
export const MESES = [
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

/** "seg 03" — pro seletor de dia do cliente, um por linha, sem depender de
 * ninguém entender que setinhas servem pra trocar de data. */
export function formatDiaCurto(dataISO: string): string {
  const date = parseISO(dataISO)
  const diaSemana = DIAS_SEMANA[date.getDay()]
  return `${diaSemana} ${String(date.getDate()).padStart(2, '0')}`
}

/** Semana de segunda a domingo que contém a data informada. */
export function getInicioFimSemana(dataISO: string): { inicio: string; fim: string } {
  const date = parseISO(dataISO)
  const diaSemana = date.getDay() // 0 = domingo, 1 = segunda, ..., 6 = sábado
  const deltaParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana
  const inicio = addDays(dataISO, deltaParaSegunda)
  const fim = addDays(inicio, 6)
  return { inicio, fim }
}

export function isSameDate(a: string, b: string): boolean {
  return a === b
}

/** 0=domingo..6=sábado, mesma convenção de Date.getDay() — usado pra
 * cruzar com o dias_trabalho de cada barbeiro. */
export function diaDaSemana(dataISO: string): number {
  return parseISO(dataISO).getDay()
}

/** Descanso entre um atendimento e outro — soma na duração antes de
 * calcular quantos slots da grade ficam ocupados, pra sempre sobrar um
 * respiro pro barbeiro entre um cliente e o próximo. */
const TEMPO_DESCANSO_MIN = 5

function minutosDoDia(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

/** Quais horários de TIME_SLOTS um agendamento ocupa, começando em
 * horaInicio, dada a duração total dos serviços pedidos. Usa o intervalo
 * real entre os slots (o intervalo do almoço, por exemplo, é maior), não
 * um passo fixo — por isso conta quantos slots seguintes cabem dentro da
 * duração em vez de só dividir por um número fixo de minutos. */
export function slotsOcupadosPorDuracao(horaInicio: string, duracaoMin: number, timeSlots: string[]): string[] {
  const idx = timeSlots.indexOf(horaInicio)
  if (idx === -1) return [horaInicio]

  const ocupados = [horaInicio]
  let restante = duracaoMin + TEMPO_DESCANSO_MIN
  for (let i = idx; restante > 0 && i + 1 < timeSlots.length; i++) {
    const gap = minutosDoDia(timeSlots[i + 1]) - minutosDoDia(timeSlots[i])
    restante -= gap
    if (restante > 0) ocupados.push(timeSlots[i + 1])
  }
  return ocupados
}
