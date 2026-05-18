import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import {
  useCambiarPermiso,
  useCambiarTodosPermisos,
  useGruposPorUsuario,
  usePermisosPorGrupo,
  usePermisosPorGrupoPost,
  usePermisosPorPosicion,
  useTodosGrupos,
} from '../api'
import type { Grupo, Permiso, PermisoAccion } from '../types'
import { permissions } from '@/features/auth/permissions'
import { useSessionStore } from '@/features/auth/session'
import { getMessageFromUnknown } from '@/shared/api/response'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { DataTable, type Column } from '@/shared/ui/table'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { Select } from '@/shared/ui/select'
import { useToast } from '@/shared/ui/use-toast'
import { getDisplayName, getRecordId } from '@/shared/utils/records'

export function PermisosPage() {
  const currentUser = useSessionStore((state) => state.user)
  const can = useSessionStore((state) => state.can)
  const { showToast } = useToast()
  const [id, setId] = useState(currentUser?.id ?? '')
  const [empleadoId, setEmpleadoId] = useState(currentUser?.id ?? '')
  const [userId, setUserId] = useState(currentUser?.id ?? '')
  const [groupId, setGroupId] = useState('')
  const [RolAsignado, setRolAsignado] = useState(currentUser?.rol ?? '')
  const [permissionId, setPermissionId] = useState('')
  const [positionId, setPositionId] = useState(currentUser?.posicionId ?? '')
  const [accion, setAccion] = useState<PermisoAccion>('add')

  const gruposUsuario = useGruposPorUsuario(id)
  const gruposTodos = useTodosGrupos(empleadoId)
  const permisosGrupo = usePermisosPorGrupo(empleadoId, groupId)
  const permisosGrupoPost = usePermisosPorGrupoPost(userId, groupId)
  const permisosPosicion = usePermisosPorPosicion(empleadoId, groupId, positionId)
  const cambiarPermiso = useCambiarPermiso()
  const cambiarTodos = useCambiarTodosPermisos()
  const canAssign = can(permissions.permisos.assign)

  const groupColumns: Array<Column<Grupo>> = [
    { header: 'ID', cell: (row) => getRecordId(row) },
    { header: 'Grupo', cell: (row) => getDisplayName(row) },
    { header: 'Descripcion', cell: (row) => row.descripcion ?? '-' },
    {
      header: 'Acciones',
      cell: (row) => (
        <Button
          variant="secondary"
          className="min-h-8 px-3"
          onClick={() => setGroupId(getRecordId(row))}
        >
          Usar grupo
        </Button>
      ),
    },
  ]

  const permissionColumns: Array<Column<Permiso>> = [
    { header: 'ID', cell: (row) => getRecordId(row) },
    { header: 'Permiso', cell: (row) => getDisplayName(row) },
    {
      header: 'Asignado',
      cell: (row) => (row.asignado === undefined ? '-' : row.asignado ? 'Si' : 'No'),
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <Button
          variant="secondary"
          className="min-h-8 px-3"
          onClick={() => setPermissionId(getRecordId(row))}
        >
          Usar permiso
        </Button>
      ),
    },
  ]

  function runPermissionChange() {
    cambiarPermiso
      .mutateAsync({ asignador: empleadoId, groupId, RolAsignado, permissionId, accion })
      .then(() => {
        showToast({
          title: accion === 'add' ? 'Permiso agregado' : 'Permiso removido',
          variant: 'success',
        })
      })
      .catch((error: unknown) => {
        showToast({
          title: 'Error en permiso',
          description: getMessageFromUnknown(error),
          variant: 'error',
        })
      })
  }

  function runAllChange() {
    cambiarTodos
      .mutateAsync({ asignador: empleadoId, groupId, RolAsignado, accion })
      .then(() => {
        showToast({
          title: accion === 'add' ? 'Permisos agregados' : 'Permisos removidos',
          variant: 'success',
        })
      })
      .catch((error: unknown) => {
        showToast({
          title: 'Error en permisos',
          description: getMessageFromUnknown(error),
          variant: 'error',
        })
      })
  }

  return (
    <>
      <PageHeader
        title="Permisos / Menu"
        description="Grupos, permisos y asignacion por usuario, grupo y posicion."
      />

      <Card className="grid gap-4 p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Input label="id" value={id} onChange={(event) => setId(event.target.value)} />
          <Input
            label="empleadoId"
            value={empleadoId}
            onChange={(event) => setEmpleadoId(event.target.value)}
          />
          <Input
            label="userId"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
          <Input
            label="groupId"
            value={groupId}
            onChange={(event) => setGroupId(event.target.value)}
          />
          <Input
            label="RolAsignado"
            value={RolAsignado}
            onChange={(event) => setRolAsignado(event.target.value)}
          />
          <Input
            label="permissionId"
            value={permissionId}
            onChange={(event) => setPermissionId(event.target.value)}
          />
          <Input
            label="positionId"
            value={positionId}
            onChange={(event) => setPositionId(event.target.value)}
          />
          <Select
            label="accion"
            value={accion}
            onChange={(event) => setAccion(event.target.value as PermisoAccion)}
          >
            <option value="add">add</option>
            <option value="remove">remove</option>
          </Select>
        </div>
        {canAssign ? (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={runPermissionChange}
              disabled={!empleadoId || !groupId || !RolAsignado || !permissionId}
              isLoading={cambiarPermiso.isPending}
            >
              <ShieldCheck className="h-4 w-4" />
              Aplicar permiso
            </Button>
            <Button
              variant="secondary"
              onClick={runAllChange}
              disabled={!empleadoId || !groupId || !RolAsignado}
              isLoading={cambiarTodos.isPending}
            >
              Aplicar todos
            </Button>
          </div>
        ) : null}
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="grid gap-3 p-4">
          <h2 className="text-base font-bold text-kleep-ink">Menu/grupos por usuario</h2>
          <DataTable
            data={gruposUsuario.data ?? []}
            columns={groupColumns}
            isLoading={gruposUsuario.isLoading}
            emptyTitle="Sin grupos para usuario"
          />
        </Card>
        <Card className="grid gap-3 p-4">
          <h2 className="text-base font-bold text-kleep-ink">
            Todos los grupos autorizados
          </h2>
          <DataTable
            data={gruposTodos.data ?? []}
            columns={groupColumns}
            isLoading={gruposTodos.isLoading}
            emptyTitle="Sin grupos autorizados"
          />
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="grid gap-3 p-4">
          <h2 className="text-base font-bold text-kleep-ink">
            Permisos contenidos en grupo
          </h2>
          <DataTable
            data={permisosGrupo.data ?? []}
            columns={permissionColumns}
            isLoading={permisosGrupo.isLoading}
            emptyTitle="Sin permisos"
          />
        </Card>
        <Card className="grid gap-3 p-4">
          <h2 className="text-base font-bold text-kleep-ink">
            Permisos por usuario/grupo
          </h2>
          <DataTable
            data={permisosGrupoPost.data ?? []}
            columns={permissionColumns}
            isLoading={permisosGrupoPost.isLoading}
            emptyTitle="Sin permisos"
          />
        </Card>
        <Card className="grid gap-3 p-4">
          <h2 className="text-base font-bold text-kleep-ink">Permisos por posicion</h2>
          <DataTable
            data={permisosPosicion.data ?? []}
            columns={permissionColumns}
            isLoading={permisosPosicion.isLoading}
            emptyTitle="Sin permisos"
          />
        </Card>
      </section>
    </>
  )
}
