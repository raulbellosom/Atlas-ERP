# Estrategia de Environment Variables

## ID de estrategia
- Task origen: `T-0040`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir estándar de variables de entorno para AtlasERP, separando configuración pública/privada por aplicación y por ambiente.

## Principios no negociables
- Configuración por ambiente (`dev`, `staging`, `prod`, `test`) y nunca hardcodeada.
- Fail fast: la app debe fallar al iniciar si falta configuración obligatoria.
- No almacenar secretos en repositorio.
- Trazabilidad: cada variable debe tener propósito y owner.

## Convenciones de nomenclatura
- Formato obligatorio: `MAYUSCULAS_CON_GUION_BAJO`.
- Prefijos por contexto:
  - `APP_` para configuración transversal.
  - `API_` para backend.
  - `WEB_` para frontend interno.
  - `VITE_` para variables expuestas al cliente web.
  - `DESKTOP_` para app desktop.
  - `WORKER_` para procesos asíncronos.

## Distribución de archivos
- `/.env.example`: catálogo mínimo global.
- `/apps/<app>/.env.example`: catálogo mínimo por aplicación.
- `/.env.local`: configuración local no versionada.
- Ambientes de CI/CD deben inyectar variables desde su gestor de secretos.

## Clasificación mínima
- Variables públicas: solo las estrictamente necesarias para cliente (`VITE_*`).
- Variables internas: backend/worker/desktop, nunca expuestas al navegador.
- Secretos: se gestionan fuera de git y su estrategia se formaliza en `T-0041`.

## Validación y gobernanza
- Cada app debe validar variables al arranque.
- Toda variable nueva requiere actualizar su `.env.example` correspondiente.
- Cambios de variables deben incluir impacto, migración y retrocompatibilidad.

## Restricciones
- Prohibido exponer secretos con prefijo `VITE_` o equivalente público.
- Prohibido usar variables sin declarar en `.env.example`.
