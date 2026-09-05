import type { Agendamento, Barbeiro } from '../../types'
import { Button, EmptyState } from '../../components/ui'
import { diaDaSemana, getHojeISO, getHoraAtualBrasil, slotsOcupadosPorDuracao, TIME_SLOTS } from '../../lib/dateUtils'

export function StepHorario({
  grade,
  barbeiros,
  barbeiroSelecionado,
  duracaoTotal,
  dataISO,
  onSelect,
}: {
  grade: Agendamento[]
  barbeiros: Barbeiro[]
  barbeiroSelecionado: string | 'qualquer'
  duracaoTotal: number
  dataISO: string
  onSelect: (hora: string, barbeiroId: string) => void
}) {
  const porChave = new Map(grade.map((a) => [`${a.barbeiroId}|${a.hora}`, a]))
  const porBarbeiroId = new Map(barbeiros.map((b) => [b.id, b]))

  function todosSlotsLivres(barbeiroId: string, hora: string): boolean {
    const slots = slotsOcupadosPorDuracao(hora, duracaoTotal, TIME_SLOTS)
    return slots.every((s) => porChave.get(`${barbeiroId}|${s}`)?.status === 'livre')
  }

  // Só oferece horário dentro do que o barbeiro tem configurado como
  // horário de trabalho (dia da semana + faixa de hora) — não se aplica à
  // agenda do próprio dono/barbeiro, só ao agendamento do cliente.
  function dentroDoHorarioDeTrabalho(barbeiroId: string, hora: string): boolean {
    const barbeiro = porBarbeiroId.get(barbeiroId)
    if (!barbeiro) return false
    if (!barbeiro.diasTrabalho.includes(diaDaSemana(dataISO))) return false
    return hora >= barbeiro.horaInicio && hora <= barbeiro.horaFim
  }

  // Hoje, esconde horários que já passaram — dia futuro mostra tudo.
  const horaMinima = dataISO === getHojeISO() ? getHoraAtualBrasil() : null

  const livres = grade.filter(
    (a) =>
      a.status === 'livre' &&
      (barbeiroSelecionado === 'qualquer' || a.barbeiroId === barbeiroSelecionado) &&
      (!horaMinima || a.hora > horaMinima) &&
      dentroDoHorarioDeTrabalho(a.barbeiroId, a.hora) &&
      todosSlotsLivres(a.barbeiroId, a.hora),
  )

  const porHora = new Map<string, Agendamento>()
  livres.forEach((a) => {
    if (!porHora.has(a.hora)) porHora.set(a.hora, a)
  })
  const opcoes = [...porHora.values()].sort((a, b) => a.hora.localeCompare(b.hora))

  return (
    <div>
      <h2 className="mb-4 text-lg text-text-primary">Escolha o horário</h2>
      {opcoes.length === 0 ? (
        <EmptyState title="Sem horários livres" description="Tente outro barbeiro ou volte outro dia." />
      ) : (
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-5">
          {opcoes.map((a) => {
            const barbeiro = barbeiros.find((b) => b.id === a.barbeiroId)
            return (
              <Button
                key={a.id}
                variant="secondary"
                className="flex-col"
                onClick={() => onSelect(a.hora, a.barbeiroId)}
              >
                <span className="mono-value">{a.hora}</span>
                {barbeiroSelecionado === 'qualquer' && (
                  <span className="text-[10px] text-text-secondary">{barbeiro?.nome}</span>
                )}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
