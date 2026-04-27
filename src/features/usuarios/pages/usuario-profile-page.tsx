import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useUsuarioDetalle } from '../api'
import type { Usuario } from '../types'
import { useSessionStore } from '@/features/auth/session'
import { useClientes } from '@/features/clientes/api'
import type { Cliente } from '@/features/clientes/types'
import { Card } from '@/shared/ui/card'
import { DataTable, type Column } from '@/shared/ui/table'
import { EmptyState } from '@/shared/ui/empty-state'
import { Skeleton } from '@/shared/ui/skeleton'
import { getRecordId } from '@/shared/utils/records'

const secondaryLinkClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-semibold text-kleep-ink transition hover:border-kleep-blue/30 hover:bg-kleep-soft'

function display(value: unknown, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

function getFullName(usuario?: Usuario) {
  return `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`.trim()
}

function toNumber(value: unknown) {
  const numericValue = Number(value ?? 0)
  return Number.isNaN(numericValue) ? 0 : numericValue
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: unknown
  detail: string
  tone: string
}) {
  return (
    <div className="grid min-h-32 gap-4 rounded-lg border border-black/5 bg-white p-5 shadow-[0_14px_40px_rgba(19,20,21,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-md ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div>
        <p className="text-3xl font-black text-kleep-ink">{display(value, '0')}</p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-1 text-xs font-medium text-slate-400">{detail}</p>
      </div>
    </div>
  )
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: unknown
  icon?: LucideIcon
}) {
  return (
    <div className="flex min-w-0 gap-3">
      {Icon ? (
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-kleep-soft text-kleep-blue">
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-kleep-ink">
          {display(value)}
        </p>
      </div>
    </div>
  )
}

export function UsuarioProfilePage() {
  const { userId = '' } = useParams()
  const currentUser = useSessionStore((state) => state.user)
  const empleadoId = currentUser?.id ?? ''
  const usuario = useUsuarioDetalle(userId)
  const ejecutivoId = Number(userId)
  const clientes = useClientes(
    empleadoId,
    Number.isNaN(ejecutivoId) ? {} : { ejecutivoId },
  )

  const assignedCustomers = clientes.data ?? []
  const totals = useMemo(
    () =>
      assignedCustomers.reduce(
        (summary, cliente) => ({
          cotizaciones:
            summary.cotizaciones + toNumber(cliente.total_cotizaciones),
          facturas: summary.facturas + toNumber(cliente.total_facturas),
        }),
        { cotizaciones: 0, facturas: 0 },
      ),
    [assignedCustomers],
  )

  const customerColumns: Array<Column<Cliente>> = [
    {
      header: 'Cliente',
      cell: (row) => (
        <Link
          to={`/clientes/${getRecordId(row)}`}
          className="font-semibold text-kleep-blue hover:underline"
        >
          {row.nombre}
        </Link>
      ),
    },
    { header: 'Localidad', cell: (row) => row.localidad ?? '-' },
    { header: 'Cotizaciones', cell: (row) => row.total_cotizaciones ?? 0 },
    { header: 'Facturas', cell: (row) => row.total_facturas ?? 0 },
    {
      header: 'Credito',
      cell: (row) => row.limite_credito ?? row.limiteCredito ?? '-',
    },
  ]

  if (!userId) {
    return (
      <EmptyState
        title="Usuario no encontrado"
        description="La ruta no incluye un identificador de usuario valido."
      />
    )
  }

  if (usuario.isLoading) {
    return (
      <div className="grid gap-5">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (usuario.isError || !usuario.data) {
    return (
      <EmptyState
        title="No pudimos cargar este usuario"
        description="Revisa el identificador o intenta volver al listado."
        action={
          <Link to="/usuarios" className={secondaryLinkClass}>
            <ArrowLeft className="h-4 w-4" />
            Volver a usuarios
          </Link>
        }
      />
    )
  }

  const data = usuario.data
  const fullName = getFullName(data) || display(data.id ?? userId, 'Usuario')
  const position = data.posicion_nombre ?? data.posicion ?? data.posicion_id
  const region = data.region_nombre ?? data.region ?? data.regionId

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/usuarios" className={secondaryLinkClass}>
          <ArrowLeft className="h-4 w-4" />
          Usuarios
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-black/5 bg-white p-5 lg:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-md bg-kleep-blue text-xl font-black text-white">
                  {fullName.slice(0, 1).toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                  <UserRound className="h-3.5 w-3.5" />
                  Usuario activo
                </span>
              </div>
              <h1 className="mt-4 break-words text-2xl font-black text-kleep-ink lg:text-3xl">
                {fullName}
              </h1>
              <p className="mt-2 flex max-w-3xl items-start gap-2 text-sm font-medium text-slate-500">
                <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-kleep-blue" />
                <span>{display(position)}</span>
              </p>
            </div>

            <div className="grid min-w-60 gap-2 rounded-lg border border-kleep-blue/10 bg-[#f7f9ff] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Region
              </p>
              <p className="text-2xl font-black capitalize text-kleep-ink">
                {display(region)}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Usuario #{display(data.id ?? userId)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-4 lg:p-7">
          <InfoItem label="Usuario ID" value={data.id ?? userId} />
          <InfoItem label="Posicion ID" value={data.posicion_id ?? data.posicionId} />
          <InfoItem label="Region ID" value={data.regionId} />
          <InfoItem label="Correo" value={data.correo} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Users}
          label="Clientes asignados"
          value={assignedCustomers.length}
          detail="Filtrados por ejecutivo"
          tone="bg-violet-50 text-violet-700"
        />
        <StatCard
          icon={FileText}
          label="Cotizaciones"
          value={totals.cotizaciones}
          detail="Suma de sus clientes"
          tone="bg-amber-50 text-amber-700"
        />
        <StatCard
          icon={ReceiptText}
          label="Facturas"
          value={totals.facturas}
          detail="Suma de sus clientes"
          tone="bg-sky-50 text-sky-700"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-5 lg:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-kleep-soft text-kleep-blue">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-kleep-ink">Contacto</h2>
              <p className="text-sm text-slate-500">
                Datos directos para seguimiento operativo.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-5">
            <InfoItem label="Correo" value={data.correo} icon={Mail} />
            <InfoItem label="Telefono" value={data.telefono} icon={Phone} />
            <InfoItem label="Region" value={region} icon={MapPin} />
          </div>
        </Card>

        <Card className="p-5 lg:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-kleep-soft text-kleep-blue">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-kleep-ink">
                Perfil operativo
              </h2>
              <p className="text-sm text-slate-500">
                Puesto, identificadores y alcance dentro del equipo.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <InfoItem label="Nombre" value={data.nombre} />
            <InfoItem label="Apellido" value={data.apellido} />
            <InfoItem label="Posicion" value={position} />
            <InfoItem label="Region" value={region} />
          </div>
        </Card>
      </div>

      <section className="grid gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-kleep-soft text-kleep-blue">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-black text-kleep-ink">
              Clientes asignados
            </h2>
            <p className="text-sm text-slate-500">
              Registros encontrados para este ejecutivo.
            </p>
          </div>
        </div>
        <DataTable
          data={assignedCustomers}
          columns={customerColumns}
          isLoading={clientes.isLoading}
          emptyTitle="Sin clientes asignados"
        />
      </section>
    </>
  )
}
