export const endpoints = {
  auth: {
    login: '/mayoreo/ejecutivos/personal/login',
  },
  dashboard: {
    conversion: '/dashboard/conversion',
    sales: '/dashboard/sales',
    equipo: '/dashboard/equipo',
  },
  usuarios: {
    crear: (idEjecutivo: string) => `/mayoreo/ejecutivos/${idEjecutivo}/usuarios/crear`,
    listar: (empleadoId: string) => `/mayoreo/ejecutivos/${empleadoId}/usuarios/todo`,
    detalle: (empleadoId: string) => `/mayoreo/ejecutivos/${empleadoId}/userInfo`,
    equipo: (empleadoId: string) => `/mayoreo/ejecutivos/${empleadoId}/equipo/todo`,
    modificar: (idEjecutivo: string) =>
      `/mayoreo/ejecutivos/${idEjecutivo}/usuarios/modificar`,
  },
  permisos: {
    gruposPorUsuario: (id: string) => `/menudeo/personal/${id}/grupos`,
    permisosPorGrupoPost: (userId: string, groupId: string) =>
      `/menudeo/personal/${userId}/grupos/${groupId}/permisos`,
    gruposTodos: (empleadoId: string) => `/menudeo/personal/${empleadoId}/grupos/todos`,
    permisosPorGrupo: (empleadoId: string, groupId: string) =>
      `/menudeo/personal/${empleadoId}/grupos/${groupId}/permisos`,
    permisoAccion: (
      asignador: string,
      groupId: string,
      RolAsignado: string,
      permissionId: string,
      accion: 'add' | 'remove',
    ) =>
      `/menudeo/personal/${asignador}/grupos/${groupId}/incluir/${RolAsignado}/permiso/${permissionId}/accion/${accion}`,
    todosAccion: (
      asignador: string,
      groupId: string,
      RolAsignado: string,
      accion: 'add' | 'remove',
    ) =>
      `/menudeo/personal/${asignador}/grupos/${groupId}/incluir/${RolAsignado}/todos/accion/${accion}`,
    permisosPorPosicion: (empleadoId: string, groupId: string, positionId: string) =>
      `/menudeo/personal/${empleadoId}/grupos/${groupId}/posicion/${positionId}`,
  },
  clientes: {
    listar: (idUsuario: string) => `/${idUsuario}/clientes/informacionGeneral/obtener`,
    detalle: (idUsuario: string, clienteId: string) =>
      `/${idUsuario}/clientes/${clienteId}/informacionGeneral/obtener`,
    agregar: (idUsuario: string) => `/${idUsuario}/clientes/informacionGeneral/agregar`,
    modificar: (idUsuario: string, clienteId: string) =>
      `/${idUsuario}/clientes/${clienteId}/informacionGeneral/modificar`,
    eliminar: (idUsuario: string, clienteId: string) =>
      `/${idUsuario}/clientes/${clienteId}/informacionGeneral/eliminar`,
    reactivar: (idUsuario: string, clienteId: string) =>
      `/${idUsuario}/clientes/${clienteId}/informacionGeneral/reactivar`,
  },
  cuentasCredito: {
    agregar: (idUsuario: string) =>
      `/${idUsuario}/clientes/cuentaCredito/informacionGeneral/agregar`,
    agregarPorCliente: (idUsuario: string, clienteId: string) =>
      `/${idUsuario}/clientes/${clienteId}/cuentaCredito/informacionGeneral/agregar`,
    modificar: (idUsuario: string, cuentaCreditoId: string) =>
      `/${idUsuario}/clientes/cuentaCredito/${cuentaCreditoId}/informacionGeneral/modificar`,
    listarPorCliente: (idUsuario: string, clienteId: string) =>
      `/${idUsuario}/clientes/${clienteId}/cuentaCredito/informacionGeneral/obtener`,
    eliminar: (idUsuario: string, cuentaCreditoId: string) =>
      `/${idUsuario}/clientes/cuentaCredito/${cuentaCreditoId}/informacionGeneral/eliminar`,
  },
  bases: {
    listar: (idUsuario: string) => `/${idUsuario}/bases/informacionGeneral/obtener`,
    agregar: (idUsuario: string) => `/${idUsuario}/bases/informacionGeneral/agregar`,
    agregarPorCliente: (idUsuario: string, clienteId: string) =>
      `/${idUsuario}/clientes/${clienteId}/bases/informacionGeneral/agregar`,
    modificar: (idUsuario: string, baseId: string) =>
      `/${idUsuario}/bases/${baseId}/informacionGeneral/modificar`,
    detalle: (idUsuario: string, baseId: string) =>
      `/${idUsuario}/bases/${baseId}/informacionGeneral/obtener`,
    documentos: (idUsuario: string, baseId: string) =>
      `/${idUsuario}/bases/${baseId}/documentos/informacionGeneral/obtener`,
    eliminar: (idUsuario: string, baseId: string) =>
      `/${idUsuario}/bases/${baseId}/informacionGeneral/eliminar`,
  },
  cotizaciones: {
    listarPorCliente: (idUsuario: string, clienteId: string) =>
      `/${idUsuario}/clientes/${clienteId}/cotizaciones/informacionGeneral/obtener`,
    detalle: (idUsuario: string, clienteId: string, cotizacionId: string) =>
      `/${idUsuario}/clientes/${clienteId}/cotizaciones/${cotizacionId}/informacionGeneral/obtener`,
    agregar: (idUsuario: string, clienteId: string) =>
      `/${idUsuario}/clientes/${clienteId}/cotizaciones/informacionGeneral/agregar`,
    modificar: (idUsuario: string, clienteId: string, cotizacionId: string) =>
      `/${idUsuario}/clientes/${clienteId}/cotizaciones/${cotizacionId}/informacionGeneral/modificar`,
    eliminar: (idUsuario: string, clienteId: string, cotizacionId: string) =>
      `/${idUsuario}/clientes/${clienteId}/cotizaciones/${cotizacionId}/informacionGeneral/eliminar`,
  },
  facturas: {
    listarPorCliente: (idUsuario: string, clienteId: string) =>
      `/${idUsuario}/clientes/${clienteId}/facturas/informacionGeneral/obtener`,
    detalle: (idUsuario: string, clienteId: string, facturaId: string) =>
      `/${idUsuario}/clientes/${clienteId}/facturas/${facturaId}/informacionGeneral/obtener`,
    agregar: (idUsuario: string, clienteId: string) =>
      `/${idUsuario}/clientes/${clienteId}/facturas/informacionGeneral/agregar`,
    modificar: (idUsuario: string, clienteId: string, facturaId: string) =>
      `/${idUsuario}/clientes/${clienteId}/facturas/${facturaId}/informacionGeneral/modificar`,
    eliminar: (idUsuario: string, clienteId: string, facturaId: string) =>
      `/${idUsuario}/clientes/${clienteId}/facturas/${facturaId}/informacionGeneral/eliminar`,
  },
}
