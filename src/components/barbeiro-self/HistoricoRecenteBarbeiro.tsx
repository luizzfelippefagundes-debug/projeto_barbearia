import type { AtendimentoRecente } from '../../lib/derive'
import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { formatDateDisplay } from '../../lib/dateUtils'

export function HistoricoRecenteBarbeiro({ atendimentos }: { atendimentos: AtendimentoRecente[] }) {
  return (
    <div>
      <SectionHeading>Últimos atendimentos</SectionHeading>
      {atendimentos.length === 0 ? (
        <EmptyState title="Nada registrado ainda" description="Seus atendimentos recentes aparecem aqui." />
      ) : (
        <Card className="divide-y divide-border p-0">
          {atendimentos.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="text-sm text-text-primary">{a.clienteNome}</p>
              <div className="text-right">
                <p className="text-xs text-text-secondary">{a.servicoNome}</p>
                <p className="text-[11px] text-text-secondary">{formatDateDisplay(a.data)}</p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
