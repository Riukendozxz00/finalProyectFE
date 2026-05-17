import { ArrowLeft, FileText, ReceiptText } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useBaseDocumentos } from '../api'
import type { Base } from '../types'
import { useSessionStore } from '@/features/auth/session'
import { useClientesOptions } from '@/features/clientes/api'
import type { Cotizacion } from '@/features/cotizaciones/types'
import type { Factura } from '@/features/facturas/types'
import { useUsuariosOptions } from '@/features/usuarios/api'
import { Card } from '@/shared/ui/card'
import { DataTable, type Column } from '@/shared/ui/table'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { getRecordId } from '@/shared/utils/records'

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

function getClienteId(base?: Base) {
  return base?.cliente_id ?? base?.clienteId
}

function getEjecutivoId(base?: Base) {
  return base?.ejecutivo_id ?? base?.ejecutivoId
}

function InfoItem({ label, value }: { label: string; value: unknown }) {
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

export function BaseProfilePage() {
  const { baseId = '' } = useParams()
  const currentUser = useSessionStore((state) => state.user)
  const idUsuario = currentUser?.id ?? ''

  const documentos = useBaseDocumentos(idUsuario, baseId)
  const clientesOptions = useClientesOptions(idUsuario)
  const usuariosOptions = useUsuariosOptions(idUsuario)
  const data = documentos.data
  const base = data?.base
  const clienteId = String(getClienteId(base) ?? '')
  const ejecutivoId = String(getEjecutivoId(base) ?? '')
  const cotizaciones = data?.cotizaciones ?? []
  const facturas = data?.facturas ?? []

  const clienteNombre = useMemo(() => {
    const record = (base ?? {}) as Record<string, unknown>
    return (
      base?.cliente_nombre ??
      base?.clienteNombre ??
      record.nombre_cliente ??
      record.cliente ??
      clientesOptions.data?.find((option) => option.value === clienteId)?.cliente.nombre
    )
  }, [base, clienteId, clientesOptions.data])

  const ejecutivoNombre = useMemo(() => {
    const record = (base ?? {}) as Record<string, unknown>
    const option = usuariosOptions.data?.find((entry) => entry.value === ejecutivoId)
    const optionName =
      option &&
      `${option.usuario.nombre ?? ''} ${option.usuario.apellido ?? ''}`.trim()

    return (
      base?.ejecutivo_nombre ??
      base?.ejecutivoNombre ??
      record.nombre_ejecutivo ??
      record.ejecutivo ??
      optionName ??
      option?.label
    )
  }, [base, ejecutivoId, usuariosOptions.data])

  const cotizacionesSubtotal = cotizaciones.reduce(
    (total, cotizacion) => total + Number(cotizacion.subtotal ?? 0),
    0,
  )
  const facturasSubtotal = facturas.reduce(
    (total, factura) => total + Number(factura.subtotal ?? 0),
    0,
  )

  const cotizacionesColumns: Array<Column<Cotizacion>> = [
    { header: 'ID', cell: (row) => getRecordId(row) },
    { header: 'Folio', cell: (row) => row.folio ?? '-' },
    { header: 'Subtotal', cell: (row) => formatMoney(row.subtotal) },
    { header: 'Cuenta credito', cell: (row) => row.cta_credito_id ?? '-' },
    {
      header: 'Ejecutivo',
      cell: (row) => row.ejecutivo_nombre ?? row.ejecutivo_id ?? '-',
    },
  ]
  const facturasColumns: Array<Column<Factura>> = [
    { header: 'ID', cell: (row) => getRecordId(row) },
    { header: 'Folio', cell: (row) => row.folio ?? '-' },
    { header: 'Subtotal', cell: (row) => formatMoney(row.subtotal) },
    { header: 'Cuenta credito', cell: (row) => row.cta_credito_id ?? '-' },
    { header: 'Cotizacion', cell: (row) => row.cotizacion_id ?? '-' },
    {
      header: 'Ejecutivo',
      cell: (row) => row.ejecutivo_nombre ?? row.ejecutivo_id ?? '-',
    },
  ]

  if (!baseId) {
    return <EmptyState title="Base no encontrada" />
  }

  if (documentos.isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (documentos.isError || !base) {
    return (
      <EmptyState
        title="No pudimos cargar esta base"
        description="Revisa que el identificador de la base exista."
      />
    )
  }

  return (
    <>
      <PageHeader
        title={`Base #${baseId}`}
        description="Caratula de la base, datos comerciales y documentos relacionados."
        actions={
          <>
            <Link to="/bases" className={secondaryLinkClass}>
              <ArrowLeft className="h-4 w-4" />
              Bases
            </Link>
            {clienteId ? (
              <>
                <Link to={`/clientes/${clienteId}`} className={secondaryLinkClass}>
                  Cliente
                </Link>
                <Link to={`/clientes/${clienteId}/quotes`} className={secondaryLinkClass}>
                  <FileText className="h-4 w-4" />
                  Cotizaciones
                </Link>
                <Link to={`/clientes/${clienteId}/bills`} className={secondaryLinkClass}>
                  <ReceiptText className="h-4 w-4" />
                  Facturas
                </Link>
              </>
            ) : null}
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="grid gap-5 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-kleep-blue">
              Informacion general
            </p>
            <h2 className="mt-1 text-xl font-black text-kleep-ink">
              {display(base.localidad, 'Base comercial')}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <InfoItem label="Numero de base" value={baseId} />
            <InfoItem label="Cliente" value={clienteNombre ?? clienteId} />
            <InfoItem label="Cliente ID" value={clienteId} />
            <InfoItem label="Ejecutivo" value={ejecutivoNombre ?? ejecutivoId} />
            <InfoItem label="Ejecutivo ID" value={ejecutivoId} />
            <InfoItem label="Localidad" value={base.localidad} />
            <InfoItem label="Direccion" value={base.direccion} />
          </div>
        </Card>

        <Card className="grid gap-4 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Resumen del periodo
          </p>
          <div className="grid gap-3">
            <InfoItem label="Fecha inicio" value={data?.fechaInicio} />
            <InfoItem label="Fecha fin" value={data?.fechaFin} />
            <InfoItem label="Cotizaciones" value={cotizaciones.length} />
            <InfoItem label="Subtotal cotizado" value={formatMoney(cotizacionesSubtotal)} />
            <InfoItem label="Facturas" value={facturas.length} />
            <InfoItem label="Subtotal facturado" value={formatMoney(facturasSubtotal)} />
          </div>
        </Card>
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-2">
        <Card className="grid content-start gap-3 p-4">
          <h2 className="text-base font-bold text-kleep-ink">Cotizaciones</h2>
          <DataTable
            data={cotizaciones}
            columns={cotizacionesColumns}
            isLoading={documentos.isLoading}
            emptyTitle="Sin cotizaciones"
          />
        </Card>
        <Card className="grid content-start gap-3 p-4">
          <h2 className="text-base font-bold text-kleep-ink">Facturas</h2>
          <DataTable
            data={facturas}
            columns={facturasColumns}
            isLoading={documentos.isLoading}
            emptyTitle="Sin facturas"
          />
        </Card>
      </section>
    </>
  )
}
