import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CreditCard,
  FileText,
  MapPin,
  ReceiptText,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useClienteDetalle } from '../api'
import type { Cliente } from '../types'
import { useSessionStore } from '@/features/auth/session'
import { Card } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { Skeleton } from '@/shared/ui/skeleton'

const secondaryLinkClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-semibold text-kleep-ink transition hover:border-kleep-blue/30 hover:bg-kleep-soft'

function display(value: unknown, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

function formatMoney(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return String(value)

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(numericValue)
}

function getStatus(cliente?: Cliente) {
  const rawStatus = String(cliente?.status ?? '1')
  return rawStatus === '0'
    ? { label: 'Inactivo', className: 'bg-red-50 text-red-700 ring-red-100' }
    : { label: 'Activo', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' }
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: unknown
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-kleep-ink">
        {display(value)}
      </p>
    </div>
  )
}

function MetricLink({
  to,
  icon: Icon,
  label,
  value,
  tone,
}: {
  to: string
  icon: LucideIcon
  label: string
  value: unknown
  tone: string
}) {
  return (
    <Link
      to={to}
      className="group grid min-h-32 gap-4 rounded-lg border border-black/5 bg-white p-5 shadow-[0_14px_40px_rgba(19,20,21,0.06)] transition hover:-translate-y-0.5 hover:border-kleep-blue/25 hover:shadow-[0_18px_48px_rgba(19,20,21,0.09)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-md ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-kleep-blue opacity-0 transition group-hover:opacity-100">
          Ver
        </span>
      </div>
      <div>
        <p className="text-3xl font-black text-kleep-ink">{display(value, '0')}</p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
      </div>
    </Link>
  )
}

export function ClienteProfilePage() {
  const { clienteId = '' } = useParams()
  const currentUser = useSessionStore((state) => state.user)
  const idUsuario = currentUser?.id ?? ''
  const cliente = useClienteDetalle(idUsuario, clienteId)
  const status = getStatus(cliente.data)

  if (!clienteId) {
    return (
      <EmptyState
        title="Cliente no encontrado"
        description="La ruta no incluye un identificador de cliente valido."
      />
    )
  }

  if (cliente.isLoading) {
    return (
      <div className="grid gap-5">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (cliente.isError || !cliente.data) {
    return (
      <EmptyState
        title="No pudimos cargar este cliente"
        description="Revisa el identificador o intenta volver al listado."
        action={
          <Link to="/clientes" className={secondaryLinkClass}>
            <ArrowLeft className="h-4 w-4" />
            Volver a clientes
          </Link>
        }
      />
    )
  }

  const data = cliente.data
  const creditLimit = data.limite_credito ?? data.limiteCredito ?? data.cta_credito_limite

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/clientes"
          className={secondaryLinkClass}
        >
          <ArrowLeft className="h-4 w-4" />
          Clientes
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link to={`/clientes/${clienteId}/quotes`} className={secondaryLinkClass}>
            <FileText className="h-4 w-4" />
            Cotizaciones
          </Link>
          <Link to={`/clientes/${clienteId}/bills`} className={secondaryLinkClass}>
            <ReceiptText className="h-4 w-4" />
            Facturas
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-black/5 bg-white p-5 lg:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-12 w-12 place-items-center rounded-md bg-kleep-blue text-lg font-black text-white">
                  {display(data.nombre, 'C').slice(0, 1).toUpperCase()}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${status.className}`}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {status.label}
                </span>
              </div>
              <h1 className="mt-4 break-words text-2xl font-black text-kleep-ink lg:text-3xl">
                {data.nombre}
              </h1>
              <p className="mt-2 flex max-w-3xl items-start gap-2 text-sm font-medium text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-kleep-blue" />
                <span>{display(data.direccion)}</span>
              </p>
            </div>

            <div className="grid min-w-56 gap-2 rounded-lg border border-kleep-blue/10 bg-[#f7f9ff] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Limite de credito
              </p>
              <p className="text-2xl font-black text-kleep-ink">
                {formatMoney(creditLimit)}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Cuenta #{display(data.cta_credito_id)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-4 lg:p-7">
          <InfoItem label="Cliente ID" value={data.id ?? clienteId} />
          <InfoItem label="Localidad" value={data.localidad} />
          <InfoItem label="Base" value={data.base_direccion ?? data.base_id} />
          <InfoItem label="Status" value={status.label} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricLink
          to={`/clientes/${clienteId}/quotes`}
          icon={FileText}
          label="Cotizaciones registradas"
          value={data.total_cotizaciones}
          tone="bg-amber-50 text-amber-700"
        />
        <MetricLink
          to={`/clientes/${clienteId}/bills`}
          icon={ReceiptText}
          label="Facturas registradas"
          value={data.total_facturas}
          tone="bg-sky-50 text-sky-700"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5 lg:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-kleep-soft text-kleep-blue">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-kleep-ink">
                Informacion comercial
              </h2>
              <p className="text-sm text-slate-500">
                Datos principales del registro del cliente.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <InfoItem label="Direccion" value={data.direccion} />
            <InfoItem label="Localidad" value={data.localidad} />
            <InfoItem label="Base ID" value={data.base_id} />
            <InfoItem label="Base direccion" value={data.base_direccion} />
          </div>
        </Card>

        <Card className="p-5 lg:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-kleep-soft text-kleep-blue">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-kleep-ink">
                Ejecutivo asignado
              </h2>
              <p className="text-sm text-slate-500">
                Responsable de la cuenta.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-5">
            <InfoItem
              label="Nombre"
              value={data.ejecutivo_nombre ?? data.ejecutivo_registro}
            />
            <InfoItem label="Posicion" value={data.ejecutivo_posicion} />
            <InfoItem label="Region" value={data.ejecutivo_region} />
            <InfoItem label="Ejecutivo ID" value={data.ejecutivo_id} />
          </div>
        </Card>
      </div>

      <Card className="p-5 lg:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-kleep-soft text-kleep-blue">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-black text-kleep-ink">Credito</h2>
            <p className="text-sm text-slate-500">
              Resumen de la cuenta de credito asociada.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <InfoItem label="Cuenta credito ID" value={data.cta_credito_id} />
          <InfoItem label="Limite cuenta" value={formatMoney(data.cta_credito_limite)} />
          <InfoItem label="Limite cliente" value={formatMoney(creditLimit)} />
        </div>
      </Card>
    </>
  )
}
