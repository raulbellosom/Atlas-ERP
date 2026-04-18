# T-0521 - Crear modelo DeviceRegistry

## Metadatos
- ID: `T-0521`
- Fase: `Fase 5`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear `DeviceRegistry` para registrar dispositivos/clientes participantes en sincronización.

## Alcance
- Definir identificador de cliente (`clientId`) único.
- Definir relación a organización y usuario opcional.
- Definir metadata base del dispositivo y estado activo.

## Fuera de alcance
- Reglas de autorización de dispositivos en backend.

## Dependencias
- `T-0520` cerrada.

## Criterios de aceptación
- [x] Modelo `DeviceRegistry` implementado.
- [x] `clientId` único.
- [x] Relaciones con `Organization` y `User` definidas.

## Validaciones
- `prisma validate` sin errores.

## Pruebas
- `db:generate` y `db:seed` exitosos.

## Riesgos
- Sin registro de dispositivos no hay trazabilidad de origen en sync.

## Documentación a actualizar
- `docs/02-architecture/32-prisma-modelos-foundation-featureflags-sync.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
