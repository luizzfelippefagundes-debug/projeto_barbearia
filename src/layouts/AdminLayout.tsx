import { NavLink, Outlet } from 'react-router-dom'
import {
  CalendarDays,
  Users,
  Scissors,
  Repeat,
  LineChart,
  Package,
  Tv,
} from 'lucide-react'
import { tabTriggerClasses } from '../components/ui/Tabs'
import { NOME_BARBEARIA } from '../lib/constants'

const TABS = [
  { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/barbeiros', label: 'Barbeiros', icon: Scissors },
  { to: '/admin/assinaturas', label: 'Assinaturas', icon: Repeat },
  { to: '/admin/financeiro', label: 'Financeiro', icon: LineChart },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/painel-ao-vivo', label: 'Painel ao Vivo', icon: Tv },
]

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="font-heading text-lg tracking-wide text-accent uppercase">
            {NOME_BARBEARIA}
          </span>
          <span className="text-xs text-text-secondary">Painel do dono</span>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => tabTriggerClasses(isActive)}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
