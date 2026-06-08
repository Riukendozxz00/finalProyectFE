export const permissions = {
  dashboard: {
    view: 'DASHBOARD_VIEW',
  },
  usuarios: {
    view: 'USUARIOS_VIEW',
    create: 'USUARIOS_CREATE',
    update: 'USUARIOS_UPDATE',
    delete: 'USUARIOS_DELETE',
  },
  clientes: {
    view: 'CLIENTES_VIEW',
    create: 'CLIENTES_CREATE',
    update: 'CLIENTES_UPDATE',
    delete: 'CLIENTES_DELETE',
  },
  bases: {
    view: 'BASES_VIEW',
    create: 'BASES_CREATE',
    update: 'BASES_UPDATE',
    delete: 'BASES_DELETE',
  },
  cuentasCredito: {
    view: 'CUENTAS_CREDITO_VIEW',
    create: 'CUENTAS_CREDITO_CREATE',
    update: 'CUENTAS_CREDITO_UPDATE',
    delete: 'CUENTAS_CREDITO_DELETE',
  },
  cotizaciones: {
    view: 'COTIZACIONES_VIEW',
    create: 'COTIZACIONES_CREATE',
    update: 'COTIZACIONES_UPDATE',
    delete: 'COTIZACIONES_DELETE',
  },
  facturas: {
    view: 'FACTURAS_VIEW',
    create: 'FACTURAS_CREATE',
    update: 'FACTURAS_UPDATE',
    delete: 'FACTURAS_DELETE',
  },
  permisos: {
    view: 'PERMISOS_VIEW',
    assign: 'PERMISOS_ASSIGN',
  },
} as const

export type PermissionName = string

