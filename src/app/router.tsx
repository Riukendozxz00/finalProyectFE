import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layouts/app-layout'
import { PermissionRoute, PrivateRoute } from './layouts/private-route'
import { permissions } from '@/features/auth/permissions'
import { LoginPage } from '@/features/auth/pages/login-page'
import { BasesPage } from '@/features/bases/pages/bases-page'
import { BaseProfilePage } from '@/features/bases/pages/base-profile-page'
import { ClienteProfilePage } from '@/features/clientes/pages/cliente-profile-page'
import { ClientesPage } from '@/features/clientes/pages/clientes-page'
import { CotizacionesPage } from '@/features/cotizaciones/pages/cotizaciones-page'
import { CuentasCreditoPage } from '@/features/cuentas-credito/pages/cuentas-credito-page'
import { FacturasPage } from '@/features/facturas/pages/facturas-page'
import { PermisosPage } from '@/features/permisos/pages/permisos-page'
import { UsuarioProfilePage } from '@/features/usuarios/pages/usuario-profile-page'
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
          { index: true, element: <PermissionRoute permission={permissions.dashboard.view}><DashboardPage /></PermissionRoute> },
          { path: 'usuarios', element: <PermissionRoute permission={permissions.usuarios.view}><UsuariosPage /></PermissionRoute> },
          { path: 'usuarios/:userId', element: <PermissionRoute permission={permissions.usuarios.view}><UsuarioProfilePage /></PermissionRoute> },
          { path: 'permisos', element: <PermissionRoute permission={permissions.permisos.view}><PermisosPage /></PermissionRoute> },
          { path: 'clientes', element: <PermissionRoute permission={permissions.clientes.view}><ClientesPage /></PermissionRoute> },
          { path: 'clientes/:clienteId', element: <PermissionRoute permission={permissions.clientes.view}><ClienteProfilePage /></PermissionRoute> },
          { path: 'clientes/:clienteId/quotes', element: <PermissionRoute permission={permissions.cotizaciones.view}><CotizacionesPage /></PermissionRoute> },
          { path: 'clientes/:clienteId/bills', element: <PermissionRoute permission={permissions.facturas.view}><FacturasPage /></PermissionRoute> },
          { path: 'cuentas-credito', element: <PermissionRoute permission={permissions.cuentasCredito.view}><CuentasCreditoPage /></PermissionRoute> },
          { path: 'bases', element: <PermissionRoute permission={permissions.bases.view}><BasesPage /></PermissionRoute> },
          { path: 'bases/:baseId', element: <PermissionRoute permission={permissions.bases.view}><BaseProfilePage /></PermissionRoute> },
          { path: 'cotizaciones', element: <PermissionRoute permission={permissions.cotizaciones.view}><CotizacionesPage /></PermissionRoute> },
          { path: 'facturas', element: <PermissionRoute permission={permissions.facturas.view}><FacturasPage /></PermissionRoute> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
