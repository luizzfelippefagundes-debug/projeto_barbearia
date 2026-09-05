'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { Assinatura, Barbeiro, Cliente, PlanoAssinatura, Servico } from '../../types'
import { Button, Card } from '../../components/ui'
import { agendarComoCliente } from '../../actions/booking.actions'
import { formatBRL } from '../../lib/format'
import { getPrecoServicoParaCliente, getUsosServicoNoMes } from '../../lib/derive'
import { formatDateDisplay, getHojeISO, mesReferenciaDeData } from '../../lib/dateUtils'
import { SubscriptionSavingsBlock } from './SubscriptionSavingsBlock'

interface StepConfirmarProps {
  servicoIds: string[]
  barbeiro: Barbeiro | undefined
  hora: string
  dataISO: string
  cliente: Cliente
  assinatura?: Assinatura
  plano?: PlanoAssinatura
  servicos: Servico[]
}

export function StepConfirmar({
  servicoIds,
  barbeiro,
  hora,
  dataISO,
  cliente,
  assinatura,
  plano,
  servicos,
}: StepConfirmarProps) {
  const [confirmado, setConfirmado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const servicosEscolhidos = servicoIds
    .map((id) => servicos.find((s) => s.id === id))
    .filter((s): s is Servico => Boolean(s))
  const nomesServicos = servicosEscolhidos.map((s) => s.nome).join(' + ')

  function handleConfirmar() {
    if (!barbeiro || servicoIds.length === 0) return
    setErro(null)
    startTransition(async () => {
      try {
        await agendarComoCliente(hora, barbeiro.id, servicoIds, dataISO)
        setConfirmado(true)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Não foi possível agendar. Tente outro horário.')
      }
    })
  }

  const hojeISO = getHojeISO()
  const dataLabel = dataISO === hojeISO ? 'Hoje' : formatDateDisplay(dataISO)

  if (confirmado) {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 size={40} className="text-status-green" aria-hidden="true" />
        <h2 className="text-lg text-text-primary">Agendamento confirmado</h2>
        <p className="text-sm text-text-secondary">
          {nomesServicos} com {barbeiro?.nome} — {dataLabel}, {hora}.
        </p>
      </Card>
    )
  }

  const assinanteAtivo = assinatura?.status === 'em_dia'
  const mesReferencia = mesReferenciaDeData(dataISO)

  let valorTotal = 0
  let todosInclusos = servicosEscolhidos.length > 0

  for (const servico of servicosEscolhidos) {
    const inclusao = plano?.servicosInclusos.find((i) => i.servicoId === servico.id)
    const usos = inclusao ? getUsosServicoNoMes(cliente, servico.id, mesReferencia) : 0
    const { valor, incluido } = getPrecoServicoParaCliente(servico, assinanteAtivo, inclusao, usos)
    valorTotal += valor
    if (!incluido) todosInclusos = false
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg text-text-primary">Confirmar agendamento</h2>
      <Card className="flex flex-col gap-2 p-4">
        <Linha label="Serviço" valor={nomesServicos} />
        <Linha label="Barbeiro" valor={barbeiro?.nome ?? ''} />
        <Linha label="Horário" valor={`${dataLabel}, ${hora}`} />
        <div className="divider-thin" />
        <Linha label="Valor" valor={todosInclusos ? 'Incluso no plano' : formatBRL(valorTotal)} destaque />
      </Card>

      <SubscriptionSavingsBlock cliente={cliente} assinatura={assinatura} plano={plano} servicos={servicos} />

      {erro && <p className="text-xs text-status-red">{erro}</p>}

      <Button onClick={handleConfirmar} disabled={pending}>
        {pending ? 'Confirmando...' : 'Confirmar agendamento'}
      </Button>
    </div>
  )
}

function Linha({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={destaque ? 'mono-value text-brass' : 'text-sm text-text-primary'}>{valor}</span>
    </div>
  )
}
