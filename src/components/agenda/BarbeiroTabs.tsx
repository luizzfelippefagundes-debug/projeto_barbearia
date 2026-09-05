import Link from 'next/link'
import type { Barbeiro } from '../../types'
import { cn } from '../../lib/cn'

export function BarbeiroTabs({
  barbeiros,
  selecionado,
  dataISO,
  basePath = '/admin/agenda',
}: {
  barbeiros: Barbeiro[]
  selecionado: string
  dataISO: string
  basePath?: string
}) {
  const abas = [...barbeiros.map((b) => ({ id: b.id, nome: b.nome })), { id: 'todos', nome: 'Todos' }]

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {abas.map((aba) => {
        const ativo = aba.id === selecionado
        return (
          <Link
            key={aba.id}
            href={`${basePath}?data=${dataISO}&barbeiro=${aba.id}`}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              ativo
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-surface text-text-secondary hover:border-accent hover:text-text-primary',
            )}
          >
            {aba.nome}
          </Link>
        )
      })}
    </div>
  )
}
