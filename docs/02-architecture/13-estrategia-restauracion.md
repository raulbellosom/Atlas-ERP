# Estrategia de Restauracion Minima Obligatoria

## ID de estrategia
- Task origen: `T-0043`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir como se restaura el sistema ante perdida de datos o fallo critico, incluyendo objetivos de tiempo y punto de recuperacion, procedimientos minimos y quien autoriza la restauracion.

## Objetivos de recuperacion

| Indicador | Produccion | Staging |
|-----------|-----------|---------|
| **RPO** (Recovery Point Objective - maximo de datos que se puede perder) | 24 horas | 7 dias |
| **RTO** (Recovery Time Objective - maximo tiempo para volver operativo) | 4 horas | 24 horas |

Estos son objetivos minimos de governance. La implementacion puede mejorarlos pero nunca degradarlos sin aprobacion explícita.

## Escenarios de restauracion cubiertos

1. **Perdida total del servidor de base de datos**: restaurar desde ultimo backup full de PostgreSQL.
2. **Corrupcion parcial de datos**: restaurar a punto en el tiempo (point-in-time recovery) con WAL de PostgreSQL.
3. **Perdida de archivos en MinIO**: restaurar desde backup del bucket correspondiente.
4. **Perdida de configuracion critica**: restaurar desde backup de configuracion.
5. **Fallo del entorno completo (servidor caido)**: levantar infraestructura desde Docker Compose + restaurar datos.

## Procedimiento minimo de restauracion PostgreSQL

1. Identificar el punto de restauracion objetivo (fecha/hora o ultimo backup disponible).
2. Levantar instancia PostgreSQL limpia (vacia).
3. Restaurar backup full mas reciente anterior al punto objetivo.
4. Aplicar WAL hasta el punto objetivo si se usa point-in-time recovery.
5. Verificar integridad: contar registros clave, verificar ultimas transacciones conocidas.
6. Reconectar aplicaciones al nuevo servidor.
7. Auditar y documentar la restauracion: quien, cuando, motivo, resultado.

## Procedimiento minimo de restauracion MinIO

1. Identificar bucket y prefijo de archivos afectados.
2. Restaurar desde backup de archivos a instancia de MinIO limpia o en la misma.
3. Verificar checksums de archivos criticos si estan disponibles.
4. Documentar la restauracion.

## Autorizacion
- Restauracion en staging: puede ejecutarla DevOps sin autorizacion adicional.
- Restauracion en produccion: requiere autorizacion explicita del responsable tecnico del proyecto.
- Toda restauracion en produccion debe auditarse con: quien autorizo, quien ejecuto, ventana de tiempo, impacto.

## Prueba de restauracion obligatoria
- Frecuencia minima: una prueba completa de restauracion por sprint (o al menos mensual) en staging.
- La prueba debe cubrir: restaurar desde backup reciente, verificar integridad de datos, documentar resultado.
- Si la prueba falla, se abre incidente critico antes de continuar con desarrollo normal.

## Restricciones
- Nunca restaurar en produccion sin prueba previa del mismo backup en staging o entorno de prueba.
- Nunca sobrescribir datos activos de produccion sin confirmacion explicita de autorizacion.
- La restauracion no exime de investigar la causa raiz del incidente.
