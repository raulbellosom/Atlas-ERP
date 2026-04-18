# Mapa de Dependencias entre Tasks

## ID de task origen

- `T-0147`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Documentar las dependencias fuertes entre fases y tasks del proyecto AtlasERP para evitar ejecución fuera de orden.

---

## Dependencias entre fases

```
Fase 0 (Governance)
  └─→ Fase 1 (Sistema de trabajo IA)
        └─→ Fase 2 (Canon y blueprints base)
              └─→ Fase 3 (Monorepo y tooling)
                    ├─→ Fase 4 (Docker e infraestructura local)
                    └─→ Fase 5 (Base de datos y Prisma)
                          └─→ Fase 6 (Backend foundation)
                                ├─→ Fase 7 (Seguridad, auth, permisos)
                                └─→ Fase 8 (Frontend web foundation)
                                      └─→ Fase 9 (Desktop foundation)
                                            └─→ Fase 10 (Sync Core)
                                                  └─→ Fase 11 (Design System)
                                                        └─→ Fase 12 (Financial Ops: dominio)
                                                              └─→ Fase 13 (Financial Ops: backend)
                                                                    └─→ Fase 14 (Financial Ops: frontend)
                                                                          └─→ Fase 15 (Financial Ops: desktop/offline)
                                                                                └─→ Fase 16 (Reportes)
                                                                                      └─→ Fase 17 (Testing)
                                                                                            └─→ Fase 18 (Observabilidad)
                                                                                                  └─→ Fase 19 (CI/CD)
                                                                                                        └─→ Fase 20 (Backups)
                                                                                                              └─→ Fase 21 (Cierre v1)
```

## Dependencias internas clave

### Fase 3 → Fase 4 y Fase 5

- Docker requiere que el monorepo exista para crear Dockerfiles.
- Prisma requiere que la estructura de apps exista para inicializarse.

### Fase 5 → Fase 6

- Backend foundation requiere schema Prisma con modelos base.
- No se puede implementar Auth, Users, Roles sin modelos Prisma.

### Fase 6 → Fase 7

- Seguridad profunda requiere backend foundation funcional.
- Auth debe existir antes de permisos granulares.

### Fase 6 → Fase 8

- Frontend necesita API backend para consumir.
- Guards de rutas necesitan endpoints de auth.

### Fase 8 → Fase 9

- Desktop reutiliza frontend; debe existir primero.

### Fase 9 → Fase 10

- Sync Core requiere tanto backend como desktop funcionando.

### Fase 12 → Fase 13 → Fase 14 → Fase 15

- Financial Ops avanza secuencialmente: dominio → backend → frontend → desktop/offline.

## Paralelización posible

| Tasks paralelas                              | Condición                                                                        |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| Fase 4 y Fase 5                              | Si Fase 3 está completa y no comparten archivos.                                 |
| Fase 7 y Fase 8                              | Parcialmente; frontend puede arrancar shell mientras security avanza en backend. |
| Fase 11 (Design System)                      | Puede avanzar en paralelo con Fase 10 si no depende de sync.                     |
| Fase 17 (Testing) y Fase 18 (Observabilidad) | Pueden avanzar en paralelo.                                                      |

## Restricciones

- No crear módulos de negocio antes de cerrar plataforma base.
- No implementar Sync Core antes de tener backend y desktop funcionales.
- No cerrar release sin completar calidad, observabilidad y CI/CD.
