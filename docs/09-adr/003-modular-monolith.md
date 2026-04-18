# ADR 003 — Arquitectura Modular Monolith

## Metadatos
- **ID**: `ADR-003`
- **Estado**: `aprobado`
- **Fecha**: `2026-04-12`
- **Task origen**: `T-0338`
- **Decisores**: SystemArchitectAgent, revision humana

## Contexto

AtlasERP necesita manejar multiples dominios de negocio: finanzas, ventas, compras, inventario, CRM, RRHH, etc. Se debe decidir la estrategia de descomposicion del backend para equilibrar complejidad operativa y separacion de responsabilidades.

## Decision

**Modular Monolith: un proceso NestJS con modulos separados por dominio.**

Cada dominio de negocio es un `NestJS Module` independiente con:
- Su propio directorio en `apps/api/src/modules/<dominio>/`
- Controller, Service, DTOs y tests propios
- Sin dependencias directas entre modulos (solo via interfaces y eventos)
- Acceso a datos exclusivamente via Prisma (sin repositorios cross-module)

```
apps/api/src/modules/
  auth/           — Autenticacion y sesiones
  users/          — Gestion de usuarios
  organizations/  — Multitenancy
  sales/          — Ventas y facturacion
  purchases/      — Compras y proveedores
  inventory/      — Inventario y almacenes
  ...
```

## Opciones consideradas

| Opcion               | Pros                                  | Contras                                    |
| -------------------- | ------------------------------------- | ------------------------------------------ |
| Microservicios       | Escalabilidad independiente           | Complejidad operativa alta, red entre servicios |
| Monolito tradicional | Simple                                | Acoplamiento alto, difícil de escalar      |
| Modular Monolith (elegido) | Balance: separacion sin complejidad operativa | Un solo proceso a desplegar |

## Consecuencias

- **Positivas**: Deploy simple, transacciones de BD triviales, refactor a microservicios posible si crece.
- **Negativas**: Escala vertical limitada (un proceso), modulos deben ser disciplinados para no acoplarse.
- **Regla**: Un modulo NUNCA importa directamente del Service de otro modulo — usa events o puertos definidos.
- **Migracion futura**: Si un modulo crece demasiado, puede extraerse a microservicio con cambios minimos.
