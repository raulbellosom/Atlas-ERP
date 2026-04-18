# T-0608 - Configurar validation pipe global

## Metadatos
- ID: `T-0608`
- Fase: `Fase 6`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Configurar el `ValidationPipe` global de NestJS para validar automaticamente los DTOs de entrada en todos los endpoints, rechazando payloads invalidos o con propiedades no declaradas.

## Criterios de aceptacion
- [x] `ValidationPipe` registrado globalmente en `main.ts`.
- [x] `whitelist: true` — elimina propiedades sin decoradores del DTO.
- [x] `forbidNonWhitelisted: true` — error 400 si llegan propiedades desconocidas.
- [x] `transform: true` — convierte el payload al tipo de clase del DTO.
- [x] `enableImplicitConversion: true` — convierte strings a number/boolean segun tipo TS.
- [x] lint ✅ · typecheck ✅ · build ✅

## Archivos modificados
- `apps/api/src/main.ts` — `app.useGlobalPipes(new ValidationPipe(...))`

## Configuracion aplicada

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

## Comportamiento con DTOs

```typescript
// DTO de ejemplo:
class CreateUserDto {
  @IsString() @MinLength(2)
  nombre: string;

  @IsEmail()
  email: string;
}

// Request con campo extra:
POST /api/users { "nombre": "Juan", "email": "j@e.com", "admin": true }
→ 400 Bad Request: "property admin should not exist"

// Request con campo invalido:
POST /api/users { "nombre": "J", "email": "no-es-email" }
→ 400 Bad Request: "nombre must be longer than or equal to 2 characters"

// Request correcto:
POST /api/users { "nombre": "Juan", "email": "juan@empresa.com" }
→ 201 Created
```

## Dependencias
- `class-validator` — decoradores de validacion (`@IsString`, `@IsEmail`, etc.)
- `class-transformer` — transformacion de tipos (`@Transform`, `@Type`)
- Ambas ya estaban instaladas desde T-0604 (env.validation.ts).

## Pendientes no resueltos
- DTOs concretos de cada modulo — se crean en Fase 7+ al implementar endpoints de negocio.
