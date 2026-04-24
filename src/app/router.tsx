import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layouts/app-layout'
import { PrivateRoute } from './layouts/private-route'
import { LoginPage } from '@/features/auth/pages/login-page'
import { BasesPage } from '@/features/bases/pages/bases-page'
import { ClientesPage } from '@/features/clientes/pages/clientes-page'
import { CotizacionesPage } from '@/features/cotizaciones/pages/cotizaciones-page'
import { CuentasCreditoPage } from '@/features/cuentas-credito/pages/cuentas-credito-page'
import { FacturasPage } from '@/features/facturas/pages/facturas-page'
import { PermisosPage } from '@/features/permisos/pages/permisos-page'
import { UsuariosPage } from '@/features/usuarios/pages/usuarios-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { NotFoundPage } from '@/pages/not-found/not-found-page'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'usuarios', element: <UsuariosPage /> },
          { path: 'permisos', element: <PermisosPage /> },
          { path: 'clientes', element: <ClientesPage /> },
          { path: 'cuentas-credito', element: <CuentasCreditoPage /> },
          { path: 'bases', element: <BasesPage /> },
          { path: 'cotizaciones', element: <CotizacionesPage /> },
          { path: 'facturas', element: <FacturasPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
