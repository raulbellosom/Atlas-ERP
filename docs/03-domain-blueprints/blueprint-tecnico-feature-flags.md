# Blueprint Técnico: Feature Flags

## Identificación
- Módulo backend: `apps/api/src/modules/feature-flags/`
- Uso: backend, frontend y worker

## Propósito
Controlar la activación o desactivación de funcionalidades del sistema sin necesidad de despliegue. Permite activar features por organización, usuario o ambiente.

## Entidad `FeatureFlag`

```
FeatureFlag {
  id             String    @id @default(uuid())
  key            String    @unique  // ej. 'financial.reconciliation.enabled'
  description    String
  defaultValue   Boolean   @default(false)
  isActive       Boolean   @default(true)  // si el flag mismo está activo
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

## Entidad `FeatureFlagOverride`
Permite sobrescribir el valor de un flag para una organización o usuario específico.

```
FeatureFlagOverride {
  id              String    @id @default(uuid())
  featureFlagId   String
  targetType      String    // 'organization' | 'user'
  targetId        String    // ID de la organización o usuario
  value           Boolean
  createdAt       DateTime  @default(now())
}
```

## Convención de naming de flags

`<módulo>.<funcionalidad>.<estado>`

Ejemplos:
- `financial.reconciliation.enabled`
- `sync.auto_retry.enabled`
- `desktop.offline_mode.enabled`
- `admin.bulk_operations.enabled`

## Evaluación de un flag

Orden de precedencia (de mayor a menor):
1. Override para el usuario específico
2. Override para la organización del usuario
3. Valor por defecto del flag

## Cómo usarlo en el backend

```typescript
// Guard o servicio
const isEnabled = await this.featureFlagsService.isEnabled(
  'financial.reconciliation.enabled',
  { userId, organizationId }
);
if (!isEnabled) throw new ForbiddenException('Feature no disponible');
```

## Cómo usarlo en el frontend

- El SDK expone una función `isFeatureEnabled(key)` que consulta el estado del flag desde la API o desde caché local.
- Los componentes de UI usan el hook `useFeatureFlag(key)` para mostrar o esconder funcionalidades.

## Política de gestión

- Ningún flag nuevo se crea sin documentar su propósito y condición de activación.
- Los flags permanentes (no son temporales de feature en desarrollo) se documentan en el catálogo de flags.
- Los flags de features completadas y ya estables se eliminan del código (no se acumulan indefinidamente).
