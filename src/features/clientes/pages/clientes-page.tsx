import { zodResolver } from '@hookform/resolvers/zod'
import { RotateCcw, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import {
  useClientes,
  useCrearCliente,
  useEliminarCliente,
  useModificarCliente,
  useReactivarCliente,
} from '../api'
import type { Cliente, ClienteFilters } from '../types'
import { permissions } from '@/features/auth/permissions'
import { useSessionStore } from '@/features/auth/session'
import { getMessageFromUnknown } from '@/shared/api/response'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { DataTable, type Column } from '@/shared/ui/table'
import { Input } from '@/shared/ui/input'
import { Modal } from '@/shared/ui/modal'
import { PageHeader } from '@/shared/ui/page-header'
import { Pagination } from '@/shared/ui/pagination'
import { Textarea } from '@/shared/ui/textarea'
import { useToast } from '@/shared/ui/use-toast'
import {
  emptyToNull,
  emptyToUndefined,
  getRecordId,
  removeUndefined,
} from '@/shared/utils/records'
import { paginate } from '@/shared/utils/pagination'

const PAGE_SIZE = 10

function getClienteStatusLabel(cliente: Cliente) {
  const record = cliente as Record<string, unknown>
  const description =
    cliente.status_descripcion ??
    cliente.statusDescripcion ??
    record.estatus_descripcion ??
    record.descripcion_status ??
    record.statusDescription

  if (description !== undefined && description !== null && String(description).trim()) {
    return String(description)
  }

  const rawStatus = cliente.status ?? record.estatus ?? record.statusId
  if (rawStatus === undefined || rawStatus === null || rawStatus === '') return '-'

  const status = String(rawStatus)
  if (status === '0') return 'Inactivo'
  if (status === '1') return 'Activo'
  return status
}

function ClienteStatusBadge({ cliente }: { cliente: Cliente }) {
  const label = getClienteStatusLabel(cliente)
  const normalized = label.toLowerCase()
  const tone =
    normalized === 'activo'
      ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
      : normalized === 'inactivo'
        ? 'border-red-100 bg-red-50 text-red-700'
        : 'border-slate-200 bg-slate-50 text-slate-600'
  const dot =
    normalized === 'activo'
      ? 'bg-emerald-500'
      : normalized === 'inactivo'
        ? 'bg-red-500'
        : 'bg-slate-400'

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

const filterSchema = z.object({
  nombre: z.string().optional(),
  direccion: z.string().optional(),
  localidad: z.string().optional(),
  limiteCreditoMin: z.string().optional(),
  limiteCreditoMax: z.string().optional(),
  status: z.string().optional(),
})

const clienteSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  direccion: z.string().optional(),
})

type FilterForm = z.infer<typeof filterSchema>
type ClienteForm = z.infer<typeof clienteSchema>

