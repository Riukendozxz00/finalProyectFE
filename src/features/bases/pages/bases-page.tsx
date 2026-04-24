import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  useBaseDetalle,
  useBases,
  useCrearBase,
  useCrearBasePorCliente,
  useEliminarBase,
  useModificarBase,
} from '../api'
import type { Base } from '../types'
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
import { Textarea } from '@/shared/ui/textarea'
import { useToast } from '@/shared/ui/use-toast'
import { paginate } from '@/shared/utils/pagination'
import { emptyToNull, getRecordId } from '@/shared/utils/records'

const PAGE_SIZE = 10

const baseSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente requerido'),
  ejecutivo_id: z.string().optional(),
  direccion: z.string().optional(),
  localidad: z.string().optional(),
})

type BaseForm = z.infer<typeof baseSchema>

export function BasesPage() {
  const currentUser = useSessionStore((state) => state.user)
  const idUsuario = currentUser?.id ?? ''
  const { showToast } = useToast()
  const [clienteId, setClienteId] = useState('')
  const [activeClienteId, setActiveClienteId] = useState<string>()
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Base | null>(null)
  const [detailId, setDetailId] = useState<string>()
  const [deleteId, setDeleteId] = useState<string>()

  const bases = useBases(idUsuario, activeClienteId)
  const detalle = useBaseDetalle(idUsuario, detailId)
  const crear = useCrearBase(idUsuario)
  const crearPorCliente = useCrearBasePorCliente(idUsuario, activeClienteId)
  const modificar = useModificarBase(idUsuario)
  const eliminar = useEliminarBase(idUsuario)
  const clientesOptions = useClientesOptions(idUsuario)
  const usuariosOptions = useUsuariosOptions(idUsuario)

  const form = useForm<BaseForm>({
    resolver: zodResolver(baseSchema),
    defaultValues: { cliente_id: '', ejecutivo_id: '', direccion: '', localidad: '' },
  })

  const pageRows = useMemo(
    () => paginate(bases.data ?? [], page, PAGE_SIZE),
    [bases.data, page],
  )

  const columns: Array<Column<Base>> = [
    { header: 'ID', cell: (row) => getRecordId(row) },
    { header: 'Cliente ID', cell: (row) => row.cliente_id ?? row.clienteId ?? '-' },
    { header: 'Ejecutivo ID', cell: (row) => row.ejecutivo_id ?? row.ejecutivoId ?? '-' },
    { header: 'Direccion', cell: (row) => row.direccion ?? '-' },
    { header: 'Localidad', cell: (row) => row.localidad ?? '-' },
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
                  cliente_id: String(row.cliente_id ?? row.clienteId ?? ''),
                  ejecutivo_id: String(row.ejecutivo_id ?? row.ejecutivoId ?? ''),
                  direccion: row.direccion ?? '',
                  localidad: row.localidad ?? '',
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
    setEditing({ cliente_id: activeClienteId ? Number(activeClienteId) : 0 })
    form.reset({
      cliente_id: activeClienteId ?? '',
      ejecutivo_id: '',
      direccion: '',
      localidad: '',
    })
  }

  function closeForm() {
    setEditing(null)
    form.reset()
  }

  function onSubmit(values: BaseForm) {
    if (!editing) return
    const id = getRecordId(editing)
    const payload = {
      cliente_id: Number(values.cliente_id),
      ejecutivo_id: values.ejecutivo_id ? Number(values.ejecutivo_id) : null,
      direccion: emptyToNull(values.direccion),
      localidad: emptyToNull(values.localidad),
    }
    const request = id
      ? modificar.mutateAsync({ baseId: id, payload })
      : activeClienteId
        ? crearPorCliente.mutateAsync({
            ejecutivo_id: payload.ejecutivo_id,
            direccion: payload.direccion,
            localidad: payload.localidad,
          })
        : crear.mutateAsync(payload)

    request
      .then(() => {
        showToast({ title: id ? 'Base actualizada' : 'Base creada', variant: 'success' })
        closeForm()
      })
      .catch((error: unknown) => {
        showToast({
          title: 'Error en bases',
          description: getMessageFromUnknown(error),
          variant: 'error',
        })
      })
  }

  return (
    <>
      <PageHeader
        title="Bases"
        description="Listado con filtro opcional por cliente, alta, edicion y detalle."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nueva base
          </Button>
        }
      />

      <Card className="p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault()
            setActiveClienteId(clienteId || undefined)
            setPage(1)
          }}
        >
          <Select
            label="Cliente opcional"
            value={clienteId}
            onChange={(event) => setClienteId(event.target.value)}
          >
            <option value="">Todos los clientes</option>
            {clientesOptions.data?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button type="submit">
            <Search className="h-4 w-4" />
            Filtrar
          </Button>
        </form>
      </Card>

      {bases.error ? (
        <Card className="border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">No se pudieron cargar las bases</p>
          <p className="mt-1 text-sm text-red-600">
            {getMessageFromUnknown(bases.error)}
          </p>
        </Card>
      ) : null}

      <DataTable
        data={pageRows}
        columns={columns}
        isLoading={bases.isLoading}
        emptyTitle="Sin bases"
      />
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={bases.data?.length ?? 0}
        onPageChange={setPage}
      />

      <Modal
        open={Boolean(editing)}
        title={getRecordId(editing ?? {}) ? 'Editar base' : 'Nueva base'}
        onClose={closeForm}
      >
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Cliente"
              {...form.register('cliente_id')}
              error={form.formState.errors.cliente_id?.message}
            >
              <option value="">Selecciona cliente</option>
              {clientesOptions.data?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select label="Ejecutivo" {...form.register('ejecutivo_id')}>
              <option value="">Sin ejecutivo</option>
              {usuariosOptions.data?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <Textarea label="Direccion" {...form.register('direccion')} />
          <Input label="Localidad" {...form.register('localidad')} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={closeForm}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={
                crear.isPending || crearPorCliente.isPending || modificar.isPending
              }
            >
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(detailId)}
        title="Detalle de base"
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
        title="Eliminar base"
        description="Esta accion elimina la base seleccionada."
        confirmLabel="Eliminar"
        isLoading={eliminar.isPending}
        onCancel={() => setDeleteId(undefined)}
        onConfirm={() => {
          if (!deleteId) return
          eliminar
            .mutateAsync(deleteId)
            .then(() => {
              showToast({ title: 'Base eliminada', variant: 'success' })
              setDeleteId(undefined)
            })
            .catch((error: unknown) => {
              showToast({
                title: 'Error al eliminar base',
                description: getMessageFromUnknown(error),
                variant: 'error',
              })
            })
        }}
      />
    </>
  )
}
