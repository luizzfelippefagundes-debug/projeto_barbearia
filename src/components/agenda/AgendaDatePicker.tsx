'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarMonthGrid, Modal } from '../../components/ui'
import { addDays, formatDateDisplay, getHojeISO } from '../../lib/dateUtils'

export function AgendaDatePicker({
  dataISO,
  basePath = '/admin/agenda',
  barbeiro,
}: {
  dataISO: string
  basePath?: string
  barbeiro?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const hoje = getHojeISO()

  function irPara(dia: string) {
    const sufixoBarbeiro = barbeiro ? `&barbeiro=${barbeiro}` : ''
    router.push(`${basePath}?data=${dia}${sufixoBarbeiro}`)
  }

  function selecionar(dia: string) {
    irPara(dia)
    setOpen(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => irPara(addDays(dataISO, -1))}
          aria-label="Dia anterior"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text-secondary hover:border-accent hover:text-accent"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-accent bg-accent-muted px-3 py-1.5 text-accent sm:flex-none"
        >
          <CalendarDays size={16} className="shrink-0" aria-hidden="true" />
          <span className="truncate font-heading text-sm font-bold capitalize">
            {dataISO === hoje ? 'Hoje' : formatDateDisplay(dataISO)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => irPara(addDays(dataISO, 1))}
          aria-label="Próximo dia"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text-secondary hover:border-accent hover:text-accent"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>

        {dataISO !== hoje && (
          <button
            type="button"
            onClick={() => irPara(hoje)}
            className="shrink-0 rounded-full border border-transparent px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary"
          >
            Hoje
          </button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Escolha o dia" widthClassName="max-w-sm">
        <CalendarMonthGrid selecionado={dataISO} onSelect={selecionar} />
      </Modal>
    </>
  )
}
