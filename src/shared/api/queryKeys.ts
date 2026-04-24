export const queryKeys = {
  session: ['session'] as const,
  usuarios: {
    all: ['usuarios'] as const,
    list: (empleadoId: string) => ['usuarios', 'list', empleadoId] as const,
    options: (empleadoId: string) => ['usuarios', 'options', empleadoId] as const,
    detail: (empleadoId: string) => ['usuarios', 'detail', empleadoId] as const,
    team: (empleadoId: string) => ['usuarios', 'team', empleadoId] as const,
  },
  permisos: {
    all: ['permisos'] as const,
    gruposUsuario: (id: string) => ['permisos', 'grupos-usuario', id] as const,
    gruposTodos: (empleadoId: string) =>
      ['permisos', 'grupos-todos', empleadoId] as const,
    grupo: (empleadoId: string, groupId: string) =>
      ['permisos', 'grupo', empleadoId, groupId] as const,
    posicion: (empleadoId: string, groupId: string, positionId: string) =>
      ['permisos', 'posicion', empleadoId, groupId, positionId] as const,
  },
  clientes: {
    all: ['clientes'] as const,
    list: (idUsuario: string, filters?: unknown) =>
      ['clientes', 'list', idUsuario, filters] as const,
    detail: (idUsuario: string, clienteId: string) =>
      ['clientes', 'detail', idUsuario, clienteId] as const,
  },
  cuentasCredito: {
    all: ['cuentas-credito'] as const,
    byCliente: (idUsuario: string, clienteId: string) =>
      ['cuentas-credito', idUsuario, clienteId] as const,
  },
  bases: {
    all: ['bases'] as const,
    list: (idUsuario: string, clienteId?: string) =>
      ['bases', 'list', idUsuario, clienteId] as const,
    detail: (idUsuario: string, baseId: string) =>
      ['bases', 'detail', idUsuario, baseId] as const,
  },
  cotizaciones: {
    all: ['cotizaciones'] as const,
    byCliente: (idUsuario: string, clienteId: string) =>
      ['cotizaciones', idUsuario, clienteId] as const,
    detail: (idUsuario: string, clienteId: string, cotizacionId: string) =>
      ['cotizaciones', 'detail', idUsuario, clienteId, cotizacionId] as const,
  },
  facturas: {
    all: ['facturas'] as const,
    byCliente: (idUsuario: string, clienteId: string) =>
      ['facturas', idUsuario, clienteId] as const,
    detail: (idUsuario: string, clienteId: string, facturaId: string) =>
      ['facturas', 'detail', idUsuario, clienteId, facturaId] as const,
  },
}
