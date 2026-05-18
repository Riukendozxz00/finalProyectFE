import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Download, Plus, Search, Trash2 } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import {
  getFacturaDetalle,
  useCrearFactura,
  useEliminarFactura,
  useFacturas,
  useModificarFactura,
} from '../api'
import type { Factura } from '../types'
import { permissions } from '@/features/auth/permissions'
import { useSessionStore } from '@/features/auth/session'
import { useClientesOptions } from '@/features/clientes/api'
import { useUsuariosOptions } from '@/features/usuarios/api'
import { getMessageFromUnknown } from '@/shared/api/response'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { DataTable, type Column } from '@/shared/ui/table'
import { Input } from '@/shared/ui/input'
import { Modal } from '@/shared/ui/modal'
import { PageHeader } from '@/shared/ui/page-header'
import { Pagination } from '@/shared/ui/pagination'
import { Select } from '@/shared/ui/select'
import { useToast } from '@/shared/ui/use-toast'
import { paginate } from '@/shared/utils/pagination'
import { emptyToNull, getRecordId } from '@/shared/utils/records'

const PAGE_SIZE = 10

const facturaSchema = z
  .object({
    folio: z.string().optional(),
    subtotal: z.string().min(1, 'Subtotal requerido'),
    cta_credito_id: z.string().optional(),
    ejecutivo_id: z.string().optional(),
    cotizacion_id: z.string().optional(),
  })
  .refine((value) => Boolean(value.cta_credito_id || value.cotizacion_id), {
    message: 'Selecciona cuenta de credito o cotizacion',
    path: ['cta_credito_id'],
  })

type FacturaForm = z.infer<typeof facturaSchema>

function formatMoney(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return String(value)

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(numericValue)
}

