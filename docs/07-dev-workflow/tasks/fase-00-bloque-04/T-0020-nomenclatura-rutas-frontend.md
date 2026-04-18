# T-0020 - Definir nomenclatura de rutas frontend

## Metadatos
- ID: `T-0020`
- Fase: `Fase 0`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir convención oficial de rutas frontend para navegación consistente y mantenible.

## Alcance
- Definir regla base de paths.
- Definir estructura recomendada por módulo/recurso.
- Definir restricciones y ejemplos oficiales.

## Fuera de alcance
- Implementación de router en frontend.
- Refactor de rutas de módulos futuros.

## Dependencias
- `T-0019` cerrada.

## Criterios de aceptación
- [x] Convención de rutas frontend documentada.
- [x] Estructura patrón y ejemplos incluidos.
- [x] Restricciones de estabilidad y seguridad definidas.

## Validaciones
- Consistencia con convención de nombres de módulos.
- Consistencia con UX y claridad operativa.

## Pruebas
- Prueba documental de coherencia con módulos y paths objetivo.

## Riesgos
- Rutas inconsistentes afectan navegación, mantenimiento y DX.

## Documentación a actualizar
- `docs/04-modules/04-nomenclatura-rutas-frontend.md`
- `docs/00-canon/02_modular_strategy.md`

## Decisiones clave
- Paths en kebab-case, sin acentos ni mayúsculas.
- Organización de rutas por módulo y recurso.

## Evidencia documental
- `docs/04-modules/04-nomenclatura-rutas-frontend.md`

## Pendientes para la siguiente task
- Iniciar `T-0021` (nomenclatura de endpoints backend).

