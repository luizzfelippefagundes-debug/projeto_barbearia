// Completa a reserva de agendamentos antigos que ficaram com menos slots do
// que a duração real do serviço precisa (legado de antes da agenda ter sido
// corrigida pra calcular por duração). Só mexe em horários que estão
// GENUINAMENTE livres — nunca sobrescreve um horário já ocupado por outro
// cliente (essas colisões reais são puladas e listadas no final, pra
// resolver manualmente).
//
//   node --env-file=.env.local scripts/backfill-slots-agenda.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const TIME_SLOTS = [
  '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
  '12:00', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30',
  '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30',
  '18:45', '19:00',
]
function minutosDoDia(h) {
  const [hh, mm] = h.split(':').map(Number)
  return hh * 60 + mm
}
function slotsOcupadosPorDuracao(horaInicio, duracaoMin, timeSlots) {
  const idx = timeSlots.indexOf(horaInicio)
  if (idx === -1) return [horaInicio]
  const ocupados = [horaInicio]
  let restante = duracaoMin
  for (let i = idx; restante > 0 && i + 1 < timeSlots.length; i++) {
    const gap = minutosDoDia(timeSlots[i + 1]) - minutosDoDia(timeSlots[i])
    restante -= gap
    if (restante > 0) ocupados.push(timeSlots[i + 1])
  }
  return ocupados
}

const hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

const ancoras = await sql`
  select a.id, a.data::text as data, a.hora, a.barbeiro_id, a.cliente_id, a.status, a.barbearia_id, c.nome as cliente_nome,
    (select coalesce(sum(s.duracao_min),0) from agendamento_servicos ags join servicos s on s.id = ags.servico_id where ags.agendamento_id = a.id) as duracao_total
  from agendamentos a
  left join clientes c on c.id = a.cliente_id
  where a.data >= ${hoje} and a.status in ('confirmado','atendido') and a.continuacao_de_id is null and a.cliente_id is not null
  order by a.data, a.barbeiro_id, a.hora
`

let corrigidos = 0
let pulados = 0
for (const a of ancoras) {
  if (a.duracao_total <= 15) continue
  const hora = a.hora.slice(0, 5)
  const slots = slotsOcupadosPorDuracao(hora, a.duracao_total, TIME_SLOTS)
  for (const slot of slots.slice(1)) {
    const existente = await sql`select id, cliente_id, status from agendamentos where data = ${a.data} and hora = ${slot} and barbeiro_id = ${a.barbeiro_id}`
    if (existente.length > 0) {
      if (existente[0].status !== 'livre' && existente[0].cliente_id !== a.cliente_id) {
        pulados++
        console.log(`⏭️  PULADO (colisão real) — ${a.data} ${slot} já tem outro cliente, mas ${a.cliente_nome} (${hora}, ${a.duracao_total}min) precisava desse horário.`)
        continue
      }
      await sql`update agendamentos set status = ${a.status}, cliente_id = ${a.cliente_id}, continuacao_de_id = ${a.id} where id = ${existente[0].id}`
      corrigidos++
      console.log(`✅ ${a.data} ${slot} completado como continuação de ${a.cliente_nome} (${hora})`)
    } else {
      await sql`insert into agendamentos (data, hora, barbeiro_id, cliente_id, status, continuacao_de_id, barbearia_id) values (${a.data}, ${slot}, ${a.barbeiro_id}, ${a.cliente_id}, ${a.status}, ${a.id}, ${a.barbearia_id})`
      corrigidos++
      console.log(`✅ ${a.data} ${slot} criado como continuação de ${a.cliente_nome} (${hora})`)
    }
  }
}
console.log(`\nSlots corrigidos: ${corrigidos} | Pulados (colisão real, resolver manualmente): ${pulados}`)
