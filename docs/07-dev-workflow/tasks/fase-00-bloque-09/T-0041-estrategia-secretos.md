# T-0041 - Definir estrategia de secretos

## Metadatos
- ID: `T-0041`
- Fase: `Fase 0`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir la politica oficial de manejo de secretos en AtlasERP: que es un secreto, donde vive, como se accede, como se rota y que esta prohibido.

## Alcance
- Definir que constituye un secreto en el proyecto.
- Definir donde viven los secretos por ambiente (dev, staging, prod).
- Definir categorias de secretos por aplicacion y su owner.
- Definir politica minima de rotacion.
- Definir restricciones de codigo relacionadas a secretos.

## Fuera de alcance
- Implementacion de gestor de secretos (Vault, Doppler, etc.) en infraestructura real.
- Configuracion concreta de CI/CD secrets (se delega a Fase 3 y Fase 4).
- Gestion de certificados TLS (tema separado de infra).

## Dependencias
- `T-0040` cerrada (estrategia de environment variables, que separa configuracion de secretos).

## Criterios de aceptacion
- [x] Definicion oficial de secreto documentada.
- [x] Principios de no exposicion documentados.
- [x] Donde viven los secretos por ambiente documentado.
- [x] Categorias de secretos por aplicacion documentadas.
- [x] Politica de rotacion minima documentada.
- [x] Restricciones de codigo documentadas.

## Validaciones
- Coherencia con la estrategia de environment variables (`T-0040`).
- Los secretos no se cruzan con variables de configuracion publica.

## Pruebas
- Prueba documental: verificar que ningun `.env.example` contiene valores reales de secretos.
- Prueba de revision: los `.gitignore` deben excluir archivos `.env.local` y equivalentes.

## Riesgos
- Sin politica de secretos, se eleva el riesgo de exposicion accidental en git o en logs.
- Rotacion no planificada puede causar downtime si las apps no estan preparadas.

## Documentacion a actualizar
- `docs/02-architecture/11-estrategia-secretos.md`
- `docs/02-architecture/README.md`

## Decisiones clave
- Ningun secreto en repositorio, ni en texto plano ni cifrado con clave en el mismo repo.
- Gestor de secretos externo obligatorio en produccion.
- Acceso minimo necesario por rol de servicio.

## Evidencia documental
- `docs/02-architecture/11-estrategia-secretos.md`

## Pendientes para la siguiente task
- Iniciar `T-0042` (estrategia de backup minima obligatoria).

## Pendientes no resueltos
- Ninguno.
