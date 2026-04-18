# T-0200 - Crear README maestro del monorepo

## Metadatos
- ID: `T-0200`
- Fase: `Fase 2`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Crear el README raíz del monorepo con estructura completa, stack, instrucciones de levantamiento local y referencias a la documentación.

## Alcance
- Documentar la estructura de carpetas del monorepo.
- Documentar el stack tecnológico oficial.
- Documentar los comandos de levantamiento local (cuando el monorepo exista).
- Referenciar la documentación interna.
- Declarar las reglas maestras del proyecto en forma concisa.

## Fuera de alcance
- Implementación real del monorepo (se delega a Fase 3).
- Scripts de CI/CD concretos.

## Dependencias
- Estructura de monorepo definida en `monorepo-structure.txt`.
- Stack oficial definido en `docs/02-architecture/00-stack-tecnologico-oficial.md`.

## Criterios de aceptación
- [x] Estructura de carpetas del monorepo documentada.
- [x] Stack tecnológico oficial presente.
- [x] Comandos de levantamiento local documentados (como referencia anticipada).
- [x] Referencias a documentación interna completas.
- [x] Reglas maestras sintetizadas.
- [x] Idioma español de México, codificación UTF-8.

## Documentación a actualizar
- `README.md` (raíz del repositorio)

## Decisiones clave
- El README raíz es el punto de entrada del monorepo para cualquier desarrollador nuevo.
- Los comandos de levantamiento usan `pnpm` como package manager (decisión de Fase 3).

## Evidencia documental
- `README.md` (raíz del repositorio)

## Pendientes para la siguiente task
- Iniciar `T-0201` (canon de visión del proyecto — ya existe).

## Pendientes no resueltos
- Ninguno.
