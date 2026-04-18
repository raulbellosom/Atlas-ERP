# AtlasERP — Monorepo Maestro

Plataforma modular de negocio construida sobre un monorepo con arquitectura modular monolítica.
Nombre interno de código: **AtlasERP** | Nombre visible temporal: **Atlas ERP**

---

## Stack tecnológico oficial

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS + TypeScript + Prisma + PostgreSQL |
| Frontend web | React + Vite + JavaScript + TailwindCSS 4.1 |
| Desktop | Tauri + SQLite (caché local y cola de sync) |
| Worker/Jobs | NestJS worker process + Redis |
| Almacenamiento | MinIO / S3 compatible |
| Infraestructura | Docker + Docker Compose |

---

## Estructura del monorepo

```
/
├─ apps/
│  ├─ api/          # Backend central (NestJS + Prisma)
│  ├─ web/          # App web (React + Vite)
│  ├─ desktop/      # Shell desktop (Tauri)
│  └─ worker/       # Jobs y sincronización async
│
├─ packages/
│  ├─ ui/           # Componentes reutilizables (TailwindCSS 4.1)
│  ├─ shared/       # Constantes, enums, helpers cross-app
│  ├─ validation/   # Esquemas compartidos (Zod u equivalente)
│  ├─ sync-contracts/ # Tipos y contratos del protocolo de sync
│  ├─ sdk/          # SDK interno para consumir la API
│  └─ config/       # Configuración compartida (lint, prettier, tsconfig)
│
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seeds/
│
├─ infra/
│  ├─ docker/       # docker-compose por ambiente
│  ├─ nginx/
│  ├─ scripts/      # Bootstrap, reset, deploy
│  └─ backup/
│
├─ docs/            # Documentación del proyecto (ver abajo)
├─ tools/           # Generadores, codemods, prompts de IA
└─ .github/
   └─ workflows/    # CI/CD
```

---

## Documentación del proyecto

| Sección | Contenido |
|---------|-----------|
| `docs/00-canon/` | Principios no negociables del proyecto |
| `docs/01-product/` | Propósito, alcance y visión del producto |
| `docs/02-architecture/` | Decisiones de arquitectura y stack oficial |
| `docs/03-domain-blueprints/` | Blueprints de dominio de cada módulo |
| `docs/04-modules/` | Ownership, crecimiento y naming de módulos |
| `docs/05-sync/` | Políticas de offline y resolución de conflictos |
| `docs/06-security/` | Seguridad, feature flags y soft delete |
| `docs/07-dev-workflow/` | Modelo operativo de tasks y estado del backlog |
| `docs/08-codex/` | Instrucciones, prompts y skills para IA |
| `docs/09-roadmap/` | Roadmap de evolución del proyecto |

**Punto de entrada recomendado:** `CODEX_START_HERE.md`

---

## Levantamiento local (cuando el monorepo esté inicializado)

```bash
# Instalar dependencias
pnpm install

# Levantar infraestructura (PostgreSQL, Redis, MinIO)
pnpm infra:up

# Ejecutar migraciones
pnpm db:migrate

# Ejecutar seeds iniciales
pnpm db:seed

# Levantar todas las apps en modo desarrollo
pnpm dev
```

> Ver `docs/07-dev-workflow/` para el flujo de trabajo, convenciones de commits y política de branches.

---

## Primer módulo de negocio

**Financial Operations Core / Tesorería y Movimientos**

Cubre: cuentas bancarias, movimientos manuales, transferencias, saldos, conciliación, cuentas por cobrar y pagar simples, adjuntos y sync.

---

## Reglas maestras

1. El servidor es la fuente oficial de verdad.
2. SQLite local es caché transitoria — nunca reemplaza PostgreSQL.
3. Ningún módulo nuevo sin blueprint aprobado.
4. Ninguna entidad nueva sin ownership definido.
5. Toda acción crítica se audita.
6. No usar Bootstrap. Usar TailwindCSS 4.1.
7. Los conflictos de sync se resuelven manualmente, nunca de forma automática.

> Ver `docs/00-canon/` para el conjunto completo de principios.

---

## Idioma y codificación

- Idioma principal del proyecto: **español de México**
- Codificación obligatoria de todos los archivos de texto: **UTF-8**
