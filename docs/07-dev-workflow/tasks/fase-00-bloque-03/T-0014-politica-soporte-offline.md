# T-0014 - Definir política de soporte offline

## Metadatos
- ID: `T-0014`
- Fase: `Fase 0`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir la política oficial de soporte offline para AtlasERP v1.

## Alcance
- Declarar política de offline parcial controlado.
- Definir reglas y criterios para permitir flujos offline.
- Definir restricciones explícitas.

## Fuera de alcance
- Implementación de lógica offline por módulo.
- Definición detallada de cada operación permitida offline.

## Dependencias
- `T-0013` cerrada.

## Criterios de aceptación
- [x] Política oficial de offline creada.
- [x] Reglas y criterios de habilitación offline documentados.
- [x] Restricciones de integridad definidas.

## Validaciones
- Consistencia con servidor como source of truth.
- Consistencia con principios de sincronización.

## Pruebas
- Prueba documental de coherencia con canon de sync.

## Riesgos
- Sin política explícita de offline, puede derivar en operaciones no controladas.

## Documentación a actualizar
- `docs/05-sync/00-politica-soporte-offline.md`
- `docs/05-sync/README.md`

## Decisiones clave
- Offline parcial controlado ratificado.
- Offline total libre descartado para v1.

## Evidencia documental
- `docs/05-sync/00-politica-soporte-offline.md`
- `docs/00-canon/03_sync_principles.md`

## Pendientes para la siguiente task
- Definir política de resolución de conflictos (`T-0015`).

