/**
 * TransferReceiptPdf — Comprobante PDF de transferencia entre cuentas.
 *
 * Genera un PDF tamaño carta con:
 *  - Encabezado: AtlasERP + nombre de org + fecha de generación.
 *  - Sección de datos: cuenta origen, cuenta destino, monto, moneda,
 *    fecha, notas, estatus, aprobado por.
 *  - Footer paginado.
 *
 * Usa React.createElement (sin JSX) para compatibilidad con .js sin Babel JSX.
 *
 * Task origen: T-1611 (Fase 16 Bloque 3)
 */

import React from "react";

const STATUS_LABELS = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  VOIDED: "Anulada",
};

const STATUS_COLORS = {
  PENDING: "#92400E",
  APPROVED: "#166534",
  REJECTED: "#991B1B",
  VOIDED: "#374151",
};

function fmtMoney(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount ?? "0"));
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function maskAccount(num) {
  if (!num) return "—";
  return `****${String(num).slice(-4)}`;
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const COLORS = {
  primary: "#1E3A5F",
  text: "#1A1A2E",
  secondary: "#555770",
  border: "#D1D5DB",
  bg: "#F4F6F8",
  white: "#FFFFFF",
};

const styles = {
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: COLORS.white },
  headerBox: { backgroundColor: COLORS.primary, padding: "16 20", marginBottom: 20, borderRadius: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.white },
  headerSub: { fontSize: 9, color: "#A0B4CC", marginTop: 4 },
  sectionTitle: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1,
    color: COLORS.secondary, marginBottom: 8, marginTop: 16, borderBottom: `1 solid ${COLORS.border}`,
    paddingBottom: 4 },
  fieldRow: { flexDirection: "row", marginBottom: 8 },
  fieldLabel: { width: 140, fontSize: 9, color: COLORS.secondary, fontWeight: "bold" },
  fieldValue: { flex: 1, fontSize: 10, color: COLORS.text },
  // Transfer arrow diagram
  transferBox: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.bg,
    padding: "12 16", borderRadius: 4, marginBottom: 16 },
  transferAccount: { flex: 1, alignItems: "center" },
  transferAccountLabel: { fontSize: 8, color: COLORS.secondary, textTransform: "uppercase",
    letterSpacing: 0.5, marginBottom: 4 },
  transferAccountName: { fontSize: 11, fontWeight: "bold", color: COLORS.text, textAlign: "center" },
  transferAccountNum: { fontSize: 9, color: COLORS.secondary, fontFamily: "Courier", marginTop: 2 },
  transferArrow: { fontSize: 20, color: COLORS.primary, paddingHorizontal: 12 },
  amountCenter: { alignItems: "center", paddingHorizontal: 16 },
  amountValue: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
  amountCurrency: { fontSize: 9, color: COLORS.secondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3, marginTop: 4,
    alignSelf: "flex-start" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    borderTop: `1 solid ${COLORS.border}`, paddingTop: 8 },
  footerText: { fontSize: 8, color: COLORS.secondary },
};

/**
 * Construye el documento PDF para una transferencia.
 *
 * @param {object} opts
 * @param {object} opts.transfer          — Datos de la transferencia
 * @param {string} [opts.fromAccountName] — Nombre cuenta origen
 * @param {string} [opts.toAccountName]   — Nombre cuenta destino
 * @param {string} [opts.approvedByName]  — Nombre del aprobador (resuelto antes de llamar)
 * @param {string} [opts.orgName]         — Nombre de la organización
 * @param {object} pdfLib                 — Destructured { Document, Page, View, Text }
 * @returns {React.Element} — <Document>
 */
