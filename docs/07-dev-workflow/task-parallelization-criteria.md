# Criterio para Paralelizar Tasks sin Romper Dependencias

## ID de task origen

- `T-0148`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Definir cuándo es seguro ejecutar tasks o bloques en paralelo y cuándo las dependencias obligan a ejecución secuencial.

## Principio base

La ejecución por defecto es secuencial dentro de cada fase. La paralelización es una optimización que solo se aplica cuando se cumplen ciertas condiciones.

## Condiciones para paralelizar

### Se puede paralelizar cuando:

1. **No comparten archivos**: las tasks modifican archivos distintos y no comparten output.
2. **No hay dependencia de datos**: una task no necesita el resultado de la otra como input.
3. **No hay dependencia de infraestructura**: ambas tasks pueden ejecutarse con la infraestructura actual, sin que una requiera lo que la otra produce.
4. **No hay conflicto de naming/convención**: ambas tasks respetan las mismas convenciones sin posibilidad de colisión.
5. **Son de capas diferentes**: por ejemplo, documentación y tooling pueden avanzar mientras backend avanza si no se cruzan.

### No se puede paralelizar cuando:

1. **Una task produce un artefacto que la otra consume** (modelo Prisma → servicio backend → endpoint → frontend).
2. **Ambas modifican el mismo archivo** (prisma/schema.prisma, configuración global, etc.).
3. **Una requiere infraestructura que la otra provee** (Docker → Backend containerizado).
4. **Una define políticas que la otra debe respetar** (governance → implementación).
5. **Una task de cierre depende de que todas las tasks del bloque estén completas**.

## Ejemplo de paralelización segura

```
Fase 3 completada
├─→ Fase 4 (Docker)        ← puede avanzar
└─→ Fase 5 (Prisma/DB)     ← puede avanzar en paralelo
    (no comparten archivos, no dependen entre sí)
```

## Ejemplo de paralelización NO segura

```
T-0510 Crear modelo Organization
  └─→ T-0614 Crear módulo backend Organizations
       (requiere que el modelo Prisma exista primero)
```

## Proceso para evaluar paralelización

1. Identificar las tasks candidatas.
2. Verificar si comparten archivos.
3. Verificar si hay dependencia de datos.
4. Verificar si hay dependencia de infraestructura.
5. Si las 3 verificaciones pasan, se puede paralelizar.
6. Documentar la decisión de paralelización en el tablero de bloque.

## Restricciones

- No paralelizar tasks de governance con tasks de implementación dependiente.
- No paralelizar tasks que modifiquen el schema Prisma simultáneamente.
- Si hay duda, ejecutar secuencialmente.
