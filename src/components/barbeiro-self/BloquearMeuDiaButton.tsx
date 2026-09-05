'use client'

import { useState, useTransition } from 'react'
import { CalendarOff } from 'lucide-react'
import { Button, ConfirmDialog } from '../../components/ui'
import { bloquearMeuDiaInteiro, desbloquearMeuDiaInteiro } from '../../actions/barbeiroSelf.actions'

export function BloquearMeuDiaButton({ dataISO, ehHoje }: { dataISO: string; ehHoje: boolean }) {
  const [pending, startTransition] = useTransition()
  const [confirmar, setConfirmar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleBloquear() {
    setErro(null)
    startTransition(async () => {
      try {
        await bloquearMeuDiaInteiro(dataISO)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Não foi possível bloquear o dia.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => startTransition(() => desbloquearMeuDiaInteiro(dataISO))}
        >
          Desbloquear dia
        </Button>
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => setConfirmar(true)}>
          <CalendarOff size={16} aria-hidden="true" />
          {ehHoje ? 'Sair mais cedo hoje' : 'Bloquear dia'}
        </Button>
      </div>
      {erro && <p className="text-xs text-status-red">{erro}</p>}

      <ConfirmDialog
        open={confirmar}
        onClose={() => setConfirmar(false)}
        onConfirm={handleBloquear}
        title={ehHoje ? 'Sair mais cedo hoje' : 'Bloquear o dia inteiro'}
        description={
          ehHoje
            ? 'Bloqueia os horários livres que sobraram hoje. Horários que já têm cliente marcado não são mexidos.'
            : 'Bloqueia todos os seus horários livres nesse dia. Horários que já têm cliente marcado não são mexidos.'
        }
        confirmLabel={ehHoje ? 'Sair mais cedo' : 'Bloquear'}
        danger={false}
      />
    </div>
  )
}
