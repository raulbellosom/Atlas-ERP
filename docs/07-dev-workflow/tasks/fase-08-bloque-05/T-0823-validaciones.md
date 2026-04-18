# T-0823 - Configurar validaciones frontend

## Metadatos
- ID: `T-0823`
- Fase: `Fase 8`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/lib/schemas.js`: esquemas Zod reutilizables.
  - `emailSchema`: email requerido con mensaje en español.
  - `passwordSchema`: mínimo 8 caracteres.
  - `requiredString(label?)`: string no vacío genérico.
  - `optionalString`: string opcional que acepta vacío.
  - `loginSchema`: `{ email, password }`.
  - `changePasswordSchema`: `{ currentPassword, newPassword, confirmPassword }` con `.refine()` para confirmar coincidencia.

## Criterios de aceptacion
- [x] Esquemas exportados y usados en LoginPage con zodResolver.
- [x] lint + build OK.
