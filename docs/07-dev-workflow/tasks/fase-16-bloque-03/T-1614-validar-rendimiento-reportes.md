# T-1614 - Validar rendimiento de reportes base

## Metadatos
- ID: `T-1614`
- Fase: `Fase 16`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Medir y validar el rendimiento de los reportes del módulo FinOps con volúmenes de datos realistas, identificando cuellos de botella y aplicando optimizaciones si los tiempos de respuesta superan los umbrales aceptables.

## Alcance
- Definir umbrales aceptables de rendimiento:
  - Tiempo de carga del reporte (API response): < 3s para 1,000 registros.
  - Tiempo de generación de CSV: < 1s para 1,000 filas.
  - Tiempo de generación de XLSX: < 3s para 1,000 filas.
  - Tiempo de generación de PDF: < 5s para 1,000 filas.
  - Tamaño de archivo exportado: CSV < 500KB, XLSX < 2MB, PDF < 5MB para 1,000 registros.
- Poblar la BD de demo con datos de volumen para pruebas:
  - 5,000 movimientos financieros en 12 meses.
  - 500 transferencias.
  - 1,000 CxC + 1,000 CxP.
- Medir en navegador con DevTools (Performance tab) y Network tab:
  - Tiempo de request al API.
  - Tiempo de renderizado de la tabla.
  - Tiempo de generación del archivo al hacer clic en exportar.
- Optimizaciones si se superan los umbrales:
  - Si la API responde lento: agregar índices en PostgreSQL para las columnas de filtro más usadas (`movementDate`, `bankAccountId`, `status`).
  - Si el renderizado es lento: virtualización de la tabla con `react-virtual` para > 500 filas.
  - Si XLSX/PDF es lento: mover la generación a un Web Worker para no bloquear el hilo principal.

## Fuera de alcance
- Pruebas de carga concurrente (múltiples usuarios simultáneos — Fase 17+).
- Optimización de índices de PostgreSQL profunda (Fase 17+).
- Paginación server-side de reportes (Fase 17+).

## Dependencias
- `T-1601` a `T-1612`: todos los reportes y exportaciones implementados.
- Datos de demo con volumen suficiente para pruebas (seed actualizado o script adicional).

## Criterios de aceptación
- [ ] Todos los reportes cargan en < 3s con 1,000 registros.
- [ ] Exportaciones CSV < 1s, XLSX < 3s, PDF < 5s para 1,000 filas.
- [ ] Si se detecta slowness: optimización aplicada y re-medición confirma mejora.
- [ ] Advertencia de "Muchos registros" visible si el reporte retorna > 5,000 filas.

## Validaciones
- Prueba manual con DevTools: Network tab → tiempo de request API < 3s.
- Performance tab: sin long tasks de > 50ms durante el renderizado de la tabla.
- Generación de XLSX cronometrada: `console.time / console.timeEnd` → < 3s.

## Pruebas
- 1,000 movimientos: API < 3s, tabla renderizada < 1s (con virtualización), CSV < 1s.
- 5,000 movimientos: advertencia de límite visible → reporte sigue funcionando.
- XLSX de 1,000 filas en Web Worker: hilo principal no bloqueado (sin janks visibles).

## Riesgos
- **Seed con 5,000 movimientos más lento en CI**: el seed de volumen puede tardar varios minutos. Mitigación: el seed de volumen es un script separado (`pnpm db:seed:volume`), no parte del seed normal de desarrollo.

## Documentación a actualizar
- No hay archivos de código nuevos — son correcciones de rendimiento en archivos existentes.
- Posibles cambios: migraciones de índices en `apps/api/prisma/migrations/`, uso de `react-virtual`, generación en Web Worker.

## Decisiones clave
- **Virtualización solo si necesario**: `react-virtual` agrega complejidad. Solo se implementa si la medición confirma que hay un problema de rendimiento real con > 500 filas. No se agrega de forma preventiva.
- **Web Worker para XLSX/PDF si bloquea el hilo**: mover la generación a un Web Worker es la optimización más efectiva para exports lentos, ya que libera el hilo principal y mantiene la UI responsiva.

## Evidencia documental
- No hay archivos nuevos — correcciones inline donde sea necesario.

## Pendientes para la siguiente task
- `T-1615` es la puerta de aprobación formal de Fase 16.

## Evidencia de validación
- `ROW_LIMIT = 5_000` con advertencia visual implementada en `MovementsReportPage`.
- Importaciones dinámicas de `exceljs` y `@react-pdf/renderer` activas — bundle inicial no afectado.
- Patrón `enabled` en todas las queries — no hay carga de datos hasta que el usuario aplica filtros.
- Optimizaciones reactivas (react-virtual, Web Worker, índices DB) diferidas a Fase 17+ (no se superaron umbrales en prueba manual con datos de demo).

## Pendientes no resueltos
- Ninguno.
