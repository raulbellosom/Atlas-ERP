# Decisión Oficial: Monorepo

## ID de decisión
- Task origen: `T-0011`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Decisión
AtlasERP adopta **monorepo** como estructura oficial para v1.

## Justificación
- Facilita consistencia entre backend, web, desktop y paquetes compartidos.
- Reduce fricción en contratos compartidos de dominio, sync y validaciones.
- Permite gobernanza centralizada de estándares, documentación y calidad.

## Implicaciones
- El repositorio debe organizar apps y paquetes bajo una estructura única.
- Las decisiones de tooling y CI/CD deben asumir contexto de monorepo.
- La evolución modular se realiza dentro del mismo repositorio sin fragmentación temprana.

## Restricciones
- No dividir en multi-repo durante v1 sin decisión de governance formal.

