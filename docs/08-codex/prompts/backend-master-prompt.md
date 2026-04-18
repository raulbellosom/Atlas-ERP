# Backend Master Prompt

## ID de task origen

- `T-0113`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucción

Construye el backend de AtlasERP con NestJS en TypeScript estricto, usando Prisma como ORM y PostgreSQL como base central.

### Estructura modular

- Un módulo NestJS por dominio funcional.
- Cada módulo contiene: module, controller, service, DTOs, guards (si aplica).
- Controladores delgados: solo reciben, validan y responden.
- Servicios con lógica de negocio limpia y tipada.
- DTOs de entrada con validaciones (class-validator).
- DTOs de salida para serialización controlada.

### Convenciones

- Naming de endpoints: `docs/02-architecture/04-nomenclatura-endpoints-backend.md`.
- Naming de services/providers: `docs/02-architecture/06-naming-services-providers.md`.
- Formato de respuesta estándar con interceptor global.
- Manejo de errores con exception filter global.
- Paginación estándar con `page`, `limit`, `total`.
- Filtros base reutilizables.

### Seguridad

- Todo endpoint protegido por guard de autenticación (excepto health y login).
- Autorización por roles y permisos granulares.
- Scoping por organización y sucursal.
- Auditoría de operaciones críticas.
- Rate limit en endpoints sensibles.

### Integraciones

- Prisma para acceso a datos (nunca SQL directo).
- MinIO/S3 para archivos y adjuntos.
- Redis para colas y caché cuando aplique.
- Endpoints de sync para comunicación con clientes offline.

### Restricciones

- TypeScript estricto en todo el backend.
- No mezclar lógica de dominio con infraestructura HTTP.
- No exponer datos sin validar permisos.
- No realizar operaciones destructivas sin auditoría.

### Referencia

- `docs/00-canon/01_architecture_principles.md`
- `docs/00-canon/06_security_and_audit.md`
- `docs/02-architecture/04-nomenclatura-endpoints-backend.md`
- `docs/02-architecture/06-naming-services-providers.md`
