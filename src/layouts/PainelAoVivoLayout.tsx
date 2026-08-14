import { Outlet } from 'react-router-dom'

export function PainelAoVivoLayout() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <Outlet />
    </div>
  )
}
