import { Sidebar } from '../../../components/admin/Sidebar'
import { requireAdminAccess } from '../../../lib/adminAuth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dono = await requireAdminAccess()

  return (
    <div className="flex h-screen flex-col bg-bg lg:flex-row">
      <Sidebar nome={dono.nome} />
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
