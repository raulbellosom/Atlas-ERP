# T-0714 - Implementar middleware/auditoria de request

## Metadatos
- ID: `T-0714`
- Fase: `Fase 7`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Crear un NestJS interceptor global que loguee las peticiones HTTP mutantes de usuarios autenticados en el AuditLog.

## Alcance
- Crear `apps/api/src/common/interceptors/request-audit.interceptor.ts`:
  - `@Injectable() export class RequestAuditInterceptor implements NestInterceptor`
  - Solo actua para metodos mutantes: POST, PUT, PATCH, DELETE.
  - Solo para usuarios autenticados (req.user.sub disponible).
  - Omite rutas @Public.
  - Usa rxjs tap() para loguear despues de que el handler resuelve (tanto en exito como en error).
  - Registra: action=`HTTP_{METHOD}`, entityType=`Request`, entityId=path, result=statusCode, metadata={method,path,statusCode,durationMs}.
  - Errores de auditoria se capturan y loguean via Logger sin propagar.
- Registrar como APP_INTERCEPTOR en AppModule.
- `AuditService.auditAction()` ya estaba implementado en T-0618.

## Resultados
- POST /v1/users/:id/lock crea entrada en AuditLog con action: HTTP_POST.
- GET /v1/audit/logs retorna la entrada con result: "201".
- Errores no bloquean la respuesta al usuario.

## Criterios de aceptacion
- [x] RequestAuditInterceptor registrado como APP_INTERCEPTOR.
- [x] POST mutantes de usuarios autenticados generan entradas en AuditLog.
- [x] GET y rutas @Public no generan entradas.
- [x] durationMs registrado en metadata.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Auditoria de contenido del body (datos sensibles no deben loguearse).
- Auditoria de respuestas (solo se loguea el statusCode).

## Dependencias
- T-0714 depende de AuditService.auditAction() (implementado en T-0618/Fase 6).

## Pendientes no resueltos
- Ninguno.
