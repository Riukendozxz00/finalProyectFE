import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  useCrearCuentaCredito,
  useCrearCuentaCreditoPorCliente,
  useCuentasCredito,
  useEliminarCuentaCredito,
  useModificarCuentaCredito,
} from '../api'
import type { CuentaCredito } from '../types'
import { permissions } from '@/features/auth/permissions'
import { useSessionStore } from '@/features/auth/session'
import { useClientesOptions } from '@/features/clientes/api'
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
import { getRecordId } from '@/shared/utils/records'

const PAGE_SIZE = 10

const cuentaSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente requerido'),
  limite_credito: z.string().min(1, 'Limite requerido'),
})

type CuentaForm = z.infer<typeof cuentaSchema>

export function CuentasCreditoPage() {
  const currentUser = useSessionStore((state) => state.user)
  const can = useSessionStore((state) => state.can)
  const idUsuario = currentUser?.id ?? ''
  const { showToast } = useToast()
  const [clienteId, setClienteId] = useState('')
  const [activeClienteId, setActiveClienteId] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<CuentaCredito | null>(null)
  const [deleteId, setDeleteId] = useState<string>()

  const cuentas = useCuentasCredito(idUsuario, activeClienteId)
  const crear = useCrearCuentaCredito(idUsuario)
  const crearPorCliente = useCrearCuentaCreditoPorCliente(idUsuario, activeClienteId)
  const modificar = useModificarCuentaCredito(idUsuario)
  const eliminar = useEliminarCuentaCredito(idUsuario)
  const clientesOptions = useClientesOptions(idUsuario)
  const canCreate = can(permissions.cuentasCredito.create)
  const canUpdate = can(permissions.cuentasCredito.update)
  const canDelete = can(permissions.cuentasCredito.delete)

  const form = useForm<CuentaForm>({
    resolver: zodResolver(cuentaSchema),
    defaultValues: { cliente_id: '', limite_credito: '' },
  })

  const pageRows = useMemo(
    () => paginate(cuentas.data ?? [], page, PAGE_SIZE),
    [cuentas.data, page],
  )

  const columns: Array<Column<CuentaCredito>> = [
    { header: 'Cuenta de credito', cell: (row) => getRecordId(row) },
    { header: 'Cliente ID', cell: (row) => row.cliente_id ?? row.clienteId ?? '-' },
    {
      header: 'Limite credito',
      cell: (row) => row.limite_credito ?? row.limiteCredito ?? '-',
    },
    {
      header: 'Acciones',
      cell: (row) => {
        const id = getRecordId(row)
        return (
          <div className="flex flex-wrap gap-2">
            {canUpdate ? (
              <Button
                variant="secondary"
                className="min-h-8 px-3"
                onClick={() => {
                  setEditing(row)
                  form.reset({
                    cliente_id: String(row.cliente_id ?? row.clienteId ?? activeClienteId),
                    limite_credito: String(row.limite_credito ?? row.limiteCredito ?? ''),
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
    setEditing({ cliente_id: Number(activeClienteId), limite_credito: 0 })
    form.reset({ cliente_id: activeClienteId, limite_credito: '' })
  }

  function closeForm() {
    setEditing(null)
    form.reset()
  }

  function onSubmit(values: CuentaForm) {
    if (!editing) return
    const id = getRecordId(editing)
    const payload = {
      cliente_id: Number(values.cliente_id),
      limite_credito: Number(values.limite_credito),
    }
    const request = id
      ? modificar.mutateAsync({ cuentaCreditoId: id, payload })
      : activeClienteId
        ? crearPorCliente.mutateAsync({ limite_credito: payload.limite_credito })
        : crear.mutateAsync(payload)

    request
      .then(() => {
        showToast({
          title: id ? 'Cuenta actualizada' : 'Cuenta creada',
          variant: 'success',
        })
        setActiveClienteId(String(values.cliente_id))
        closeForm()
      })
      .catch((error: unknown) => {
        showToast({
          title: 'Error en cuenta de credito',
          description: getMessageFromUnknown(error),
          variant: 'error',
        })
      })
  }

  return (
    <>
      <PageHeader
        title="Cuentas de credito"
        description="Alta, edicion de limite, listado por cliente y eliminacion."
        actions={
          canCreate ? (
            <Button onClick={openCreate} disabled={!activeClienteId}>
              <Plus className="h-4 w-4" />
              Nueva cuenta
            </Button>
          ) : null
        }
      />

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

      <DataTable
        data={pageRows}
        columns={columns}
        isLoading={cuentas.isLoading}
        emptyTitle="Sin cuentas de credito"
      />
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={cuentas.data?.length ?? 0}
        onPageChange={setPage}
      />

      <Modal
        open={Boolean(editing)}
        title={getRecordId(editing ?? {}) ? 'Editar cuenta' : 'Nueva cuenta'}
        onClose={closeForm}
      >
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
          <Input
            label="Limite credito"
            type="number"
            step="0.01"
            {...form.register('limite_credito')}
            error={form.formState.errors.limite_credito?.message}
          />
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

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Eliminar cuenta de credito"
        description="Esta accion elimina la cuenta de credito seleccionada."
        confirmLabel="Eliminar"
        isLoading={eliminar.isPending}
        onCancel={() => setDeleteId(undefined)}
        onConfirm={() => {
          if (!deleteId) return
          eliminar
            .mutateAsync(deleteId)
            .then(() => {
              showToast({ title: 'Cuenta eliminada', variant: 'success' })
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
    </>
  )
}
