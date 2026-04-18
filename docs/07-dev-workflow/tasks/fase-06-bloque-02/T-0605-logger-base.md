# T-0605 - Configurar logger base

## Metadatos
- ID: `T-0605`
- Fase: `Fase 6`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Configurar el sistema de logging base de la API NestJS: niveles de log diferenciados por NODE_ENV y patrón documentado para uso en módulos.

## Criterios de aceptacion
- [x] `main.ts` configura log levels via `NestFactory.create(AppModule, { logger: getLogLevels() })`.
- [x] Niveles por ambiente: dev=all, prod=[log,warn,error], test=[warn,error].
- [x] `common/logger/index.ts` documenta el patron de uso por módulo (`new Logger(MiServicio.name)`).
- [x] lint ✅ · typecheck ✅ · build ✅

## Archivos modificados
- `apps/api/src/main.ts` — añadido `getLogLevels()` y configuracion de logger.

## Archivos creados
- `apps/api/src/common/logger/index.ts` — re-exporta `Logger` con documentacion del patron.

## Patron de uso

```typescript
// En cualquier provider NestJS:
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MiServicio {
  private readonly logger = new Logger(MiServicio.name);

  miMetodo(): void {
    this.logger.log('Operacion completada');     // INFO
    this.logger.debug('Detalle de depuracion');  // DEBUG (solo dev)
    this.logger.warn('Advertencia');             // WARN
    this.logger.error('Error', stack);           // ERROR
  }
}
```

## Niveles activos por ambiente

| Nivel   | development | production | test |
|---------|-------------|------------|------|
| error   | ✅          | ✅         | ✅   |
| warn    | ✅          | ✅         | ✅   |
| log     | ✅          | ✅         | ❌   |
| debug   | ✅          | ❌         | ❌   |
| verbose | ✅          | ❌         | ❌   |

## Pendientes no resueltos
- Logger estructurado JSON en produccion (Winston) — mejora post-MVP.
- Correlacion de request ID en logs — Fase 7+.
