import { ClienteHeader } from '../../components/cliente/ClienteHeader'
import { ClienteBottomNav } from '../../components/cliente/ClienteBottomNav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <ClienteHeader />

      <main className="mx-auto max-w-md px-4 py-5 pb-24">{children}</main>

      <ClienteBottomNav />
    </div>
  )
}
