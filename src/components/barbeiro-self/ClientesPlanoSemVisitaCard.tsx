import { MessageCircle } from 'lucide-react'
import type { ClientePlanoSemVisita } from '../../lib/derive'
import { Card, EmptyState, SectionHeading } from '../../components/ui'

function linkWhatsapp(telefone: string): string {
  const digitos = telefone.replace(/\D/g, '')
  return `https://wa.me/${digitos}`
}

export function ClientesPlanoSemVisitaCard({ clientes }: { clientes: ClientePlanoSemVisita[] }) {
  return (
    <div>
      <SectionHeading>Clientes de plano que ainda não vieram este mês</SectionHeading>
      <p className="-mt-2 mb-3 text-xs text-text-secondary">
        Quem chamar e atender primeiro fica com a comissão de plano desse cliente no mês.
      </p>
      {clientes.length === 0 ? (
        <EmptyState
          title="Todo mundo já veio"
          description="Nenhum cliente de plano ficou de fora este mês (até agora)."
        />
      ) : (
        <Card className="divide-y divide-border p-0">
          {clientes.map((c) => (
            <div key={c.clienteId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm text-text-primary">{c.clienteNome}</p>
                <p className="text-xs text-text-secondary">{c.planoNome}</p>
              </div>
              {c.clienteTelefone && (
                <a
                  href={linkWhatsapp(c.clienteTelefone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-brass/40 px-3 py-1.5 text-xs text-brass transition-colors hover:bg-brass-muted"
                >
                  <MessageCircle size={14} aria-hidden="true" />
                  Chamar
                </a>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
