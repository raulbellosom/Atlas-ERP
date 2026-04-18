# Estrategia de Revision de Tasks Generadas por IA

## ID de estrategia
- Task origen: `T-0046`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir como se revisan, validan y aprueban las tasks, documentos y codigo generados con asistencia de IA (Codex, Claude, Copilot u equivalentes), garantizando que la salida sea correcta, coherente con el canon y apta para el proyecto.

## Principio base
La IA es un asistente de produccion acelerada, no una fuente de verdad independiente. Todo lo que genere debe pasar por revision humana antes de considerarse parte oficial del proyecto.

## Que requiere revision

### Siempre requiere revision humana
- Documentos de governance, canon o blueprint generados por IA.
- Tasks cerradas por IA (verificar criterios de aceptacion reales, no solo marcados).
- Codigo fuente generado por IA antes de fusionar a rama principal.
- ADRs redactados con asistencia de IA.
- Cualquier decision de Nivel 3 o superior tomada con apoyo de IA.

### Puede aceptarse con revision ligera
- Plantillas o boilerplate sin logica de negocio.
- Comentarios de codigo en funciones simples.
- Actualizacion de indices o READMEs de seccion.
- Renombrado de archivos o reorganizacion de carpetas segun instruccion explicita.

## Checklist de revision minima para documentos generados por IA

- [ ] El contenido es coherente con el canon (`docs/00-canon/*`).
- [ ] No contradice decisiones de arquitectura registradas (`docs/02-architecture/*`).
- [ ] El idioma es espanol de Mexico, sin mojibake ni caracteres corruptos.
- [ ] La codificacion del archivo es UTF-8.
- [ ] Los nombres de archivos siguen kebab-case sin espacios.
- [ ] No hay contenido inventado (referencias a tasks, archivos o sistemas que no existen).
- [ ] Los criterios de aceptacion estan realmente cumplidos, no solo marcados.

## Checklist de revision minima para codigo generado por IA

- [ ] No introduce vulnerabilidades de seguridad (inyeccion, XSS, exposicion de secretos).
- [ ] Sigue las convenciones de naming del proyecto.
- [ ] No introduce dependencias nuevas sin justificacion y revision de Nivel 2.
- [ ] Pasa el linter y el typecheck del proyecto.
- [ ] Incluye pruebas donde la task lo requiere.
- [ ] No rompe interfaces existentes sin documentarlo.

## Responsable de la revision
- El desarrollador o lider tecnico que solicito la generacion es el responsable de revisar y aprobar la salida.
- No es valido cerrar una task como completada si solo la IA la marco como tal sin revision humana.

## Frecuencia y momento de revision
- La revision ocurre antes de cerrar la task, no despues.
- Para codigo: en la PR, antes del merge.
- Para documentos: antes de actualizar el catalogo maestro como CERRADA.

## Restriccion importante
- La IA no puede auto-aprobar tasks de Nivel 3 o 4.
- La IA no puede modificar el canon sin instruccion explicita y revision posterior.
