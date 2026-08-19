'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { Assinatura, Barbeiro, Cliente, PlanoAssinatura, Servico } from '../../types'
import { Button, Card } from '../../components/ui'
import { agendarComoCliente } from '../../actions/booking.actions'
import { formatBRL } from '../../lib/format'
import { getPrecoServicoParaCliente, getUsosServicoNoMes } from '../../lib/derive'
import { getHojeISO, mesReferenciaDeData } from '../../lib/dateUtils'
import { SubscriptionSavingsBlock } from './SubscriptionSavingsBlock'

interface StepConfirmarProps {
  servico: Servico | undefined
  barbeiro: Barbeiro | undefined
  hora: string
  cliente: Cliente
  assinatura?: Assinatura
  plano?: PlanoAssinatura
  servicos: Servico[]
}

export function StepConfirmar({
  servico,
  barbeiro,
  hora,
  cliente,
  assinatura,
  plano,
  servicos,
}: StepConfirmarProps) {
  const [confirmado, setConfirmado] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleConfirmar() {
    if (!servico || !barbeiro) return
    startTransition(async () => {
      await agendarComoCliente(hora, barbeiro.id, servico.id)
      setConfirmado(true)
    })
  }

  if (confirmado) {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 size={40} className="text-status-green" aria-hidden="true" />
        <h2 className="text-lg text-text-primary">Agendamento confirmado</h2>
        <p className="text-sm text-text-secondary">
          {servico?.nome} com {barbeiro?.nome} às {hora}.
        </p>
      </Card>
    )
  }

  const assinanteAtivo = assinatura?.status === 'em_dia'
  const inclusao = servico ? plano?.servicosInclusos.find((i) => i.servicoId === servico.id) : undefined
  const mesReferencia = mesReferenciaDeData(getHojeISO())
  const usos = inclusao && servico ? getUsosServicoNoMes(cliente, servico.id, mesReferencia) : 0
  const precoInfo = servico
    ? getPrecoServicoParaCliente(servico, assinanteAtivo, inclusao, usos)
    : { valor: 0, incluido: false, esgotado: false }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg text-text-primary">Confirmar agendamento</h2>
      <Card className="flex flex-col gap-2 p-4">
        <Linha label="Serviço" valor={servico?.nome ?? ''} />
        <Linha label="Barbeiro" valor={barbeiro?.nome ?? ''} />
        <Linha label="Horário" valor={`Hoje, ${hora}`} />
        <div className="divider-thin" />
        <Linha
          label="Valor"
          valor={precoInfo.incluido ? 'Incluso no plano' : formatBRL(precoInfo.valor)}
          destaque
        />
      </Card>

      <SubscriptionSavingsBlock cliente={cliente} assinatura={assinatura} plano={plano} servicos={servicos} />

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
