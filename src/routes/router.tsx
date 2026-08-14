import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { PainelAoVivoLayout } from '../layouts/PainelAoVivoLayout'
import { PublicLayout } from '../layouts/PublicLayout'

import { AgendaScreen } from '../screens/agenda/AgendaScreen'
import { ClientesScreen } from '../screens/clientes/ClientesScreen'
import { BarbeirosScreen } from '../screens/barbeiros/BarbeirosScreen'
import { AssinaturasScreen } from '../screens/assinaturas/AssinaturasScreen'
import { FinanceiroScreen } from '../screens/financeiro/FinanceiroScreen'
import { ProdutosScreen } from '../screens/produtos/ProdutosScreen'
import { PainelAoVivoScreen } from '../screens/painel-ao-vivo/PainelAoVivoScreen'

import { PublicHome } from '../screens/public/PublicHome'
import { BookingFlowScreen } from '../screens/public/booking/BookingFlowScreen'
import { PerfilScreen } from '../screens/public/perfil/PerfilScreen'
import { AiHaircutPreviewScreen } from '../screens/public/preview/AiHaircutPreviewScreen'
import { PostVisitRating } from '../screens/public/rating/PostVisitRating'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/admin/agenda" replace /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="agenda" replace /> },
      { path: 'agenda', element: <AgendaScreen /> },
      { path: 'clientes', element: <ClientesScreen /> },
      { path: 'barbeiros', element: <BarbeirosScreen /> },
      { path: 'assinaturas', element: <AssinaturasScreen /> },
      { path: 'financeiro', element: <FinanceiroScreen /> },
      { path: 'produtos', element: <ProdutosScreen /> },
    ],
  },
  {
    path: '/admin/painel-ao-vivo',
    element: <PainelAoVivoLayout />,
    children: [{ index: true, element: <PainelAoVivoScreen /> }],
  },
  {
    path: '/cliente',
    element: <PublicLayout />,
    children: [
      { index: true, element: <PublicHome /> },
      { path: 'agendar', element: <BookingFlowScreen /> },
      { path: 'perfil', element: <PerfilScreen /> },
      { path: 'preview-corte', element: <AiHaircutPreviewScreen /> },
      { path: 'avaliar/:agendamentoId', element: <PostVisitRating /> },
    ],
  },
])
