# T-1600 - Definir reportes mínimos de v1

## Metadatos
- ID: `T-1600`
- Fase: `Fase 16`
- Bloque: `Bloque 1`
- Estado: `open`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Definir y documentar el catálogo de reportes mínimos para la versión 1 del módulo FinOps, estableciendo qué reportes existen, qué datos incluye cada uno, qué filtros soportan y en qué formatos se pueden exportar.

## Alcance
- Producir el documento `docs/02-architecture/16-catalogo-reportes-finops-v1.md` con:
  - Tabla de reportes: nombre, entidad origen, filtros disponibles, formatos de exportación.
  - Catálogo de reportes mínimos aprobados para v1:
    1. Movimientos por rango de fechas (T-1601)
    2. Movimientos por cuenta bancaria (T-1602)
    3. Saldos por cuenta / resumen global (T-1603)
    4. Transferencias por periodo (T-1604)
    5. Cuentas por cobrar (T-1605)
    6. Cuentas por pagar (T-1606)
  - Formatos de exportación soportados: CSV, XLSX, PDF.
  - Formatos excluidos de v1: OFX/QIF, XML, JSON estructurado (Fase 17+).
  - Definición de los campos comunes a todos los reportes: organización, periodo, generado por, fecha de generación.
- Registrar la decisión de arquitectura: los reportes se generan en el frontend (client-side rendering) usando los datos ya disponibles via react-query, sin un endpoint de reporte dedicado en el backend para v1.

## Fuera de alcance
- Implementación de los reportes (T-1601 a T-1615).
- Reportes programados o por email (Fase 17+).
- Dashboard de métricas en tiempo real (Fase 17+).

## Dependencias
- `T-1426`: Fase 14 completa — todos los endpoints de datos disponibles.
- `T-1516`: Fase 15 completa — contexto de qué datos hay disponibles en desktop.

## Criterios de aceptación
- [ ] Catálogo de reportes v1 documentado con 6 reportes definidos.
- [ ] Formatos de exportación y sus restricciones documentados.
- [ ] Decisión de generación client-side documentada con justificación.

## Validaciones
- Revisión manual: el catálogo responde "¿qué reporte necesito para X?" para los casos de uso financieros básicos.

## Pruebas
- No aplica prueba automatizada — es un documento de decisión.

## Riesgos
- **Scope creep en la definición**: agregar reportes a "la lista mínima" puede inflar el alcance de Fase 16 indefinidamente. La lista se cierra con los 6 reportes definidos. Nuevos reportes van a Fase 17+.

## Documentación a actualizar
- `docs/02-architecture/16-catalogo-reportes-finops-v1.md` — archivo nuevo.

## Decisiones clave
- **Generación client-side**: los reportes v1 se generan en el cliente (navegador o Tauri) procesando los datos de react-query. Esto evita crear endpoints de reporte dedicados en el backend y permite iterar rápido. El costo es que reportes muy grandes (> 50,000 filas) pueden ser lentos — se mitigará con advertencia de límite si aplica.
- **6 reportes = v1 completo**: movimientos (por rango y por cuenta), saldos, transferencias, CxC y CxP. Estos 6 cubren los casos de uso financieros diarios del tesorero.

## Evidencia documental
- `docs/02-architecture/16-catalogo-reportes-finops-v1.md`

## Pendientes para la siguiente task
- `T-1601` implementa el primer reporte: movimientos por rango de fechas.

## Pendientes no resueltos
- Ninguno.
