# KLEEP Frontend

Frontend web de KLEEP construido con React, TypeScript y Vite. La aplicacion consume el backend de mayoreo/menudeo para gestionar usuarios, permisos, clientes, cuentas de credito, bases, cotizaciones, facturas y metricas comerciales.

## Tabla de contenido

- [Stack tecnico](#stack-tecnico)
- [Requisitos](#requisitos)
- [Variables de entorno](#variables-de-entorno)
- [Uso local](#uso-local)
- [Scripts disponibles](#scripts-disponibles)
- [Despliegue en servidor Ubuntu](#despliegue-en-servidor-ubuntu)
  - [1. Preparar el servidor](#1-preparar-el-servidor)
  - [2. Instalar Node.js](#2-instalar-nodejs)
  - [3. Descargar el proyecto](#3-descargar-el-proyecto)
  - [4. Configurar el backend/API](#4-configurar-el-backendapi)
  - [5. Instalar dependencias y compilar](#5-instalar-dependencias-y-compilar)
  - [6. Publicar con Nginx](#6-publicar-con-nginx)
  - [7. Habilitar HTTPS con Certbot](#7-habilitar-https-con-certbot)
  - [8. Actualizar una instalacion existente](#8-actualizar-una-instalacion-existente)
  - [9. Verificacion y solucion de problemas](#9-verificacion-y-solucion-de-problemas)
- [Manual rapido de usuario](#manual-rapido-de-usuario)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Notas tecnicas](#notas-tecnicas)

## Stack tecnico

- React 19 + TypeScript.
- Vite 5 para desarrollo y build de produccion.
- React Router para rutas privadas y rutas con permisos.
- TanStack Query para cache, carga e invalidacion de datos del backend.
- Axios para HTTP, token `Bearer` e interceptor global de errores.
- Zustand para sesion persistida.
- React Hook Form + Zod para formularios y validacion.
- Tailwind CSS 4 y componentes UI propios.
- jsPDF para descarga de cotizaciones/facturas en PDF.

## Requisitos

Para desarrollo local o build en servidor:

- Ubuntu 22.04/24.04 LTS recomendado para produccion.
- Node.js 20.12.2 o superior.
- npm incluido con Node.js.
- Git.
- Nginx para servir el build estatico.
- Backend/API accesible desde el navegador del usuario.

> Importante: `VITE_API_URL` queda embebido al momento de ejecutar `npm run build`. Si cambia la URL del backend, vuelve a compilar y republicar la carpeta `dist`.

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto antes de compilar:

```env
VITE_API_URL=https://api.tu-dominio.com
```

Si no defines `VITE_API_URL`, la aplicacion usa el valor por defecto configurado en el cliente HTTP.

## Uso local

```bash
npm install
cp .env.example .env # si existe en tu entorno; si no, crea el archivo manualmente
npm run dev
```

El servidor de desarrollo escucha en `http://localhost:3001`.

## Scripts disponibles

```bash
npm run dev      # levanta Vite en modo desarrollo en el puerto 3001
npm run build    # ejecuta TypeScript y genera dist/ para produccion
npm run lint     # ejecuta ESLint
npm run format   # formatea el proyecto con Prettier
npm run preview  # sirve localmente el build generado para inspeccion
```

## Despliegue en servidor Ubuntu

Estas instrucciones publican el frontend como sitio estatico usando Nginx. Asumen que el backend ya esta desplegado y responde por HTTPS o por una URL accesible desde los navegadores de los usuarios.

### 1. Preparar el servidor

Conectate al servidor:

```bash
ssh usuario@IP_DEL_SERVIDOR
```

Actualiza paquetes base e instala herramientas necesarias:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl ca-certificates nginx
```

Abre el firewall para HTTP/HTTPS si usas UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 2. Instalar Node.js

Instala Node.js 20 LTS desde NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Confirma que `node -v` sea `20.12.2` o superior.

### 3. Descargar el proyecto

Crea un directorio de aplicaciones y clona el repositorio:

```bash
sudo mkdir -p /var/www/kleep
sudo chown -R $USER:$USER /var/www/kleep
git clone URL_DEL_REPOSITORIO /var/www/kleep/app
cd /var/www/kleep/app
```

Si ya copiaste el proyecto por otro medio, entra a la carpeta donde este `package.json`.

### 4. Configurar el backend/API

Crea el archivo `.env` con la URL real del backend:

```bash
cat > .env <<'EOF_ENV'
VITE_API_URL=https://api.tu-dominio.com
EOF_ENV
```

Recomendaciones:

- Usa HTTPS en produccion para evitar bloqueos por contenido mixto.
- Verifica que el backend permita CORS desde el dominio donde estara este frontend.
- Asegurate de que el endpoint de login del backend este disponible.

### 5. Instalar dependencias y compilar

Instala dependencias reproducibles desde `package-lock.json` y genera el build:

```bash
npm ci
npm run build
```

Al terminar debe existir la carpeta `dist/`.

### 6. Publicar con Nginx

Copia el build a una carpeta publica:

```bash
sudo mkdir -p /var/www/kleep/html
sudo rsync -a --delete dist/ /var/www/kleep/html/
sudo chown -R www-data:www-data /var/www/kleep/html
```

Crea el virtual host de Nginx:

```bash
sudo tee /etc/nginx/sites-available/kleep >/dev/null <<'EOF_NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name tu-dominio.com www.tu-dominio.com;

    root /var/www/kleep/html;
    index index.html;

    # React Router necesita devolver index.html para rutas como /clientes/123.
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache agresivo para assets versionados por Vite.
    location /assets/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Ajusta el limite si subes archivos grandes desde el frontend en el futuro.
    client_max_body_size 10m;
}
EOF_NGINX
```

Activa el sitio y recarga Nginx:

```bash
sudo ln -sfn /etc/nginx/sites-available/kleep /etc/nginx/sites-enabled/kleep
sudo nginx -t
sudo systemctl reload nginx
```

Ahora abre `http://tu-dominio.com` en el navegador.

### 7. Habilitar HTTPS con Certbot

Si el DNS del dominio ya apunta al servidor, instala Certbot y genera el certificado:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

Prueba la renovacion automatica:

```bash
sudo certbot renew --dry-run
```

### 8. Actualizar una instalacion existente

Cada vez que publiques cambios:

```bash
cd /var/www/kleep/app
git pull
npm ci
npm run build
sudo rsync -a --delete dist/ /var/www/kleep/html/
sudo chown -R www-data:www-data /var/www/kleep/html
sudo nginx -t
sudo systemctl reload nginx
```

Si cambiaste `VITE_API_URL`, edita `.env` antes de `npm run build`.

### 9. Verificacion y solucion de problemas

Comandos utiles:

```bash
sudo systemctl status nginx
sudo nginx -t
curl -I http://tu-dominio.com
curl -I https://tu-dominio.com
```

Problemas comunes:

- **Pantalla en blanco o assets 404:** revisa que `rsync` haya copiado el contenido de `dist/` dentro de `/var/www/kleep/html/` y no la carpeta `dist` completa como subcarpeta.
- **404 al refrescar `/clientes/123`:** confirma que el bloque `location /` tenga `try_files $uri $uri/ /index.html;`.
- **Login falla:** valida `VITE_API_URL`, conectividad al backend, CORS y credenciales.
- **Cambie la URL del backend pero sigue llamando a la anterior:** vuelve a ejecutar `npm run build` y copia nuevamente `dist/`.
- **Permisos insuficientes:** la visibilidad de rutas y acciones depende de los permisos que entrega el backend para el usuario autenticado.

## Manual rapido de usuario

La aplicacion muestra en el menu lateral solo las secciones permitidas para tu usuario. Si no ves una ruta o boton, probablemente tu rol no tiene ese permiso.

### `/login` - Inicio de sesion

1. Ingresa el empleado/usuario.
2. Ingresa la contrasena.
3. Usa el icono de mostrar/ocultar si necesitas revisar la contrasena.
4. Presiona **Ingresar**.
5. Si la sesion expira o el backend responde `401`, la aplicacion limpia la sesion y te devuelve a login.

### `/` - Dashboard

Permite revisar indicadores comerciales generales:

- **Conversion:** total de cotizaciones, total de facturas, tasa de cierre y cotizaciones convertidas.
- **Ventas:** graficas y metricas por subtotal o cantidad; permite alternar el alcance entre cotizaciones, facturas o ambas segun las opciones visibles.
- **Equipo:** rendimiento del equipo con filtros.
- En cada seccion puedes ajustar filtros como fecha/region y aplicar la consulta para refrescar datos.

### `/usuarios` - Usuarios

Permite administrar usuarios internos:

- Buscar usuarios en el listado.
- Crear usuarios si tienes permiso de alta.
- Editar columnas permitidas del usuario, como posicion o region, si tienes permiso de modificacion.
- Abrir el detalle de un usuario con **Ver**.
- Consultar la vista de **Mi equipo** cuando este disponible.

### `/usuarios/:userId` - Perfil de usuario

Permite consultar la informacion detallada de un usuario especifico, incluyendo datos generales y registros relacionados que entregue el backend.

### `/permisos` - Permisos / Menu

Permite revisar y administrar permisos:

- Consultar grupos asociados a un usuario.
- Consultar todos los grupos disponibles.
- Ver permisos por grupo.
- Ver permisos por usuario y grupo.
- Ver permisos por posicion.
- Agregar o remover un permiso individual cuando tengas permiso de asignacion.
- Agregar o remover todos los permisos de un grupo/rol cuando tengas permiso de asignacion.

### `/clientes` - Clientes

Permite gestionar la cartera de clientes:

- Filtrar por nombre, direccion, localidad, ejecutivo, limite de credito y estatus.
- Ver datos enriquecidos como ejecutivo, posicion, region, limite, cotizaciones, facturas y estatus.
- Crear un cliente si tienes permiso.
- Editar nombre/direccion si tienes permiso.
- Eliminar logicamente un cliente si tienes permiso.
- Reactivar clientes inactivos si tienes permiso.
- Abrir el perfil del cliente con **Ver**.

### `/clientes/:clienteId` - Perfil de cliente

Permite consultar la ficha de un cliente:

- Ver informacion general del cliente.
- Revisar cuentas de credito, bases, cotizaciones y facturas relacionadas cuando el backend las entregue.
- Navegar a cotizaciones del cliente.
- Navegar a facturas del cliente.
- Usar esta vista como punto de partida para revisar documentos comerciales del cliente.

### `/cuentas-credito` - Cuentas de credito

Permite administrar limites de credito por cliente:

1. Selecciona un cliente.
2. Presiona **Consultar** para listar sus cuentas.
3. Usa **Nueva cuenta** para crear una cuenta cuando haya cliente seleccionado y tengas permiso.
4. Usa **Editar** para modificar el limite de credito.
5. Usa el boton de eliminar para borrar una cuenta si tienes permiso.

### `/bases` - Bases

Permite administrar bases comerciales:

- Listar bases globales.
- Filtrar bases por cliente.
- Crear una base global o asociada al cliente filtrado.
- Editar datos de una base.
- Eliminar una base si tienes permiso.
- Copiar rapidamente IDs visibles desde las acciones del listado.
- Abrir el detalle de una base con **Ver**.

### `/bases/:baseId` - Detalle de base

Permite revisar una caratula de base:

- Informacion general: numero, cliente, ejecutivo, localidad, direccion y fechas.
- Resumen de documentos relacionados.
- Totales de cotizaciones y facturas.
- Tablas de cotizaciones y facturas asociadas a la base.
- Accesos para volver a bases o navegar a cliente/cotizaciones/facturas relacionadas.

### `/cotizaciones` - Cotizaciones

Permite trabajar con cotizaciones por cliente:

1. Selecciona un cliente.
2. Presiona **Consultar**.
3. Usa **Nueva cotizacion** para capturar folio, subtotal, cuenta de credito y ejecutivo.
4. Usa **Editar** para modificar una cotizacion existente.
5. Usa **Descargar** para generar un PDF de la cotizacion.
6. Usa eliminar si tienes permiso para borrar una cotizacion.

### `/clientes/:clienteId/quotes` - Cotizaciones de un cliente

Es la misma operacion de cotizaciones, pero el cliente ya queda bloqueado por la ruta. Desde aqui puedes volver al perfil del cliente con el boton **Perfil**.

### `/facturas` - Facturas

Permite trabajar con facturas por cliente:

1. Selecciona un cliente.
2. Presiona **Consultar**.
3. Usa **Nueva factura** para capturar folio, subtotal, cuenta de credito, ejecutivo y cotizacion relacionada cuando aplique.
4. Usa **Editar** para modificar una factura existente.
5. Usa **Descargar** para generar un PDF de la factura.
6. Usa eliminar si tienes permiso para borrar una factura.

### `/clientes/:clienteId/bills` - Facturas de un cliente

Es la misma operacion de facturas, pero el cliente ya queda bloqueado por la ruta. Desde aqui puedes volver al perfil del cliente con el boton **Perfil**.

### `*` - Pagina no encontrada

Cualquier ruta no registrada muestra la pagina de no encontrado. Usa el menu lateral o vuelve a `/` para continuar.

## Estructura del proyecto

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
    cotizaciones/
    facturas/
  pages/
    dashboard/
    not-found/
```

## Notas tecnicas

- El login consume `POST /mayoreo/ejecutivos/personal/login` con body `{ user, pass }`.
- La sesion guarda datos del usuario y un token opcional en almacenamiento local.
- Axios agrega `Authorization: Bearer <token>` cuando existe token.
- Las rutas privadas se protegen con `PrivateRoute` y las rutas funcionales con `PermissionRoute`.
- Las respuestas del backend se parsean de forma tolerante para soportar envelopes como `data`, `result`, `items`, `results` o respuesta directa.
- El proyecto usa arquitectura por feature para mantener aisladas las APIs, tipos y paginas de cada dominio.
