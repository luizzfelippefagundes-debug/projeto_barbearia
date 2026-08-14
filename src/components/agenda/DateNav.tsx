import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, formatDateDisplay, getHojeISO } from '../../lib/dateUtils'

export function DateNav({ dataISO }: { dataISO: string }) {
  const hoje = getHojeISO()

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/admin/agenda?data=${addDays(dataISO, -1)}`}
        aria-label="Dia anterior"
        className="flex h-9 w-9 items-center justify-center rounded border border-border text-text-secondary hover:border-brass hover:text-brass"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </Link>
      <div className="min-w-[10rem] text-center">
        <p className="font-heading text-sm tracking-wide text-text-primary uppercase">
          {formatDateDisplay(dataISO)}
        </p>
      </div>
      <Link
        href={`/admin/agenda?data=${addDays(dataISO, 1)}`}
        aria-label="Próximo dia"
        className="flex h-9 w-9 items-center justify-center rounded border border-border text-text-secondary hover:border-brass hover:text-brass"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
      {dataISO !== hoje && (
        <Link
          href="/admin/agenda"
          className="rounded border border-transparent px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
        >
          Hoje
        </Link>
      )}
    </div>
  )
}
