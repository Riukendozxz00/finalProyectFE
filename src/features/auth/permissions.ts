const sectionPermissions = {
  dashboard: 'dashboad_ver',
  usuarios: 'usuarios_ver',
  clientes: 'clientes_ver',
  facturas: 'facturas_ver',
  bases: 'bases_ver',
  cuentasCredito: 'cuentas_credito_ver',
  permisos: 'permisos_ver',
} as const

export const permissions = {
  dashboard: {
    view: sectionPermissions.dashboard,
  },
  usuarios: {
    view: sectionPermissions.usuarios,
    create: sectionPermissions.usuarios,
    update: sectionPermissions.usuarios,
    delete: sectionPermissions.usuarios,
  },
  clientes: {
    view: sectionPermissions.clientes,
    create: sectionPermissions.clientes,
    update: sectionPermissions.clientes,
    delete: sectionPermissions.clientes,
  },
  bases: {
    view: sectionPermissions.bases,
    create: sectionPermissions.bases,
    update: sectionPermissions.bases,
    delete: sectionPermissions.bases,
  },
  cuentasCredito: {
    view: sectionPermissions.cuentasCredito,
    create: sectionPermissions.cuentasCredito,
    update: sectionPermissions.cuentasCredito,
    delete: sectionPermissions.cuentasCredito,
  },
  cotizaciones: {
    view: sectionPermissions.facturas,
    create: sectionPermissions.facturas,
    update: sectionPermissions.facturas,
    delete: sectionPermissions.facturas,
  },
  facturas: {
    view: sectionPermissions.facturas,
    create: sectionPermissions.facturas,
    update: sectionPermissions.facturas,
    delete: sectionPermissions.facturas,
  },
  permisos: {
    view: sectionPermissions.permisos,
    assign: sectionPermissions.permisos,
  },
} as const

export type PermissionName = string
