# Ownership de Decisiones Tecnicas

## ID de estrategia
- Task origen: `T-0045`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir quien puede tomar decisiones tecnicas de cada tipo, como se registran y que mecanismo impide que decisiones arbitrarias rompan la arquitectura o el canon del proyecto.

## Principio base
Las decisiones tecnicas con impacto duradero deben quedar registradas explicitamente. No toda decision requiere el mismo nivel de proceso, pero ninguna decision que contradiga el canon puede tomarse sin revision.

## Tipos de decision y su proceso

### Nivel 1 — Decisiones locales (sin proceso formal)
Pueden tomarlas cualquier desarrollador sin revision adicional.
- Eleccion de estructura interna de una funcion o metodo.
- Nombre de variable o constante local.
- Orden de validaciones internas de un DTO.
- Estilo de formato dentro de las reglas del linter.

### Nivel 2 — Decisiones de modulo (revision de par)
Requieren que al menos otro miembro del equipo revise antes de fusionar.
- Agregar una dependencia nueva de terceros (paquete npm, biblioteca).
- Cambiar la estructura de un endpoint existente.
- Agregar un nuevo campo opcional a un modelo existente (migracion simple).
- Agregar una nueva ruta en el frontend.

### Nivel 3 — Decisiones arquitectonicas (ADR obligatorio)
Requieren un ADR documentado y aprobacion del responsable tecnico antes de implementar.
- Cambio de tecnologia o framework en cualquier capa (backend, frontend, desktop, infra).
- Cambio de estrategia de sincronizacion.
- Agregar o eliminar un servicio del stack (nueva DB, nuevo servicio externo).
- Cambiar el modelo de ownership de datos.
- Cambiar politicas de audit, secretos, logs o backups.
- Crear un nuevo modulo de negocio (requiere blueprint ademas del ADR).
- Cualquier decision que contradiga un documento del canon (`docs/00-canon/*`).

### Nivel 4 — Decisiones de canon (revision colectiva + freeze)
Requieren revision y aprobacion de todo el equipo responsable del proyecto. Solo se ejecutan en ventanas de refactorizacion planificadas.
- Modificacion de los documentos del canon (`docs/00-canon/*`).
- Cambio del nombre visible del producto.
- Cambio de la arquitectura general (monorepo, monolito modular, etc.).

## Mecanismo de registro: ADR

Un ADR (Architecture Decision Record) es un documento breve que registra:
- Contexto: por que se necesita tomar esta decision.
- Decision: que se decidio exactamente.
- Alternativas consideradas: que opciones se descartaron y por que.
- Consecuencias: que cambia, que riesgo se acepta, que se gana.
- Responsable: quien tomo la decision y quien la aprobo.
- Fecha.

Los ADRs se almacenan en `docs/02-architecture/adr/` con el formato `ADR-NNNN-titulo-corto.md`.
Su creacion se implementa en la Fase 3 (`T-0336` a `T-0339`).

## Proceso de aprobacion para Nivel 3

1. El desarrollador redacta el ADR en borrador.
2. Abre una PR con el ADR y la propuesta de cambio (sin codigo de implementacion aun).
3. El responsable tecnico revisa y puede: aprobar, solicitar cambios o rechazar.
4. Si se aprueba: se fusiona el ADR y se procede con la implementacion.
5. Si se rechaza: el ADR queda en estado `rejected` con la razon documentada.

## Veto sobre el canon
Cualquier decision de Nivel 3 o 4 que contradiga un principio del canon (`docs/00-canon/*`) esta vetada por defecto.
Para levantarlo se requiere:
1. Documentar la contradiccion explicita.
2. Proponer la modificacion del canon como Nivel 4.
3. Obtener aprobacion colectiva antes de proceder.

## Responsables por area

| Area | Decisiones Nivel 2 | Decisiones Nivel 3 |
|------|-------------------|-------------------|
| Backend (NestJS/Prisma) | Equipo backend | Responsable tecnico |
| Frontend web (React) | Equipo frontend | Responsable tecnico |
| Desktop (Tauri) | Equipo desktop | Responsable tecnico |
| Infraestructura (Docker/CI) | DevOps | Responsable tecnico |
| Sync Core | Equipo backend | Responsable tecnico |
| Canon y governance | N/A (siempre Nivel 4) | Equipo completo |

## Nota
La estructura de carpetas de ADRs y la plantilla de ADR se crean en la Fase 3 del proyecto. Este documento define solo la politica de ownership y el proceso de toma de decisiones.
