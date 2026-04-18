# Politica de Cambios Retrocompatibles

## ID de estrategia
- Task origen: `T-0047`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir que es un cambio retrocompatible, cuando aplica y como se gestiona para que los modulos, clientes y consumidores existentes no se rompan al aplicar el cambio.

## Definicion
Un cambio es retrocompatible cuando:
- Los consumidores existentes del sistema (otras apps, modulos, clientes desktop/web) siguen funcionando sin modificacion tras aplicarlo.
- No elimina ni modifica el contrato publico existente (endpoints, campos de respuesta, nombres de modelos, estructura de eventos).
- Solo agrega capacidades nuevas o corrige comportamiento sin alterar el esperado.

## Ejemplos de cambios retrocompatibles
- Agregar un campo nuevo opcional a un endpoint de respuesta JSON.
- Agregar un endpoint nuevo que no reemplaza a uno existente.
- Agregar una columna nullable a una tabla de base de datos.
- Agregar un valor nuevo a un enum sin eliminar los existentes.
- Corregir un bug donde el comportamiento correcto ya era el esperado.
- Agregar una dependencia nueva sin remover ni cambiar API de dependencias existentes.

## Proceso para cambios retrocompatibles

### Revision requerida
- Revision de par (Nivel 2): un segundo desarrollador revisa la PR antes del merge.
- No requiere ADR salvo que afecte a multiples modulos o cambie una convencion de naming.

### Documentacion requerida
- Actualizar `.env.example` si se agrega nueva variable de configuracion.
- Actualizar el blueprint del modulo si se agrega campo o endpoint nuevo.
- El commit debe seguir la convencion del proyecto (feat, fix, etc.).

### Migraciones de base de datos
- Las migraciones retrocompatibles deben poder aplicarse sin downtime (columnas nullable, indices nuevos en background).
- Nunca renombrar una columna directamente en produccion: agregar la nueva, migrar datos, deprecar la vieja en siguiente ciclo.

## Retrocompatibilidad en el contexto de sync
- Un cambio en el schema que afecte campos sincronizados entre servidor y cliente desktop requiere revision explicita de la politica de sync del modulo afectado.
- El servidor debe poder responder a clientes con version anterior por al menos un ciclo de release.

## Restricciones
- No marcar un cambio como retrocompatible si elimina un campo aunque sea "sin uso aparente" (puede estar en uso en clientes desconectados).
- No asumir retrocompatibilidad en campos de tipo fecha o enum sin verificar todos los consumidores.
