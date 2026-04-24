import {
  Building2,
  CreditCard,
  FileText,
  ReceiptText,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'

const metricCards = [
  { label: 'Usuarios', value: 'Mayoreo', detail: 'Altas, equipo y detalle', icon: Users },
  {
    label: 'Permisos',
    value: 'Menudeo',
    detail: 'Grupos, roles y accesos',
    icon: ShieldCheck,
  },
  { label: 'Clientes', value: 'CRM', detail: 'Cartera y credito', icon: Building2 },
  { label: 'Credito', value: 'Cuentas', detail: 'Limites por cliente', icon: CreditCard },
]

const quickLinks = [
  { label: 'Clientes', to: '/clientes', icon: Building2 },
  { label: 'Bases', to: '/bases', icon: CreditCard },
  { label: 'Cotizaciones', to: '/cotizaciones', icon: FileText },
  { label: 'Facturas', to: '/facturas', icon: ReceiptText },
]

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vista ejecutiva de los modulos operativos de KLEEP."
      />

      <section className="rounded-lg bg-kleep-ink p-6 text-white shadow-[0_20px_60px_rgba(19,20,21,0.18)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-kleep-soft">
              Consola comercial
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight">
              Opera clientes, credito y documentos desde un mismo lugar.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Navega por los modulos principales, consulta informacion enriquecida y
              ejecuta acciones de administracion sin salir del flujo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[440px]">
            {quickLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-lg border border-white/10 bg-white/[0.08] p-4 text-sm font-semibold text-white transition hover:bg-white hover:text-kleep-ink"
                >
                  <Icon className="mb-3 h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-black text-kleep-ink">{card.value}</p>
                  <p className="mt-2 text-xs font-medium text-slate-500">{card.detail}</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-md bg-kleep-soft text-kleep-blue">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
