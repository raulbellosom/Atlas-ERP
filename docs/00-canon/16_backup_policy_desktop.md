# PolÃ­tica de Backup â€” App Desktop (SQLite local)

**VersiÃ³n:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-2003 (Fase 20 Bloque 1)

---

## Naturaleza de los datos locales

La app desktop AtlasERP mantiene una **cachÃ© local SQLite** (`atlaserp.db`) que es una rÃ©plica parcial de los datos del servidor. Esta base de datos local:

- **No es la fuente de verdad** â€” la fuente de verdad siempre es el servidor PostgreSQL.
- Contiene datos pendientes de sincronizaciÃ³n (operaciones offline) que **sÃ­ son irrecuperables** si se pierden antes de sincronizar.
- Contiene la cachÃ© de datos del servidor para operar offline.

---

## Estrategia de recuperaciÃ³n

### Fuente primaria de recuperaciÃ³n: Sync Down total

Si un usuario pierde su base de datos local (cambio de PC, corrupciÃ³n de disco, reinstalaciÃ³n):

1. El usuario instala la app desktop en la nueva mÃ¡quina.
2. Inicia sesiÃ³n con sus credenciales.
3. La app ejecuta automÃ¡ticamente un **Sync Down completo** desde el servidor.
4. Los datos del servidor se replican en la nueva base de datos local.
5. El usuario puede operar normalmente en 5-15 minutos (dependiendo del volumen de datos).

**Este es el caso de uso mÃ¡s comÃºn y el que se debe optimizar.**

### Problema: operaciones offline pendientes

Si el usuario tiene operaciones en la cola de sync que **no se han sincronizado** al servidor:

- Estas operaciones **no existen en el servidor** y pueden perderse si se pierde la BD local.
- La app muestra un indicador visible de operaciones pendientes de sync.
- **RecomendaciÃ³n al usuario:** Conectarse y hacer sync antes de apagar la mÃ¡quina si hay operaciones pendientes.

---

## Backup automÃ¡tico local (safety net)

La app desktop crea backups automÃ¡ticos de la BD local antes de operaciones de riesgo:

### CuÃ¡ndo se crea un backup automÃ¡tico

1. Antes de un Sync Down masivo (podrÃ­a sobreescribir datos locales).
2. Antes de una migraciÃ³n de schema SQLite.
3. Al detectar que la BD podrÃ­a estar corrupta (al iniciar la app).

### UbicaciÃ³n del backup

```
Windows: %APPDATA%\atlaserp\backups\atlaserp_YYYY-MM-DD.db
macOS:   ~/Library/Application Support/atlaserp/backups/atlaserp_YYYY-MM-DD.db
Linux:   ~/.local/share/atlaserp/backups/atlaserp_YYYY-MM-DD.db
```

### RetenciÃ³n local

Los backups locales se retienen por **7 dÃ­as** â€” despuÃ©s se borran automÃ¡ticamente para no consumir espacio en disco.

---

## Procedimiento de desvinculaciÃ³n deliberada

Si un usuario deja de usar la app desktop (empresa, cambio de rol, etc.):

1. El administrador revoca el token del dispositivo desde el panel de administraciÃ³n.
2. La app detecta la revocaciÃ³n en el prÃ³ximo intento de sync.
3. La app muestra un aviso al usuario y **borra la BD local automÃ¡ticamente**.
4. El usuario no puede acceder a los datos de la empresa desde ese dispositivo.

Esto previene que datos de la empresa queden almacenados en dispositivos que ya no deberÃ­an tener acceso.

---

## Resumen: flujo de recuperaciÃ³n

| Escenario | SoluciÃ³n |
|----------|---------|
| Cambio de PC sin pendientes de sync | Reinstalar + login + Sync Down automÃ¡tico |
| Cambio de PC con pendientes de sync | Los pendientes se pierden (polÃ­tica: sync antes de cambiar PC) |
| CorrupciÃ³n de BD local | Usar backup local (si hay uno de hoy) o reinstalar + Sync Down |
| PÃ©rdida de la mÃ¡quina | Reinstalar + login + Sync Down |
| DesvinculaciÃ³n deliberada | Admin revoca â†’ app borra BD local |

---

## Lo que NO se respalda en la nube

La BD SQLite local **no se sincroniza a la nube** automÃ¡ticamente. La razÃ³n:
- Los datos ya existen en el servidor PostgreSQL (fuente de verdad).
- Sincronizar la BD local a la nube serÃ­a redundante y aumentarÃ­a los riesgos de seguridad.
- El Sync Down cubre el 99% de los casos de recuperaciÃ³n.

