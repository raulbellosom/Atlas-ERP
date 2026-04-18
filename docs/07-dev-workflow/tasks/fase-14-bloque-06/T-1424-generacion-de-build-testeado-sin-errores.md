# T-1424 - Generación de build testeado sin errores

## Metadatos
- ID: `T-1424`
- Fase: `Fase 14`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Verificar que el módulo FinOps compila a producción sin errores de TypeScript, sin warnings de Vite y dentro del presupuesto de tamaño de chunk, confirmando que el build de la aplicación web es válido y desplegable.

## Alcance
- Ejecutar `pnpm --filter @atlasrep/web run build` y resolver todos los errores que bloqueen la compilación.
- Verificar que no hay errores de TypeScript en modo strict (`tsc --noEmit`).
- Verificar que los chunks del módulo FinOps no superan los límites configurados en Vite (500 KB gzip por defecto).
- Si algún chunk supera el límite, aplicar lazy loading con `React.lazy` + `Suspense`:
  - `ReconciliationWizardPage` y `BalancePage` son candidatos por su complejidad.
- Verificar que los assets (imágenes, fuentes) se generan correctamente.
- Confirmar que la build de producción funciona contra el API de staging.

## Fuera de alcance
- Optimización de rendimiento avanzada (tree shaking manual, CDN de assets — Fase 15+).
- Build diferencial para navegadores legacy (Fase 15+).

## Dependencias
- `T-1423`: lint y accesibilidad limpios (prerequisito para un build limpio).
- `T-1400` a `T-1422`: todo el módulo implementado.

## Criterios de aceptación
- [x] `pnpm --filter @atlasrep/web run build` sin errores ni warnings de compilación.
- [x] `pnpm --filter @atlasrep/web run typecheck` sin errores.
- [x] Ningún chunk del módulo FinOps supera 500 KB gzip.
- [x] Build de producción probada contra API de staging.

## Validaciones
- `pnpm --filter @atlasrep/web run build`: salida `dist/` generada, 0 errores.
- `pnpm --filter @atlasrep/web run typecheck`: 0 errores TypeScript.
- Revisar salida de Vite: warning "Some chunks are larger than 500 kBs" — si aparece, aplicar lazy loading.
- Iniciar la build con `serve dist/` o `vite preview` y recorrer el módulo manualmente.

## Pruebas
- Abrir `BankAccountsPage` en build de producción — datos cargados correctamente desde API.
- Navegar a `ReconciliationWizardPage` — carga sin error de JS en consola.
- Recargar en ruta `/finops/transfers` — React Router maneja la ruta correctamente (no 404).
- Consola del navegador: 0 errores, 0 warnings de React.

## Riesgos
- **Importaciones circulares**: pueden compilar en desarrollo pero fallar en build optimizado de Vite. Si ocurren, detectar con `vite --debug` y cortar el ciclo.
- **Decimal de Prisma como string**: `balance` y `amount` llegan como strings de Prisma. Si en algún componente se usa directamente como número sin `parseFloat`, TypeScript en strict mode lo detecta en esta task.

## Documentación a actualizar
- No hay archivos nuevos — correcciones inline en los componentes que fallen en el build.

## Decisiones clave
- **Lazy loading solo si necesario**: no se agrega complejidad de `React.lazy` hasta que el build reporta un chunk sobre el límite. El análisis del bundle informa la decisión.
- **Build contra staging, no mocks**: la prueba del build de producción se hace contra el API real de staging con datos demo para validar la integración completa, no contra mocks del frontend.

## Evidencia documental
- No hay archivos nuevos — correcciones inline donde sea necesario.

## Pendientes para la siguiente task
- `T-1425` configura el setup de pruebas E2E con Playwright.

## Pendientes no resueltos
- Ninguno.
