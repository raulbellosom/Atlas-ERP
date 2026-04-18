# Canon: Convenciones de Código

## Principios generales

- El código debe ser legible por un humano antes que optimizado para la máquina.
- Los nombres deben ser explícitos: evitar abreviaturas ambiguas.
- Una función hace una sola cosa. Si hace dos, debe dividirse.
- El código comentado es deuda: se elimina o se convierte en comentario útil con contexto.

## Backend (NestJS / TypeScript)

- **Naming de clases**: `PascalCase` — `BankAccountService`, `TransactionController`
- **Naming de métodos y propiedades**: `camelCase` — `findByOrganizationId`, `isActive`
- **Naming de archivos**: `kebab-case` — `bank-account.service.ts`, `transaction.dto.ts`
- **DTOs**: sufijo `Dto` — `CreateBankAccountDto`, `UpdateTransactionDto`
- **Interfaces**: prefijo `I` solo cuando sea necesario para diferenciar de clase concreta
- **Enums**: `PascalCase` para el tipo, `SCREAMING_SNAKE_CASE` para valores — `TransactionStatus.PENDING`
- **Constantes**: `SCREAMING_SNAKE_CASE` — `MAX_RETRY_ATTEMPTS`
- **Módulos NestJS**: un módulo por dominio/subdominio
- **Prisma**: los modelos de Prisma en `PascalCase`, los campos en `camelCase`

## Frontend (React / JavaScript)

- **Componentes**: `PascalCase` en archivo y en JSX — `BankAccountCard.jsx`
- **Hooks**: prefijo `use` en `camelCase` — `useBankAccounts`, `useSyncStatus`
- **Utilidades y helpers**: `camelCase` — `formatCurrency.js`, `parseDate.js`
- **Constantes de módulo**: `SCREAMING_SNAKE_CASE`
- **Props**: `camelCase`
- **Estilos**: TailwindCSS 4.1 como única fuente de estilos — sin CSS inline arbitrario, sin archivos `.css` salvo el global de Tailwind
- **No usar Bootstrap** bajo ninguna circunstancia

## Naming de endpoints (referencia)
Ver `docs/02-architecture/04-nomenclatura-endpoints-backend.md`

## Naming de componentes UI (referencia)
Ver `docs/02-architecture/05-naming-componentes-ui.md`

## Naming de servicios y providers (referencia)
Ver `docs/02-architecture/06-naming-services-providers.md`

## Convenciones de commits (referencia)
Ver `docs/07-dev-workflow/06-politica-commits-convenciones.md`

## Restricciones absolutas

- Prohibido usar `any` en TypeScript salvo justificación documentada en el mismo archivo.
- Prohibido usar `console.log` en código que llegue a producción del backend.
- Prohibido mezclar lógica de negocio con lógica de presentación en componentes React.
- Prohibido hardcodear URLs, IDs o valores de configuración en código fuente.
