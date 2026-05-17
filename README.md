# KLEEP

Frontend React + TypeScript + Vite para consumir el backend Node/Express de mayoreo, menudeo, clientes, cuentas de credito y bases.

## Requisitos

- Node.js 20.12.2 o superior. El proyecto usa Vite 5 para ser compatible con Node 20.12.
- Backend corriendo en `http://localhost:3000`.

## Instalacion

```bash
npm install
```

Crea un archivo `.env` tomando como base `.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev      # levanta el FE en http://localhost:3001
npm run build    # typecheck + build de produccion
npm run lint     # ESLint
npm run format   # Prettier
npm run preview  # preview del build
```

## Estructura

```txt
src/
  app/
    router.tsx
    providers.tsx
    layouts/
  shared/
    api/
      httpClient.ts
      endpoints.ts
      queryKeys.ts
      response.ts
    ui/
    utils/
    types/
  features/
    auth/
    usuarios/
    permisos/
    clientes/
    cuentas-credito/
    bases/
  pages/
    dashboard/
    not-found/
```

## Flujo de autenticacion

- Login consume `POST /mayoreo/ejecutivos/personal/login` con body `{ user, pass }`.
- La sesion guarda `id`, `nombre`, `rol`, `posicionId` y `token` opcional en Zustand persistido.
- Las rutas privadas se protegen con `PrivateRoute`.
- Axios agrega `Authorization: Bearer <token>` si el backend entrega token.
- Ante HTTP `401`, el interceptor limpia sesion y redirige a `/login`.

## Decisiones tecnicas

- Arquitectura feature-first para aislar tipos, hooks y paginas por dominio.
- TanStack Query centraliza cache, invalidacion y estados de loading.
- Axios tiene interceptores globales y normalizacion de errores `400`, `401`, `404`, `500`.
- React Hook Form + Zod valida formularios y arma bodies exactos del contrato del backend.
- Tailwind + componentes propios cubren botones, inputs, selects, tablas, modales, confirmaciones, skeletons, empty states, paginacion y toasts.
- Las respuestas se parsean con helpers tolerantes a `data`, `result`, `items`, `results` o respuesta directa porque el contrato recibido define params/body, pero no envelope exacto.

## Checklist

- [x] Vite en puerto local `3001`.
- [x] Backend configurable via `VITE_API_URL`, por defecto documentado en `3000`.
- [x] Login con body exacto `{ user, pass }`.
- [x] Sidebar, header con usuario y rutas privadas.
- [x] Usuarios: alta, listado, detalle, mi equipo y modificacion por `column/newValue`.
- [x] Permisos: grupos por usuario, todos los grupos, permisos por grupo, permisos por usuario/grupo, permisos por posicion, add/remove individual y todos.
- [x] Clientes: filtros query, listado, detalle, alta, edicion y eliminacion logica.
- [x] Clientes enriquecidos: status, ejecutivo, posicion, region, cuenta credito, totales de cotizaciones/facturas.
- [x] Cuentas de credito: alta, edicion de limite, listado por cliente y eliminacion.
- [x] Bases: listado, filtro opcional por cliente, alta global, alta por contexto de cliente, edicion y detalle.
- [x] Cotizaciones: listado por cliente, alta y edicion.
- [x] Facturas: listado por cliente, alta y edicion.
- [x] `useUsuariosOptions(empleadoId)` para dropdowns de ejecutivo con label `nombre apellido - posicion (region)`.
- [x] Loading states, empty states, paginacion cliente y toasts.
- [x] ESLint + Prettier.
- [x] `npm run lint` validado.
- [x] `npm run build` validado.

## TODOs de integracion

- Ajustar nombres visuales de columnas si el backend devuelve campos adicionales o aliases distintos.
- Reemplazar el render JSON de detalle por layouts ricos cuando el backend confirme el shape final de cada detalle.
- Agregar code splitting por ruta si el bundle supera el presupuesto de produccion.

## Endpoints nuevos integrados

- `POST /:idUsuario/clientes/:clienteId/bases/informacionGeneral/agregar`
- `GET /:idUsuario/clientes/:clienteId/cotizaciones/informacionGeneral/obtener`
- `POST /:idUsuario/clientes/:clienteId/cotizaciones/informacionGeneral/agregar`
- `PUT /:idUsuario/clientes/:clienteId/cotizaciones/:cotizacionId/informacionGeneral/modificar`
- `GET /:idUsuario/clientes/:clienteId/facturas/informacionGeneral/obtener`
- `POST /:idUsuario/clientes/:clienteId/facturas/informacionGeneral/agregar`
- `PUT /:idUsuario/clientes/:clienteId/facturas/:facturaId/informacionGeneral/modificar`
