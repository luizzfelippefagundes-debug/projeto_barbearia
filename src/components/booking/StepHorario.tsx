import type { Agendamento, Barbeiro } from '../../types'
import { Button, EmptyState } from '../../components/ui'

export function StepHorario({
  grade,
  barbeiros,
  barbeiroSelecionado,
  onSelect,
}: {
  grade: Agendamento[]
  barbeiros: Barbeiro[]
  barbeiroSelecionado: string | 'qualquer'
  onSelect: (hora: string, barbeiroId: string) => void
}) {
  const livres = grade.filter(
    (a) =>
      a.status === 'livre' &&
      (barbeiroSelecionado === 'qualquer' || a.barbeiroId === barbeiroSelecionado),
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
        <div className="grid grid-cols-3 gap-2">
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
