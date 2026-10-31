import type { Agendamento, Assinatura, Barbeiro, Cliente, PlanoAssinatura, Servico } from '../../types'
import { Card, EmptyState } from '../../components/ui'
import { ScheduleRow } from './ScheduleRow'
import { LivreGroup } from './LivreGroup'
import { agruparLivres } from '../../lib/agendaUtils'

interface ScheduleListProps {
  agendamentos: Agendamento[]
  barbeiros: Barbeiro[]
  clientes: Cliente[]
  servicos: Servico[]
  planos: PlanoAssinatura[]
  assinaturas: Assinatura[]
  mostrarBarbeiro?: boolean
}

export function ScheduleList({
  agendamentos,
  barbeiros,
  clientes,
  servicos,
  planos,
  assinaturas,
  mostrarBarbeiro = true,
}: ScheduleListProps) {
  if (agendamentos.length === 0) {
    return (
      <EmptyState
        title="Nenhum barbeiro cadastrado"
        description="Cadastre um barbeiro para começar a montar a agenda."
      />
    )
  }

  const ordenados = [...agendamentos].sort((a, b) => a.hora.localeCompare(b.hora))
  const items = agruparLivres(ordenados)

  return (
    <Card>
      {items.map((item) =>
        item.type === 'agendamento' ? (
          <ScheduleRow
            key={item.agendamento.id}
            agendamento={item.agendamento}
            barbeiros={barbeiros}
            clientes={clientes}
            servicos={servicos}
            planos={planos}
            assinaturas={assinaturas}
            mostrarBarbeiro={mostrarBarbeiro}
          />
        ) : (
          <LivreGroup
            key={`livres-${item.agendamentos[0].hora}`}
            agendamentos={item.agendamentos}
            barbeiros={barbeiros}
            clientes={clientes}
            servicos={servicos}
            planos={planos}
            assinaturas={assinaturas}
            mostrarBarbeiro={mostrarBarbeiro}
          />
        ),
      )}
    </Card>
  )
}