export function ClientesPage() {
  const currentUser = useSessionStore((state) => state.user)
  const can = useSessionStore((state) => state.can)
  const idUsuario = currentUser?.id ?? ''
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ClienteFilters>({})
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [deleteId, setDeleteId] = useState<string>()
  const [reactivateId, setReactivateId] = useState<string>()

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: {},
  })
  const clienteForm = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { nombre: '', direccion: '' },
  })

  const clientes = useClientes(idUsuario, filters)
  const crear = useCrearCliente(idUsuario)
  const modificar = useModificarCliente(idUsuario)
  const eliminar = useEliminarCliente(idUsuario)
  const reactivar = useReactivarCliente(idUsuario)
  const canCreate = can(permissions.clientes.create)
  const canUpdate = can(permissions.clientes.update)
  const canDelete = can(permissions.clientes.delete)

  const pageRows = useMemo(
    () => paginate(clientes.data ?? [], page, PAGE_SIZE),
    [clientes.data, page],
  )

  const columns: Array<Column<Cliente>> = [
    { header: 'ID', cell: (row) => getRecordId(row) },
    { header: 'Nombre', cell: (row) => row.nombre },
    { header: 'Direccion', cell: (row) => row.direccion ?? '-' },
    { header: 'Localidad', cell: (row) => row.localidad ?? '-' },
    {
      header: 'Ejecutivo',
      cell: (row) => row.ejecutivo_nombre ?? row.ejecutivoId ?? '-',
    },
    { header: 'Posicion', cell: (row) => row.ejecutivo_posicion ?? '-' },
    { header: 'Region', cell: (row) => row.ejecutivo_region ?? '-' },
    {
      header: 'Limite',
      cell: (row) => row.limiteCredito ?? row.limite_credito ?? '-',
    },
    { header: 'Cotizaciones', cell: (row) => row.total_cotizaciones ?? 0 },
    { header: 'Facturas', cell: (row) => row.total_facturas ?? 0 },
    { header: 'Status', cell: (row) => <ClienteStatusBadge cliente={row} /> },
    {
      header: 'Acciones',
      cell: (row) => {
        const id = getRecordId(row)
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="min-h-8 px-3"
              onClick={() => navigate(`/clientes/${id}`)}
            >
              Ver
            </Button>
            {canUpdate ? (
              <Button
                variant="secondary"
                className="min-h-8 px-3"
                onClick={() => {
                  setEditing(row)
                  clienteForm.reset({
                    nombre: row.nombre ?? '',
                    direccion: row.direccion ?? '',
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
            {canUpdate && String(row.status ?? '1') === '0' ? (
              <Button
                variant="secondary"
                className="min-h-8 px-3"
                onClick={() => setReactivateId(id)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        )
      },
    },
  ]

  function onFilterSubmit(values: FilterForm) {
    setPage(1)
    setFilters(
      removeUndefined({
        nombre: emptyToUndefined(values.nombre ?? ''),
        direccion: emptyToUndefined(values.direccion ?? ''),
        localidad: emptyToUndefined(values.localidad ?? ''),
        limiteCreditoMin: values.limiteCreditoMin
          ? Number(values.limiteCreditoMin)
          : undefined,
        limiteCreditoMax: values.limiteCreditoMax
          ? Number(values.limiteCreditoMax)
          : undefined,
        status: emptyToUndefined(values.status ?? ''),
      }),
    )
  }

  function openCreate() {
    setEditing({ nombre: '' })
    clienteForm.reset({ nombre: '', direccion: '' })
  }

  function closeForm() {
    setEditing(null)
    clienteForm.reset()
  }

  function onClienteSubmit(values: ClienteForm) {
    if (!editing) return
    const id = getRecordId(editing)
    const payload = {
      nombre: values.nombre,
      direccion: emptyToNull(values.direccion),
    }

    const mutation = id ? modificar : crear
    const request = id
      ? modificar.mutateAsync({ clienteId: id, payload })
      : crear.mutateAsync(payload)

    void request
      .then(() => {
        showToast({
          title: id ? 'Cliente actualizado' : 'Cliente creado',
          variant: 'success',
        })
        closeForm()
      })
      .catch((error: unknown) => {
        showToast({
          title: 'Error en clientes',
          description: getMessageFromUnknown(error),
          variant: 'error',
        })
      })

    void mutation
  }

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Listado con filtros, detalle, alta, edicion y eliminacion logica."
        actions={
          canCreate ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Nuevo cliente
            </Button>
          ) : null
        }
      />

      <Card className="p-4">
        <form
          className="grid gap-3 md:grid-cols-6"
          onSubmit={filterForm.handleSubmit(onFilterSubmit)}
        >
          <Input label="Nombre" {...filterForm.register('nombre')} />
          <Input label="Direccion" {...filterForm.register('direccion')} />
          <Input label="Localidad" {...filterForm.register('localidad')} />
          <Input
            label="Credito min"
            type="text"
            inputMode="decimal"
            step="0.01"
            {...filterForm.register('limiteCreditoMin')}
          />
          <Input
            label="Credito max"
            type="text"
            inputMode="decimal"
            step="0.01"
            {...filterForm.register('limiteCreditoMax')}
          />
          <Input label="Status" {...filterForm.register('status')} />
          <div className="md:col-span-6 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                filterForm.reset()
                setFilters({})
                setPage(1)
              }}
            >
              Limpiar
            </Button>
            <Button type="submit">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
        </form>
      </Card>

      <DataTable
        data={pageRows}
        columns={columns}
        isLoading={clientes.isLoading}
        emptyTitle="Sin clientes"
      />
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={clientes.data?.length ?? 0}
        onPageChange={setPage}
      />

      <Modal
        open={Boolean(editing)}
        title={getRecordId(editing ?? {}) ? 'Editar cliente' : 'Nuevo cliente'}
        onClose={closeForm}
      >
        <form className="grid gap-4" onSubmit={clienteForm.handleSubmit(onClienteSubmit)}>
          <Input
            label="Nombre"
            {...clienteForm.register('nombre')}
            error={clienteForm.formState.errors.nombre?.message}
          />
          <Textarea label="Direccion" {...clienteForm.register('direccion')} />
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
        title="Eliminar cliente"
        description="Esta accion ejecuta la eliminacion logica del cliente."
        confirmLabel="Eliminar"
        isLoading={eliminar.isPending}
        onCancel={() => setDeleteId(undefined)}
        onConfirm={() => {
          if (!deleteId) return
          eliminar
            .mutateAsync(deleteId)
            .then(() => {
              showToast({ title: 'Cliente eliminado', variant: 'success' })
              setDeleteId(undefined)
            })
            .catch((error: unknown) => {
              showToast({
                title: 'Error al eliminar',
                description: getMessageFromUnknown(error),
                variant: 'error',
              })
            })
        }}
      />
      <ConfirmDialog
        open={Boolean(reactivateId)}
        title="Reactivar cliente"
        description="Esta accion vuelve a activar el cliente seleccionado."
        confirmLabel="Reactivar"
        isLoading={reactivar.isPending}
        onCancel={() => setReactivateId(undefined)}
        onConfirm={() => {
          if (!reactivateId) return
          reactivar
            .mutateAsync(reactivateId)
            .then(() => {
              showToast({ title: 'Cliente reactivado', variant: 'success' })
              setReactivateId(undefined)
            })
            .catch((error: unknown) => {
              showToast({
                title: 'Error al reactivar',
                description: getMessageFromUnknown(error),
                variant: 'error',
              })
            })
        }}
      />
    </>
  )
}
