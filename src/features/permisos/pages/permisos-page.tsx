import { Check, Circle, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  useCambiarPermisoPorNombre,
  usePermisosPanelPorPosicion,
} from '../api'
import type { PermisoAccion, PermisoPanel, Posicion } from '../types'
import { useSessionStore } from '@/features/auth/session'
import { getMessageFromUnknown } from '@/shared/api/response'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { useToast } from '@/shared/ui/use-toast'

const POSICIONES: Posicion[] = [
  { id: 1, nombre: 'Director General' },
  { id: 2, nombre: 'Director Comercial' },
  { id: 3, nombre: 'Gerente Regional' },
  { id: 4, nombre: 'Ejecutivo de cuenta' },
  { id: 5, nombre: 'Ejecutivo de Cuenta Jr' },
]

const PERMISSION_SECTIONS = [
  {
    groupName: 'Dashboard',
    permissionName: 'dashboad_ver',
    description: 'Ver dashboard',
  },
  {
    groupName: 'Usuarios',
    permissionName: 'usuarios_ver',
    description: 'Ver usuarios',
  },
  {
    groupName: 'Clientes',
    permissionName: 'clientes_ver',
    description: 'Ver clientes',
  },
  {
    groupName: 'Facturas',
    permissionName: 'facturas_ver',
    description: 'Ver facturas y cotizaciones',
  },
  {
    groupName: 'Bases',
    permissionName: 'bases_ver',
    description: 'Ver bases',
  },
  {
    groupName: 'Cuentas de credito',
    permissionName: 'cuentas_credito_ver',
    description: 'Ver cuentas de credito',
  },
  {
    groupName: 'Permisos',
    permissionName: 'permisos_ver',
    description: 'Ver y administrar permisos',
  },
] satisfies Array<Pick<PermisoPanel, 'groupName' | 'permissionName' | 'description'>>

function getId(record: Record<string, unknown>) {
  return String(record.id ?? record.Id ?? '')
}

function getName(record: Record<string, unknown>) {
  return String(record.nombre ?? record.name ?? 'Sin nombre')
}

export function PermisosPage() {
  const currentUser = useSessionStore((state) => state.user)
  const asignador = currentUser?.id ?? ''
  const { showToast } = useToast()
  const [selectedPositionId, setSelectedPositionId] = useState(currentUser?.posicionId ?? '')
  const panel = usePermisosPanelPorPosicion(asignador, selectedPositionId)
  const cambiarPermiso = useCambiarPermisoPorNombre()

  useEffect(() => {
    if (selectedPositionId) return
    setSelectedPositionId(getId(POSICIONES[0]))
  }, [selectedPositionId])

  const selectedPosition = POSICIONES.find(
    (position) => getId(position) === selectedPositionId,
  )

  const rows = useMemo(() => {
    const apiRows = new Map(
      (panel.data ?? []).map((permission) => [permission.permissionName, permission]),
    )

    return PERMISSION_SECTIONS.map((section) => ({
      ...section,
      ...apiRows.get(section.permissionName),
      assigned: Boolean(apiRows.get(section.permissionName)?.assigned),
    }))
  }, [panel.data])

  function togglePermission(permissionName: string, assigned: boolean) {
    if (!selectedPositionId || !asignador) return

    const accion: PermisoAccion = assigned ? 'remove' : 'add'

    cambiarPermiso
      .mutateAsync({
        asignador,
        positionId: selectedPositionId,
        permissionName,
        accion,
      })
      .then(() => {
        showToast({
          title: assigned ? 'Permiso removido' : 'Permiso asignado',
          variant: 'success',
        })
      })
      .catch((error: unknown) => {
        showToast({
          title: 'No se pudo actualizar el permiso',
          description: getMessageFromUnknown(error),
          variant: 'error',
        })
      })
  }

  return (
    <>
      <PageHeader
        title="Permisos"
        description="Acceso por posicion a las secciones principales."
      />

      <Card className="grid gap-4 p-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,360px)_1fr] md:items-end">
          <Select
            label="Posicion"
            value={selectedPositionId}
            onChange={(event) => setSelectedPositionId(event.target.value)}
          >
            {POSICIONES.map((position) => {
              const id = getId(position)
              return (
                <option key={id} value={id}>
                  {getName(position)}
                </option>
              )
            })}
          </Select>
          <div className="rounded-md border border-black/5 bg-[#f7f9ff] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Editando
            </p>
            <p className="mt-1 text-sm font-semibold text-kleep-ink">
              {selectedPosition ? getName(selectedPosition) : 'Director General'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {panel.isLoading ? (
          <div className="grid gap-3 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : null}

        {panel.isError ? (
          <div className="border-b border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            No se pudo consultar el estado actual. Las secciones siguen disponibles para revisar.
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f7f9ff] text-left text-xs font-semibold uppercase tracking-wide text-kleep-ink">
              <tr>
                <th className="px-4 py-3.5">Seccion</th>
                <th className="px-4 py-3.5">Permiso</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5 text-right">Accion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.permissionName}
                  className="border-b border-black/5 last:border-b-0"
                >
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-kleep-ink">{row.groupName}</p>
                    <p className="text-xs text-slate-500">{row.description}</p>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-600">
                    {row.permissionName}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold ${
                        row.assigned
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {row.assigned ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                      {row.assigned ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      variant={row.assigned ? 'secondary' : 'primary'}
                      className="min-h-9 px-3"
                      disabled={!selectedPositionId || panel.isLoading}
                      isLoading={
                        cambiarPermiso.isPending &&
                        cambiarPermiso.variables?.permissionName === row.permissionName
                      }
                      onClick={() => togglePermission(row.permissionName, row.assigned)}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {row.assigned ? 'Quitar' : 'Dar acceso'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
