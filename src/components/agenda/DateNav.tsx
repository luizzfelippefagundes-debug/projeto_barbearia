import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, formatDateDisplay, getHojeISO } from '../../lib/dateUtils'

export function DateNav({ dataISO, basePath = '/admin/agenda' }: { dataISO: string; basePath?: string }) {
  const hoje = getHojeISO()

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`${basePath}?data=${addDays(dataISO, -1)}`}
        aria-label="Dia anterior"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary hover:border-accent hover:text-accent"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </Link>
      <div className="min-w-[10rem] text-center">
        <p className="font-heading text-sm font-bold text-text-primary capitalize">
          {formatDateDisplay(dataISO)}
        </p>
      </div>
      <Link
        href={`${basePath}?data=${addDays(dataISO, 1)}`}
        aria-label="Próximo dia"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary hover:border-accent hover:text-accent"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
      {dataISO !== hoje && (
        <Link
          href={basePath}
          className="rounded-full border border-transparent px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
        >
          Hoje
        </Link>
      )}
    </div>
  )
}
