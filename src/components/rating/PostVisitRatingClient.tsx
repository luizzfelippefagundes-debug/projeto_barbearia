'use client'

import { useState, useTransition } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import type { Barbeiro, HaircutRecord, Servico } from '../../types'
import { Button, Card } from '../../components/ui'
import { avaliarVisita } from '../../actions/booking.actions'
import { formatDataCurta } from '../../lib/format'

export function PostVisitRatingClient({
  visita,
  barbeiro,
  servico,
}: {
  visita: HaircutRecord
  barbeiro: Barbeiro | undefined
  servico: Servico | undefined
}) {
  const [avaliacao, setAvaliacao] = useState(visita.avaliacao)
  const [pending, startTransition] = useTransition()

  if (avaliacao) {
    return (
      <Card className="flex flex-col items-center gap-2 p-8 text-center">
        <p className="text-lg text-text-primary">Obrigado pela avaliação!</p>
        <p className="text-sm text-text-secondary">Isso ajuda a melhorar o atendimento.</p>
      </Card>
    )
  }

  function avaliar(rating: 'up' | 'down') {
    startTransition(async () => {
      await avaliarVisita(visita.id, rating)
      setAvaliacao(rating)
    })
  }

  return (
    <Card className="flex flex-col items-center gap-4 p-8 text-center">
      <div>
        <p className="text-lg text-text-primary">Como foi o seu corte?</p>
        <p className="text-sm text-text-secondary">
          {servico?.nome} com {barbeiro?.nome} · {formatDataCurta(visita.data)}
        </p>
      </div>
      <div className="flex gap-4">
        <Button size="lg" variant="secondary" disabled={pending} onClick={() => avaliar('up')}>
          <ThumbsUp size={22} aria-hidden="true" />
        </Button>
        <Button size="lg" variant="ghost" disabled={pending} onClick={() => avaliar('down')}>
          <ThumbsDown size={22} aria-hidden="true" />
        </Button>
      </div>
    </Card>
  )
}
