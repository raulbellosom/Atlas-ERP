# T-0631 - Configurar serialización estándar

## Metadatos
- ID: `T-0631`
- Fase: `Fase 6`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Estandarizar la serialización de respuestas exitosas para que la API entregue payloads JSON consistentes y seguros.

## Alcance
- Crear utilidad de serialización global `serializeResponseValue(...)`.
- Normalizar tipos especiales:
  - `Date` -> ISO string
  - `bigint` -> string
  - `undefined` omitido en objetos
- Integrar serialización en `TransformInterceptor` global.

## Fuera de alcance
- Versionado de contratos de respuesta.
- Transformaciones de negocio por módulo.

## Dependencias
- `T-0630` cerrada.

## Criterios de aceptación
- [x] Serialización estándar aplicada en respuestas 2xx.
- [x] Tipos no serializables en JSON normalizados de forma explícita.
- [x] No se exponen campos `undefined` en payloads objeto.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/common/serialization/serialize-response.util.ts`
- `apps/api/src/common/interceptors/transform.interceptor.ts`

## Pendientes no resueltos
- Ninguno.
