# T-0208 - Crear documento canon de environments

## Metadatos
- ID: `T-0208`
- Fase: `Fase 2`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Crear el documento canon que define la estrategia oficial de ambientes del proyecto (development, test, staging, production).

## Alcance
- Definir los cuatro ambientes oficiales y su propósito.
- Definir la separación de servicios por ambiente.
- Definir la política de progresión de código entre ambientes.
- Referenciar estrategias relacionadas (env vars, secretos, CI/CD).

## Fuera de alcance
- Configuración concreta de herramientas de CI/CD (Fase 4).
- Scripts de bootstrap por ambiente (Fase 3).

## Dependencias
- `T-0040` cerrada (estrategia de environment variables).
- `T-0041` cerrada (estrategia de secretos).

## Criterios de aceptación
- [x] Cuatro ambientes definidos con propósito y quién los usa.
- [x] Separación de servicios por ambiente documentada.
- [x] Política de progresión unidireccional documentada.
- [x] Referencias a estrategias relacionadas presentes.
- [x] Codificación UTF-8, idioma español de México.

## Documentación a actualizar
- `docs/00-canon/07_environments.md` (nuevo)

## Evidencia documental
- `docs/00-canon/07_environments.md`

## Pendientes para la siguiente task
- Iniciar `T-0209` (canon de CI/CD y despliegue).

## Pendientes no resueltos
- Ninguno.
