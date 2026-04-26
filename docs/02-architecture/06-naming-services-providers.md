# Convención de Naming para Services y Providers

## ID de convención
- Task origen: `T-0023`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Convención oficial
- Clases de servicio: `PascalCase` + sufijo `Service`.
- Clases de provider: `PascalCase` + sufijo `Provider`.
- Archivos:
  - servicios: `kebab-case.service.ts`
  - providers: `kebab-case.provider.ts`

## Tokens e inyección (cuando aplique)
- Tokens constantes en `UPPER_SNAKE_CASE`.
- Nombre de token descriptivo del contrato (ejemplo: `SYNC_QUEUE_PROVIDER`).

## Métodos
- Nombres en `camelCase`.
- Preferir patrón `verbo + sustantivo` (`createMovement`, `resolveConflict`).

## Restricciones
- Evitar servicios “god object” con responsabilidades cruzadas.
- Evitar nombres ambiguos (`BaseService`, `CommonProvider`) sin dominio explícito.
- Mantener controladores delgados y lógica concentrada en servicios.

