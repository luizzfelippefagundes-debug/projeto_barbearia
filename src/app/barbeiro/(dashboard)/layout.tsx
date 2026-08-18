import { BarbeiroSidebar } from '../../../components/barbeiro-self/BarbeiroSidebar'

export default function BarbeiroDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <BarbeiroSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
