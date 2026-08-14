import { requireAdminAccess } from '../../lib/adminAuth'

export default async function AdminGateLayout({ children }: { children: React.ReactNode }) {
  await requireAdminAccess()
  return <>{children}</>
}
