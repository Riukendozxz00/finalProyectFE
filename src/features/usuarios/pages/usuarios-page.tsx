import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import {
  useCrearUsuario,
  useEquipo,
  useModificarUsuario,
  useUsuarios,
} from '../api'
import type { Usuario, UsuarioEditableColumn } from '../types'
import { permissions } from '@/features/auth/permissions'
import { useSessionStore } from '@/features/auth/session'
import { getMessageFromUnknown } from '@/shared/api/response'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { DataTable, type Column } from '@/shared/ui/table'
import { Input } from '@/shared/ui/input'
import { Modal } from '@/shared/ui/modal'
import { PageHeader } from '@/shared/ui/page-header'
import { Pagination } from '@/shared/ui/pagination'
import { Select } from '@/shared/ui/select'
import { useToast } from '@/shared/ui/use-toast'
import { matchesSearch, paginate } from '@/shared/utils/pagination'
import { emptyToNull, getRecordId } from '@/shared/utils/records'

const PAGE_SIZE = 10

const posiciones = [
  { id: 2, nombre: 'Director Comercial' },
  { id: 1, nombre: 'Director General' },
  { id: 4, nombre: 'Ejecutivo de cuenta' },
  { id: 5, nombre: 'Ejecutivo de Cuenta Jr' },
  { id: 3, nombre: 'Gerente Regional' },
]

const regiones = [
  { id: 1, nombre: 'norte' },
  { id: 2, nombre: 'sur' },
  { id: 3, nombre: 'centro' },
]

const usuarioSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  posicion_id: z.string().min(1, 'Posicion requerida'),
  telefono: z.string().optional(),
  correo: z.union([z.literal(''), z.email('Correo invalido')]).optional(),
  regionId: z.string().min(1, 'Region requerida'),
})

const editSchema = z.object({
  idUsuario: z.string().min(1, 'Usuario requerido'),
  column: z.enum(['nombre', 'apellido', 'posicion_id', 'telefono', 'correo', 'regionId']),
  newValue: z.string().min(1, 'Nuevo valor requerido'),
})

type UsuarioForm = z.infer<typeof usuarioSchema>
type EditForm = z.infer<typeof editSchema>

