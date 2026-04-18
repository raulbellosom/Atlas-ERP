/**
 * useReportAudit — Hook para registrar eventos de exportación de reportes.
 *
 * Implementa una llamada fire-and-forget a POST /api/v1/audit/log.
 * Si el endpoint falla, el error se silencia — la exportación nunca se bloquea.
 *
 * Uso:
 *   const { logExport } = useReportAudit();
 *   logExport({ reportName: 'MovementsReport', format: 'PDF', filters, rowCount: rows.length });
 *
 * Task origen: T-1613 (Fase 16 Bloque 3)
 * Decisión: auditoría en frontend (el backend no genera los archivos — client-side export).
 */

import { useCallback } from "react";
import { apiClient } from "@/api/client";
import useAuthStore from "@/store/auth.store";

/**
 * @typedef {object} ReportAuditPayload
 * @property {string} reportName  — Identificador del reporte (ej. 'MovementsReport')
 * @property {'PDF'|'XLSX'|'CSV'|'PRINT'} format — Formato de exportación
 * @property {object} [filters]   — Filtros activos al momento de la exportación
 * @property {number} [rowCount]  — Número de filas exportadas
 */

export function useReportAudit() {
  const user = useAuthStore((s) => s.user);

  const logExport = useCallback(
    /** @param {ReportAuditPayload} payload */
    ({ reportName, format, filters = {}, rowCount = 0 }) => {
      // Fire-and-forget: no await, errores silenciados
      apiClient
        .post("/v1/audit/log", {
          action: "REPORT_EXPORTED",
          entityType: "FinOpsReport",
          entityId: reportName,
          metadata: {
            format,
            rowCount,
            // Solo guardar IDs en filtros, no nombres, para evitar PII en el log
            from: filters.from ?? null,
            to: filters.to ?? null,
            bankAccountId: filters.bankAccountId ?? null,
            bankAccountIds: filters.bankAccountIds ?? null,
            types: filters.types ?? null,
            statuses: filters.statuses ?? null,
            currency: filters.currency ?? null,
          },
          performedBy: user?.id ?? null,
        })
        .catch(() => {
          // Silenciar — auditoría no bloquea exportación
        });
    },
    [user?.id],
  );

  return { logExport };
}
