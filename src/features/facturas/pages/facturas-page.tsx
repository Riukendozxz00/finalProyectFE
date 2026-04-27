import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import {
  useCrearFactura,
  useEliminarFactura,
  useFacturaDetalle,
  useFacturas,
  useModificarFactura,
} from '../api'
import type { Factura } from '../types'
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

export function FacturasPage() {
  const { clienteId: routeClienteId } = useParams()
  const currentUser = useSessionStore((state) => state.user)
  const idUsuario = currentUser?.id ?? ''
  const { showToast } = useToast()
  const lockedClienteId = routeClienteId ?? ''
  const [clienteId, setClienteId] = useState(lockedClienteId)
  const [activeClienteId, setActiveClienteId] = useState(lockedClienteId)
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Factura | null>(null)
  const [detailId, setDetailId] = useState<string>()
  const [deleteId, setDeleteId] = useState<string>()

  const facturas = useFacturas(idUsuario, activeClienteId)
  const detalle = useFacturaDetalle(idUsuario, activeClienteId, detailId)
  const crear = useCrearFactura(idUsuario, activeClienteId)
  const modificar = useModificarFactura(idUsuario, activeClienteId)
  const eliminar = useEliminarFactura(idUsuario, activeClienteId)
  const clientesOptions = useClientesOptions(idUsuario)
  const usuariosOptions = useUsuariosOptions(idUsuario)

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
    { header: 'ID', cell: (row) => getRecordId(row) },
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
              onClick={() => setDetailId(id)}
            >
              Ver
            </Button>
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
            <Button
              variant="danger"
              className="min-h-8 px-3"
              onClick={() => setDeleteId(id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
            <Button onClick={openCreate} disabled={!activeClienteId}>
              <Plus className="h-4 w-4" />
              Nueva factura
            </Button>
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
      <Modal
        open={Boolean(detailId)}
        title="Detalle de factura"
        onClose={() => setDetailId(undefined)}
      >
        {detalle.isLoading ? (
          <p className="text-sm text-slate-500">Cargando...</p>
        ) : (
          <pre className="overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-50">
            {JSON.stringify(detalle.data, null, 2)}
          </pre>
        )}
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