function display(value: unknown, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function addRows(
  doc: jsPDF,
  rows: Array<[string, unknown]>,
  startY: number,
  left = 18,
) {
  let y = startY
  const labelWidth = 48
  const valueWidth = 126

  rows.forEach(([label, value], index) => {
    const rawValue = display(value)
    const lines = doc.splitTextToSize(rawValue, valueWidth)
    const rowHeight = Math.max(10, lines.length * 5 + 5)

    if (y + rowHeight > 270) {
      doc.addPage()
      y = 20
    }

    doc.setFillColor(index % 2 === 0 ? 248 : 255, index % 2 === 0 ? 250 : 255, 252)
    doc.rect(left, y, 174, rowHeight, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.rect(left, y, 174, rowHeight)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text(label, left + 4, y + 6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)
    doc.text(lines, left + labelWidth, y + 6.5)
    y += rowHeight
  })

  return y
}

function addSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(3, 54, 157)
  doc.text(title, 18, y)
  return y + 7
}

function downloadFacturaPdf({
  factura,
  facturaId,
  clienteId,
  clienteNombre,
  ejecutivoNombre,
}: {
  factura: Factura
  facturaId: string
  clienteId: string
  clienteNombre?: string
  ejecutivoNombre?: string
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const record = factura as Record<string, unknown>
  const issuedAt = new Date()
  const fileFolio = sanitizeFileName(String(factura.folio ?? facturaId))

  doc.setFillColor(3, 54, 157)
  doc.rect(0, 0, 216, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('KLEEP', 18, 13)
  doc.setFontSize(11)
  doc.text('Factura comercial', 18, 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Descargado: ${issuedAt.toLocaleString('es-MX')}`, 146, 13)

  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(`Factura #${facturaId}`, 18, 44)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Folio: ${display(factura.folio)}`, 18, 51)

  let y = 66
  y = addSectionTitle(doc, 'Datos principales', y)
  y = addRows(doc, [
    ['Factura ID', facturaId],
    ['Folio', factura.folio],
    ['Cliente', clienteNombre ?? clienteId],
    ['Cliente ID', clienteId],
    ['Ejecutivo', ejecutivoNombre ?? factura.ejecutivo_nombre ?? factura.ejecutivo_id],
    ['Ejecutivo ID', factura.ejecutivo_id],
    ['Cuenta credito', factura.cta_credito_id],
    ['Cotizacion', factura.cotizacion_id],
  ], y)

  y += 8
  y = addSectionTitle(doc, 'Importes', y)
  y = addRows(doc, [['Subtotal', formatMoney(factura.subtotal)]], y)

  const knownKeys = new Set([
    'id',
    'facturaId',
    'folio',
    'subtotal',
    'cta_credito_id',
    'ejecutivo_id',
    'cotizacion_id',
    'ejecutivo_nombre',
  ])
  const extraRows = Object.entries(record)
    .filter(([key, value]) => !knownKeys.has(key) && value !== undefined && value !== null)
    .map(([key, value]) => [key, value] as [string, unknown])

  if (extraRows.length) {
    y += 8
    y = addSectionTitle(doc, 'Datos adicionales', y)
    addRows(doc, extraRows, y)
  }

  const pageCount = doc.getNumberOfPages()
  for (let index = 1; index <= pageCount; index += 1) {
    doc.setPage(index)
    doc.setDrawColor(226, 232, 240)
    doc.line(18, 286, 198, 286)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(`Pagina ${index} de ${pageCount}`, 18, 292)
    doc.text('Documento generado desde KLEEP', 144, 292)
  }

  doc.save(`factura-${fileFolio}.pdf`)
}

export function FacturasPage() {
  const { clienteId: routeClienteId } = useParams()
  const currentUser = useSessionStore((state) => state.user)
  const can = useSessionStore((state) => state.can)
  const idUsuario = currentUser?.id ?? ''
  const { showToast } = useToast()
  const lockedClienteId = routeClienteId ?? ''
  const [clienteId, setClienteId] = useState(lockedClienteId)
  const [activeClienteId, setActiveClienteId] = useState(lockedClienteId)
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Factura | null>(null)
  const [deleteId, setDeleteId] = useState<string>()
  const [downloadingId, setDownloadingId] = useState<string>()

  const facturas = useFacturas(idUsuario, activeClienteId)
  const crear = useCrearFactura(idUsuario, activeClienteId)
  const modificar = useModificarFactura(idUsuario, activeClienteId)
  const eliminar = useEliminarFactura(idUsuario, activeClienteId)
  const clientesOptions = useClientesOptions(idUsuario)
  const usuariosOptions = useUsuariosOptions(idUsuario)
  const canCreate = can(permissions.facturas.create)
  const canUpdate = can(permissions.facturas.update)
  const canDelete = can(permissions.facturas.delete)

  const form = useForm<FacturaForm>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      folio: '',
      subtotal: '',
      cta_credito_id: '',
      ejecutivo_id: '',
      cotizacion_id: '',
    },
  })

  useEffect(() => {
    if (!lockedClienteId) return
    setClienteId(lockedClienteId)
    setActiveClienteId(lockedClienteId)
    setPage(1)
  }, [lockedClienteId])

  const pageRows = useMemo(
    () => paginate(facturas.data ?? [], page, PAGE_SIZE),
    [facturas.data, page],
  )

  const columns: Array<Column<Factura>> = [
    { header: 'Numero de factura', cell: (row) => getRecordId(row) },
    { header: 'Folio', cell: (row) => row.folio ?? '-' },
    { header: 'Subtotal', cell: (row) => row.subtotal ?? '-' },
    { header: 'Cuenta credito', cell: (row) => row.cta_credito_id ?? '-' },
    { header: 'Cotizacion', cell: (row) => row.cotizacion_id ?? '-' },
    {
      header: 'Ejecutivo',
      cell: (row) => row.ejecutivo_nombre ?? row.ejecutivo_id ?? '-',
    },
    {
      header: 'Acciones',
      cell: (row) => {
        const id = getRecordId(row)
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="min-h-8 px-3"
              isLoading={downloadingId === id}
              onClick={() => void downloadFactura(row)}
            >
              <Download className="h-4 w-4" />
              Descargar
            </Button>
            {canUpdate ? (
              <Button
                variant="secondary"
                className="min-h-8 px-3"
                onClick={() => {
                  setEditing(row)
                  form.reset({
                    folio: row.folio ?? '',
                    subtotal: String(row.subtotal ?? ''),
                    cta_credito_id: String(row.cta_credito_id ?? ''),
                    ejecutivo_id: String(row.ejecutivo_id ?? ''),
                    cotizacion_id: String(row.cotizacion_id ?? ''),
                  })
                }}
              >
                Editar
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                variant="danger"
                className="min-h-8 px-3"
                onClick={() => setDeleteId(id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        )
      },
    },
  ]

  function openCreate() {
    setEditing({ subtotal: 0 })
    form.reset({
      folio: '',
      subtotal: '',
      cta_credito_id: '',
      ejecutivo_id: '',
      cotizacion_id: '',
    })
  }

  function closeForm() {
    setEditing(null)
    form.reset()
  }

  async function downloadFactura(row: Factura) {
    const facturaId = getRecordId(row)
    if (!activeClienteId || !facturaId) return

    setDownloadingId(facturaId)
    try {
      const detail = await getFacturaDetalle(idUsuario, activeClienteId, facturaId)
      const factura = { ...row, ...detail }
      const clienteNombre = clientesOptions.data?.find(
        (option) => option.value === activeClienteId,
      )?.cliente.nombre
      const ejecutivoId = String(factura.ejecutivo_id ?? '')
      const ejecutivoOption = usuariosOptions.data?.find(
        (option) => option.value === ejecutivoId,
      )
      const ejecutivoNombre =
        factura.ejecutivo_nombre ??
        (ejecutivoOption
          ? `${ejecutivoOption.usuario.nombre ?? ''} ${
              ejecutivoOption.usuario.apellido ?? ''
            }`.trim() || ejecutivoOption.label
          : undefined)

      downloadFacturaPdf({
        factura,
        facturaId,
        clienteId: activeClienteId,
        clienteNombre,
        ejecutivoNombre,
      })
    } catch (error: unknown) {
      showToast({
        title: 'No se pudo descargar',
        description: getMessageFromUnknown(error),
        variant: 'error',
      })
    } finally {
      setDownloadingId(undefined)
    }
  }

  function onSubmit(values: FacturaForm) {
    if (!editing) return
    const id = getRecordId(editing)
    const payload = {
      folio: emptyToNull(values.folio),
      subtotal: Number(values.subtotal),
      cta_credito_id: values.cta_credito_id ? Number(values.cta_credito_id) : null,
      ejecutivo_id: values.ejecutivo_id ? Number(values.ejecutivo_id) : null,
      cotizacion_id: values.cotizacion_id ? Number(values.cotizacion_id) : null,
    }
    const request = id
      ? modificar.mutateAsync({ facturaId: id, payload })
      : crear.mutateAsync(payload)

    request
      .then(() => {
        showToast({
          title: id ? 'Factura actualizada' : 'Factura creada',
          variant: 'success',
        })
        closeForm()
      })
      .catch((error: unknown) => {
        showToast({
          title: 'Error en facturas',
          description: getMessageFromUnknown(error),
          variant: 'error',
        })
      })
  }

  return (
    <>
      <PageHeader
        title={lockedClienteId ? 'Facturas del cliente' : 'Facturas'}
        description={
          lockedClienteId
            ? `Listado de facturas registradas para el cliente #${lockedClienteId}.`
            : 'Listado y captura de facturas por cliente.'
        }
        actions={
          <>
            {lockedClienteId ? (
              <Link
                to={`/clientes/${lockedClienteId}`}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 text-sm font-semibold text-kleep-ink transition hover:border-kleep-blue/30 hover:bg-kleep-soft"
              >
                <ArrowLeft className="h-4 w-4" />
                Perfil
              </Link>
            ) : null}
            {canCreate ? (
              <Button onClick={openCreate} disabled={!activeClienteId}>
                <Plus className="h-4 w-4" />
                Nueva factura
              </Button>
            ) : null}
          </>
        }
      />

      {!lockedClienteId ? (
        <Card className="p-4">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault()
              setActiveClienteId(clienteId)
              setPage(1)
            }}
          >
            <Select
              label="Cliente"
              value={clienteId}
              onChange={(event) => setClienteId(event.target.value)}
            >
              <option value="">Selecciona cliente</option>
              {clientesOptions.data?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Button type="submit">
              <Search className="h-4 w-4" />
              Consultar
            </Button>
          </form>
        </Card>
      ) : null}

      <DataTable
        data={pageRows}
        columns={columns}
        isLoading={facturas.isLoading}
        emptyTitle="Sin facturas"
      />
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={facturas.data?.length ?? 0}
        onPageChange={setPage}
      />

      <Modal
        open={Boolean(editing)}
        title={getRecordId(editing ?? {}) ? 'Editar factura' : 'Nueva factura'}
        onClose={closeForm}
      >
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Input label="Folio" {...form.register('folio')} />
          <Input
            label="Subtotal"
            type="number"
            step="0.01"
            {...form.register('subtotal')}
            error={form.formState.errors.subtotal?.message}
          />
          <Input
            label="Cuenta credito ID"
            type="number"
            {...form.register('cta_credito_id')}
            error={form.formState.errors.cta_credito_id?.message}
          />
          <Input
            label="Cotizacion ID"
            type="number"
            {...form.register('cotizacion_id')}
          />
          <Select label="Ejecutivo" {...form.register('ejecutivo_id')}>
            <option value="">Sin ejecutivo</option>
            {usuariosOptions.data?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={crear.isPending || modificar.isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Eliminar factura"
        description="Esta accion elimina la factura seleccionada."
        confirmLabel="Eliminar"
        isLoading={eliminar.isPending}
        onCancel={() => setDeleteId(undefined)}
        onConfirm={() => {
          if (!deleteId) return
          eliminar
            .mutateAsync(deleteId)
            .then(() => {
              showToast({ title: 'Factura eliminada', variant: 'success' })
              setDeleteId(undefined)
            })
            .catch((error: unknown) => {
              showToast({
                title: 'Error al eliminar factura',
                description: getMessageFromUnknown(error),
                variant: 'error',
              })
            })
        }}
      />
    </>
  )
}
