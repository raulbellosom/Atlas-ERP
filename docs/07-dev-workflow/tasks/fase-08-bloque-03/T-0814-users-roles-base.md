# T-0814 - Configurar módulo visual de users/roles base

## Metadatos
- ID: `T-0814`
- Fase: `Fase 8`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Implementar las páginas de listado de usuarios y roles con datos reales del backend.

## Alcance
- `src/pages/users/UsersPage.jsx`:
  - `useQuery` → `GET /v1/users?organizationId=xxx`.
  - Tabla con columnas: Correo, Nombre, Estado (badge coloreado), Creado.
  - Badge de estado: Activo (verde), Inactivo (gris), Bloqueado (rojo).
  - Estados: loading, error, empty state.
- `src/pages/roles/RolesPage.jsx`:
  - `useQuery` → `GET /v1/roles?organizationId=xxx`.
  - Tabla con columnas: Nombre, Nivel, Descripción, Estado.
  - Nivel mostrado en font-mono.
- Rutas añadidas: `/users`, `/roles` en `App.jsx`.
- Nav items "Usuarios" y "Roles" añadidos en `Sidebar.jsx`.

## Criterios de aceptacion
- [x] Tabla de usuarios muestra datos reales de la org.
- [x] Tabla de roles muestra datos reales de la org.
- [x] Estados loading/error/empty manejados.
- [x] lint + build OK.

## Fuera de alcance
- CRUD de usuarios/roles (crear, editar, eliminar) — bloques posteriores.
- Paginación frontend (actualmente carga todo).
