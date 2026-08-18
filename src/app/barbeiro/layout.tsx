import { requireBarbeiroAccess } from '../../lib/barbeiroAuth'

export default async function BarbeiroGateLayout({ children }: { children: React.ReactNode }) {
  await requireBarbeiroAccess()
  return <>{children}</>
}
