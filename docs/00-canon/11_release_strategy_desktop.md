# Estrategia de Release del Desktop â€” AtlasERP

**VersiÃ³n:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-1919 (Fase 19 Bloque 4)

---

## VisiÃ³n general

La app desktop AtlasERP (Tauri 2.0 + React 19 + Rust) se distribuye como un instalador nativo de Windows (`.msi`). A diferencia del backend y el frontend web, **la app desktop no se actualiza automÃ¡ticamente con cada merge a `main`** â€” los releases son deliberados y coordinados.

---

## Cadencia de releases

| Tipo | Frecuencia | Ejemplo |
|------|-----------|---------|
| Release mayor | Al lanzar funcionalidad significativa | `desktop-v2.0.0` |
| Release menor | Al completar un bloque de features | `desktop-v1.1.0` |
| Hotfix | Ante bugs crÃ­ticos | `desktop-v1.0.1` |

El equipo decide cuÃ¡ndo hacer un release de desktop. **No es automÃ¡tico.**

---

## Ciclo de vida de un release de desktop

### 1. PreparaciÃ³n

1. Asegurarse de que el backend es compatible con la versiÃ³n del frontend incluida en el instalador.
2. Actualizar la versiÃ³n en `apps/desktop/src-tauri/tauri.conf.json` â†’ campo `package.version`.
3. Actualizar `CHANGELOG.md` con los cambios del release.
4. Probar el instalador localmente: `pnpm --filter @atlaserp/desktop run tauri build`.

### 2. Crear el tag de release

```bash
git tag desktop-v1.2.3
git push origin desktop-v1.2.3
```

El workflow `build-desktop.yml` se dispara automÃ¡ticamente y:
1. Compila el frontend web incluido en el desktop.
2. Compila el cÃ³digo Rust (Tauri backend).
3. Genera el instalador `.msi` y `.exe` NSIS.
4. Publica los archivos como release en GitHub.

### 3. DistribuciÃ³n a usuarios

**En v1:** DistribuciÃ³n directa desde GitHub Releases.
- Los usuarios descargan el instalador desde la pÃ¡gina de releases.
- Para actualizar: desinstalar la versiÃ³n anterior e instalar la nueva.

**En el futuro (Fase 22+):** Tauri Updater automÃ¡tico.

---

## Compatibilidad con el backend

La app desktop incluye cÃ³digo frontend que consume la API del backend. PolÃ­tica de compatibilidad:

| Desktop version | Compatible con backend |
|-----------------|----------------------|
| `desktop-v1.x.x` | `v1.x.x` (mismo major) |
| `desktop-v2.x.x` | `v2.x.x` (mismo major) |

El backend mantiene compatibilidad con la versiÃ³n desktop activa durante **al menos 60 dÃ­as** tras un release de backend que incluya breaking changes. Esto da tiempo a los usuarios para actualizar su app desktop.

Si el backend tiene un cambio incompatible con versiones anteriores del desktop:
1. Publicar un release de desktop **antes** del release de backend, o
2. Versionar el API (`/api/v2/`) para que ambas versiones coexistan.

---

## Infraestructura de distribuciÃ³n

```
GitHub Releases
â””â”€â”€ desktop-v1.2.3
    â”œâ”€â”€ AtlasERP_1.2.3_x64_en-US.msi     (instalador MSI)
    â””â”€â”€ AtlasERP_1.2.3_x64-setup.exe     (instalador NSIS)
```

**Stub del Tauri Updater (para preparaciÃ³n futura):**

En `apps/desktop/src-tauri/tauri.conf.json`, la secciÃ³n `updater` puede configurarse para apuntar a un endpoint JSON que describe la Ãºltima versiÃ³n disponible:

```json
{
  "updater": {
    "active": false,
    "dialog": true,
    "pubkey": "",
    "endpoints": [
      "https://releases.atlaserp.com/desktop/{{target}}/{{arch}}/{{current_version}}"
    ]
  }
}
```

En v1: `active: false`. En Fase 22+ se activarÃ¡ con el endpoint real y la clave de firma.

---

## Rollback

Si una versiÃ³n del desktop tiene un bug crÃ­tico:

1. Marcar el release en GitHub como "pre-release" o eliminarlo.
2. Publicar un hotfix con versiÃ³n `desktop-v1.2.4`.
3. Comunicar a los usuarios el procedimiento:
   - Desinstalar la versiÃ³n defectuosa desde "Agregar o quitar programas".
   - Descargar e instalar el hotfix desde GitHub Releases.
4. Documentar el incidente en el log de incidentes del proyecto.

---

## Firma de cÃ³digo

**Estado en v1:** Sin firma de cÃ³digo.

Windows mostrarÃ¡ "Editor desconocido" al instalar. Los usuarios deben ignorar el aviso y confirmar la instalaciÃ³n.

**Cuando se adquiera el certificado de firma (EV Code Signing Certificate):**
1. Agregar el certificado a GitHub Secrets: `WINDOWS_CERTIFICATE` (base64) y `WINDOWS_CERTIFICATE_PASSWORD`.
2. Actualizar `build-desktop.yml` con el paso de firma antes del upload.
3. Windows ya no mostrarÃ¡ la advertencia.

---

## Referencias

- Workflow de build: `.github/workflows/build-desktop.yml`
- GuÃ­a de release: `docs/07-dev-workflow/release-desktop-guide.md`
- Estrategia de ambientes: `docs/07-dev-workflow/environments.md`
- Backend release strategy: `docs/00-canon/10_release_strategy_backend.md`

