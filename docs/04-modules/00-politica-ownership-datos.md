# Política de Ownership de Datos

## ID de política
- Task origen: `T-0016`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Política oficial
Toda entidad de AtlasERP debe tener un módulo dueño explícito y reglas claras de lectura, edición, sincronización y auditoría.

## Reglas obligatorias
- Cada entidad declara un `módulo dueño` único.
- Los módulos no dueños pueden consumir datos solo por contrato definido.
- Ningún módulo no dueño puede redefinir la entidad fuente.
- La política offline/sync de cada entidad debe declararse de forma explícita.
- Toda entidad crítica debe tener estrategia de auditoría definida.

## Matriz mínima por entidad
Cada entidad debe documentar:
- módulo dueño
- lectores autorizados
- editores autorizados
- si puede existir offline
- cómo se sincroniza
- cómo se audita

## Restricciones
- No crear entidades nuevas sin ownership definido.
- No permitir escritura transversal sin contrato y permisos explícitos.

