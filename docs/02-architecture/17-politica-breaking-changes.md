# Politica de Breaking Changes Internas

## ID de estrategia
- Task origen: `T-0048`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir que constituye un breaking change, como se gestiona su introduccion, como se comunica y como se protege la estabilidad del sistema y sus consumidores durante la transicion.

## Definicion
Un breaking change es cualquier cambio que requiere modificacion en uno o mas consumidores para que el sistema siga funcionando correctamente. Incluye:
- Eliminar o renombrar un endpoint de la API.
- Eliminar o renombrar un campo en una respuesta o peticion.
- Cambiar el tipo de dato de un campo existente.
- Cambiar la semantica de un parametro (misma firma, distinto comportamiento).
- Eliminar una columna de la base de datos.
- Cambiar el nombre de una tabla o modelo.
- Eliminar un evento del sistema de sync.
- Cambiar el formato de un mensaje de error estructurado.

## Proceso obligatorio para breaking changes

### 1. Identificacion y clasificacion
- El desarrollador identifica el breaking change y lo documenta antes de implementar.
- Si afecta la API publica o el contrato de sync, es automaticamente un cambio de Nivel 3 (requiere ADR).

### 2. Periodo de deprecacion
- Antes de eliminar, el elemento debe pasar por un periodo de deprecacion:
  - Marcar como `@deprecated` en codigo con fecha objetivo de eliminacion.
  - Documentar la alternativa en el mismo lugar.
  - El periodo minimo es de un sprint completo antes de eliminar en staging y dos sprints en produccion.
- Excepcion: si el elemento nunca llego a produccion, puede eliminarse sin periodo de deprecacion.

### 3. Comunicacion
- Registrar el breaking change en el CHANGELOG tecnico del proyecto.
- Notificar a todos los equipos o sistemas que consumen el elemento afectado antes de aplicar el cambio.
- En entornos con clientes desktop: considerar que clientes desconectados pueden tardar en actualizar.

### 4. Migraciones
- Toda eliminacion de columna debe ir precedida de migracion de datos si aplica.
- Las migraciones de breaking change deben probarse en staging con datos reales (o representativos) antes de aplicar en produccion.

### 5. Rollback
- Antes de aplicar un breaking change en produccion, debe existir un plan de rollback documentado.
- Si el rollback requiere restauracion de datos, debe coordinarse con la estrategia de restauracion (`docs/02-architecture/13-estrategia-restauracion.md`).

## Breaking changes en el contexto de sync
- Un breaking change que afecte el protocolo de sync entre servidor y cliente desktop es de maxima criticidad.
- Requiere versionado del protocolo de sync y capacidad de responder a la version anterior durante la transicion.
- La decision de cuantas versiones se soportan simultaneamente se documenta en el ADR correspondiente.

## Restricciones
- Prohibido introducir breaking changes directamente en rama principal sin PR revisada.
- Prohibido introducir breaking changes sin periodo de deprecacion en produccion, salvo emergencia de seguridad.
- Prohibido introducir breaking changes sin actualizar el CHANGELOG tecnico.
