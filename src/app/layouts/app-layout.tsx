import {
  Building2,
  CreditCard,
  FileText,
  Home,
  KeyRound,
  LogOut,
  Menu,
  ReceiptText,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { permissions } from '@/features/auth/permissions'
import { useSessionStore } from '@/features/auth/session'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/utils/cn'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home, permission: permissions.dashboard.view },
  { to: '/usuarios', label: 'Usuarios', icon: Users, permission: permissions.usuarios.view },
  { to: '/permisos', label: 'Permisos', icon: ShieldCheck, permission: permissions.permisos.view },
  { to: '/clientes', label: 'Clientes', icon: Building2, permission: permissions.clientes.view },
  {
    to: '/cuentas-credito',
    label: 'Cuentas credito',
    icon: CreditCard,
    permission: permissions.cuentasCredito.view,
  },
  { to: '/bases', label: 'Bases', icon: KeyRound, permission: permissions.bases.view },
  {
    to: '/cotizaciones',
    label: 'Cotizaciones',
    icon: FileText,
    permission: permissions.cotizaciones.view,
  },
  { to: '/facturas', label: 'Facturas', icon: ReceiptText, permission: permissions.facturas.view },
]

export function AppLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const user = useSessionStore((state) => state.user)
  const can = useSessionStore((state) => state.can)
  const permissionsLoaded = useSessionStore((state) => state.permissionsLoaded)
  const clearSession = useSessionStore((state) => state.clearSession)
  const visibleNavItems = permissionsLoaded
    ? navItems.filter((item) => can(item.permission))
    : []

  return (
    <div className="min-h-screen bg-[#f6f8ff]">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-kleep-ink text-white shadow-[20px_0_60px_rgba(19,20,21,0.18)] transition-transform lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-white text-sm font-black text-kleep-blue">
            K
          </div>
          <div>
            <span className="block text-lg font-black tracking-wide">KLEEP</span>
            <span className="text-xs font-medium text-white/55">Business Console</span>
          </div>
        </div>

        <nav className="grid gap-1 p-3">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-white/70 transition',
                    isActive && 'active bg-white text-kleep-ink shadow-sm',
                    !isActive && 'hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <span className="grid h-8 w-8 place-items-center rounded-md bg-white/10 text-white transition group-[.active]:bg-kleep-soft group-[.active]:text-kleep-blue">
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="rounded-lg bg-white/[0.08] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Workspace
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Mayoreo y clientes</p>
          </div>
        </div>
      </aside>

      {isOpen ? (
        <button
          aria-label="Cerrar navegacion"
          className="fixed inset-0 z-30 bg-kleep-ink/40 lg:hidden"
          onClick={() => setIsOpen(false)}
          type="button"
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-black/5 bg-white/90 px-4 shadow-[0_8px_30px_rgba(19,20,21,0.04)] backdrop-blur lg:px-6">
          <button
            aria-label="Abrir navegacion"
            className="rounded-md p-2 text-kleep-ink hover:bg-kleep-soft lg:hidden"
            onClick={() => setIsOpen(true)}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden min-w-0 lg:block">
            <p className="text-sm font-semibold text-kleep-ink">Panel operativo</p>
            <p className="text-xs text-slate-500">
              Gestion comercial, permisos y cartera de clientes
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-lg border border-black/5 bg-white px-3 py-2 shadow-sm sm:flex">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-kleep-soft text-sm font-bold text-kleep-blue">
                {(user?.nombre ?? 'U').slice(0, 1).toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-kleep-ink">
                  {user?.nombre ?? 'Usuario'}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.rol ?? user?.posicionId ?? 'Sesion local'}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                clearSession()
                window.location.assign('/login')
              }}
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </header>

        <main className="mx-auto grid max-w-[1440px] gap-6 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