export function buildTransferReceiptDocument(opts, pdfLib) {
  const {
    transfer,
    fromAccountName = "—",
    toAccountName = "—",
    approvedByName,
    orgName = "AtlasERP",
  } = opts;

  const { Document, Page, View, Text } = pdfLib;

  const statusColor = STATUS_COLORS[transfer.status] ?? COLORS.text;
  const statusLabel = STATUS_LABELS[transfer.status] ?? transfer.status ?? "—";
  const amount = fmtMoney(transfer.amount, transfer.currencyCode ?? transfer.currency);
  const generatedAt = new Date().toLocaleDateString("es-MX", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

  return React.createElement(
    Document,
    { title: `Comprobante transferencia ${transfer.reference ?? transfer.id}` },
    React.createElement(
      Page,
      { size: "LETTER", style: styles.page },

      // ── Header ──
      React.createElement(
        View,
        { style: styles.headerBox },
        React.createElement(Text, { style: styles.headerTitle }, "Comprobante de transferencia"),
        React.createElement(Text, { style: styles.headerSub }, `${orgName}  ·  Generado: ${generatedAt}`),
      ),

      // ── Diagrama de transferencia ──
      React.createElement(
        View,
        { style: styles.transferBox },
        // Cuenta origen
        React.createElement(
          View,
          { style: styles.transferAccount },
          React.createElement(Text, { style: styles.transferAccountLabel }, "Origen"),
          React.createElement(Text, { style: styles.transferAccountName }, fromAccountName),
          React.createElement(Text, { style: styles.transferAccountNum },
            maskAccount(transfer.fromAccountNumber ?? transfer.fromBankAccount?.accountNumber)),
        ),
        // Monto central
        React.createElement(
          View,
          { style: styles.amountCenter },
          React.createElement(Text, { style: styles.transferArrow }, "→"),
          React.createElement(Text, { style: styles.amountValue }, amount),
          React.createElement(Text, { style: styles.amountCurrency },
            transfer.currencyCode ?? transfer.currency ?? "MXN"),
        ),
        // Cuenta destino
        React.createElement(
          View,
          { style: styles.transferAccount },
          React.createElement(Text, { style: styles.transferAccountLabel }, "Destino"),
          React.createElement(Text, { style: styles.transferAccountName }, toAccountName),
          React.createElement(Text, { style: styles.transferAccountNum },
            maskAccount(transfer.toAccountNumber ?? transfer.toBankAccount?.accountNumber)),
        ),
      ),

      // ── Estado ──
      React.createElement(
        View,
        { style: { flexDirection: "row", alignItems: "center", marginBottom: 16 } },
        React.createElement(Text, { style: { fontSize: 9, color: COLORS.secondary, marginRight: 8 } }, "Estado:"),
        React.createElement(
          View,
          { style: { ...styles.statusBadge, backgroundColor: `${statusColor}20` } },
          React.createElement(Text, { style: { fontSize: 9, fontWeight: "bold", color: statusColor } }, statusLabel),
        ),
      ),

      // ── Datos de la transferencia ──
      React.createElement(Text, { style: styles.sectionTitle }, "Datos de la operación"),
      ...[
        ["Fecha", fmtDate(transfer.transferDate ?? transfer.occurredAt ?? transfer.createdAt)],
        ["Referencia", transfer.reference ?? transfer.externalReference],
        ["Moneda", transfer.currencyCode ?? transfer.currency ?? "MXN"],
        ...(approvedByName || transfer.approvedAt
          ? [
              ["Aprobado por", approvedByName ?? "—"],
              ["Fecha aprobación", fmtDate(transfer.approvedAt)],
            ]
          : []),
        ...(transfer.notes ? [["Notas", transfer.notes]] : []),
        ...(transfer.description ? [["Descripción", transfer.description]] : []),
      ].map(([label, value]) =>
        React.createElement(
          View,
          { style: styles.fieldRow, key: label },
          React.createElement(Text, { style: styles.fieldLabel }, label),
          React.createElement(Text, { style: styles.fieldValue }, value || "—"),
        ),
      ),

      // ── Footer ──
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerText }, "Generado por AtlasERP"),
        React.createElement(Text, { style: styles.footerText },
          `Ref: ${transfer.reference ?? transfer.id ?? "—"}`),
        React.createElement(Text, {
          style: styles.footerText,
          render: ({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`,
        }),
      ),
    ),
  );
}

/**
 * Descarga el comprobante PDF de la transferencia directamente.
 *
 * @param {object} opts — Ver buildTransferReceiptDocument
 * @param {string} [filename] — Nombre de archivo sin extensión
 */
export async function downloadTransferReceipt(opts, filename) {
  const pdfLib = await import("@react-pdf/renderer");
  const { Document, Page, View, Text, pdf } = pdfLib;

  const doc = buildTransferReceiptDocument(opts, { Document, Page, View, Text });
  const blob = await pdf(doc).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename ?? `comprobante-transferencia-${opts.transfer?.reference ?? opts.transfer?.id ?? "sin-ref"}`}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