export function UsuariosPage() {
  const currentUser = useSessionStore((state) => state.user)
  const can = useSessionStore((state) => state.can)
  const empleadoId = currentUser?.id ?? ''
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [showTeam, setShowTeam] = useState(false)

  const usuarios = useUsuarios(empleadoId)
  const equipo = useEquipo(empleadoId)
  const crear = useCrearUsuario(empleadoId)
  const modificar = useModificarUsuario(empleadoId)
  const canCreate = can(permissions.usuarios.create)
  const canUpdate = can(permissions.usuarios.update)

  const createForm = useForm<UsuarioForm>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      posicion_id: '',
      telefono: '',
      correo: '',
      regionId: '',
    },
  })
  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { column: 'nombre', newValue: '' },
  })

  const filteredRows = useMemo(
    () =>
      (showTeam ? (equipo.data ?? []) : (usuarios.data ?? [])).filter((row) =>
        matchesSearch(row, search, ['nombre', 'apellido', 'correo']),
      ),
    [equipo.data, search, showTeam, usuarios.data],
  )
  const pageRows = useMemo(
    () => paginate(filteredRows, page, PAGE_SIZE),
    [filteredRows, page],
  )

  const columns: Array<Column<Usuario>> = [
    { header: 'ID', cell: (row) => getRecordId(row) },
    {
      header: 'Nombre',
      cell: (row) => `${row.nombre ?? ''} ${row.apellido ?? ''}`.trim(),
    },
    { header: 'Correo', cell: (row) => row.correo ?? '-' },
    { header: 'Telefono', cell: (row) => row.telefono ?? '-' },
    {
      header: 'Region',
      cell: (row) => row.region_nombre ?? row.region ?? row.regionId ?? '-',
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
              onClick={() => navigate(`/usuarios/${id}`)}
            >
              Ver
            </Button>
            {canUpdate ? (
              <Button
                variant="secondary"
                className="min-h-8 px-3"
                onClick={() => {
                  editForm.reset({
                    idUsuario: id,
                    column: 'nombre',
                    newValue: String(row.nombre ?? ''),
                  })
                }}
              >
                Modificar
              </Button>
            ) : null}
          </div>
        )
      },
    },
  ]

  function onCreate(values: UsuarioForm) {
    crear
      .mutateAsync({
        nombre: values.nombre,
        apellido: values.apellido,
        posicion_id: Number(values.posicion_id),
        telefono: emptyToNull(values.telefono),
        correo: emptyToNull(values.correo),
        regionId: Number(values.regionId),
      })
      .then(() => {
        showToast({ title: 'Usuario creado', variant: 'success' })
        setShowCreate(false)
        createForm.reset()
      })
      .catch((error: unknown) => {
        showToast({
          title: 'Error al crear usuario',
          description: getMessageFromUnknown(error),
          variant: 'error',
        })
      })
  }

  function onEdit(values: EditForm) {
    const numericColumns: UsuarioEditableColumn[] = ['posicion_id', 'regionId']
    const column = values.column as UsuarioEditableColumn
    modificar
      .mutateAsync({
        idUsuario: Number(values.idUsuario),
        column,
        newValue: numericColumns.includes(column)
          ? Number(values.newValue)
          : values.newValue,
      })
      .then(() => {
        showToast({ title: 'Usuario actualizado', variant: 'success' })
        editForm.reset({ column: 'nombre', newValue: '' })
      })
      .catch((error: unknown) => {
        showToast({
          title: 'Error al modificar usuario',
          description: getMessageFromUnknown(error),
          variant: 'error',
        })
      })
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Alta, listado, detalle, mi equipo y modificacion por columna."
        actions={
          canCreate ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Nuevo usuario
            </Button>
          ) : null
        }
      />

      <Card className="grid gap-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <Input
            label="Buscar"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            rightSlot={<Search className="mt-1 h-4 w-4 text-slate-400" />}
          />
          <Button
            variant={showTeam ? 'primary' : 'secondary'}
            onClick={() => {
              setShowTeam((value) => !value)
              setPage(1)
            }}
          >
            {showTeam ? 'Viendo mi equipo' : 'Ver mi equipo'}
          </Button>
        </div>

        {canUpdate ? (
          <form
            className="grid gap-3 md:grid-cols-4"
            onSubmit={editForm.handleSubmit(onEdit)}
          >
            <Input
              label="ID usuario"
              type="number"
              {...editForm.register('idUsuario')}
              error={editForm.formState.errors.idUsuario?.message}
            />
            <Select label="Columna" {...editForm.register('column')}>
              <option value="nombre">nombre</option>
              <option value="apellido">apellido</option>
              <option value="posicion_id">posicion_id</option>
              <option value="telefono">telefono</option>
              <option value="correo">correo</option>
              <option value="regionId">regionId</option>
            </Select>
            <Input
              label="Nuevo valor"
              {...editForm.register('newValue')}
              error={editForm.formState.errors.newValue?.message}
            />
            <div className="flex items-end">
              <Button className="w-full" type="submit" isLoading={modificar.isPending}>
                Guardar cambio
              </Button>
            </div>
          </form>
        ) : null}
      </Card>

      <DataTable
        data={pageRows}
        columns={columns}
        isLoading={usuarios.isLoading || equipo.isLoading}
        emptyTitle="Sin usuarios"
      />
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={filteredRows.length}
        onPageChange={setPage}
      />

      <Modal
        open={showCreate}
        title="Alta de usuario"
        onClose={() => setShowCreate(false)}
      >
        <form className="grid gap-4" onSubmit={createForm.handleSubmit(onCreate)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre"
              {...createForm.register('nombre')}
              error={createForm.formState.errors.nombre?.message}
            />
            <Input
              label="Apellido"
              {...createForm.register('apellido')}
              error={createForm.formState.errors.apellido?.message}
            />
            <Select
              label="Posicion"
              {...createForm.register('posicion_id')}
              error={createForm.formState.errors.posicion_id?.message}
            >
              <option value="">Selecciona una posicion</option>
              {posiciones.map((posicion) => (
                <option key={posicion.id} value={posicion.id}>
                  {posicion.nombre}
                </option>
              ))}
            </Select>
            <Select
              label="Region"
              {...createForm.register('regionId')}
              error={createForm.formState.errors.regionId?.message}
            >
              <option value="">Selecciona una region</option>
              {regiones.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.nombre}
                </option>
              ))}
            </Select>
            <Input label="Telefono" {...createForm.register('telefono')} />
            <Input
              label="Correo"
              type="email"
              {...createForm.register('correo')}
              error={createForm.formState.errors.correo?.message}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowCreate(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={crear.isPending}>
              Crear
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
