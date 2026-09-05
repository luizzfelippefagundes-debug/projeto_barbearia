'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { CalendarMonthGrid, Modal } from '../../components/ui'
import { formatDateDisplay, getHojeISO } from '../../lib/dateUtils'

export function ClienteDatePicker({ dataISO, maxData }: { dataISO: string; maxData: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const hoje = getHojeISO()

  function selecionar(dia: string) {
    router.push(`/cliente/agendar?data=${dia}`)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto mb-4 flex w-full max-w-xs items-center gap-3 rounded-2xl border border-accent bg-accent-muted px-4 py-3 text-left shadow-sm transition-colors hover:bg-accent-muted/70"
      >
        <CalendarDays size={20} className="shrink-0 text-accent" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary capitalize">
            {dataISO === hoje ? 'Hoje' : formatDateDisplay(dataISO)}
          </p>
          <p className="text-[11px] font-medium text-accent">Para alterar a data, clique aqui</p>
        </div>
        <ChevronDown size={18} className="shrink-0 text-accent" aria-hidden="true" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Escolha o dia" widthClassName="max-w-sm">
        <CalendarMonthGrid selecionado={dataISO} minData={hoje} maxData={maxData} onSelect={selecionar} />
      </Modal>
    </>
  )
}
