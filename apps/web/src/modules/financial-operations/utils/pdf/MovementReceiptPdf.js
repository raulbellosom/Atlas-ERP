/**
 * MovementReceiptPdf — Comprobante PDF de movimiento financiero individual.
 *
 * Genera un PDF tamaño carta con:
 *  - Encabezado: AtlasERP + nombre de org + fecha de generación.
 *  - Sección de datos del movimiento: tipo, monto, cuenta, fecha, referencia,
 *    descripción, estatus.
 *  - Sección de adjuntos (lista de nombres de archivo, si los hay).
 *  - Footer: "Generado por AtlasERP" + fecha.
 *
 * Usa React.createElement (sin JSX) para compatibilidad con .js sin Babel JSX.
 * Carga @react-pdf/renderer dinámicamente para evitar impacto en bundle.
 *
 * Task origen: T-1611 (Fase 16 Bloque 3)
 */

import React from "react";

const TYPE_LABELS = {
  INCOME: "Ingreso",
  EXPENSE: "Egreso",
  ADJUSTMENT: "Ajuste",
  TRANSFER_IN: "Transferencia entrada",
  TRANSFER_OUT: "Transferencia salida",
};

const STATUS_LABELS = {
  DRAFT: "Borrador",
  POSTED: "Contabilizado",
  CANCELED: "Cancelado",
  REVERSED: "Revertido",
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

// ─── Estilos ─────────────────────────────────────────────────────────────────

const COLORS = {
  primary: "#1E3A5F",
  accent: "#2E6CC7",
  text: "#1A1A2E",
  secondary: "#555770",
  border: "#D1D5DB",
  bg: "#F4F6F8",
  white: "#FFFFFF",
  success: "#166534",
  error: "#991B1B",
};

const styles = {
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: COLORS.white },
  // Header
  headerBox: { backgroundColor: COLORS.primary, padding: "16 20", marginBottom: 20, borderRadius: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.white },
  headerSub: { fontSize: 9, color: "#A0B4CC", marginTop: 4 },
  // Section title
  sectionTitle: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1,
    color: COLORS.secondary, marginBottom: 8, marginTop: 16, borderBottom: `1 solid ${COLORS.border}`,
    paddingBottom: 4 },
  // Field row
  fieldRow: { flexDirection: "row", marginBottom: 8 },
  fieldLabel: { width: 130, fontSize: 9, color: COLORS.secondary, fontWeight: "bold" },
  fieldValue: { flex: 1, fontSize: 10, color: COLORS.text },
  // Amount
  amountBox: { backgroundColor: COLORS.bg, padding: "12 16", borderRadius: 4, marginBottom: 16,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amountLabel: { fontSize: 9, color: COLORS.secondary, fontWeight: "bold", textTransform: "uppercase" },
  amountValue: { fontSize: 22, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  // Attachment row
  attachmentRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4,
    borderBottom: `1 solid ${COLORS.border}` },
  attachmentIcon: { fontSize: 9, color: COLORS.accent, marginRight: 8 },
  attachmentName: { fontSize: 9, color: COLORS.text },
  // Footer
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    borderTop: `1 solid ${COLORS.border}`, paddingTop: 8 },
  footerText: { fontSize: 8, color: COLORS.secondary },
};

/**
 * Construye el documento PDF para un movimiento.
 *
 * @param {object} opts
 * @param {object} opts.movement       — Datos del movimiento
 * @param {string} [opts.accountName]  — Nombre de la cuenta bancaria
 * @param {string} [opts.orgName]      — Nombre de la organización
 * @param {Array}  [opts.attachments]  — Lista de adjuntos [{originalName, label}]
 * @param {object} pdfLib              — Destructured { Document, Page, View, Text, ... }
 * @returns {React.Element} — <Document>
 */
export function buildMovementReceiptDocument(opts, pdfLib) {
  const {
    movement,
    accountName = "—",
    orgName = "AtlasERP",
    attachments = [],
  } = opts;

  const { Document, Page, View, Text } = pdfLib;

  const isIncome = movement.movementType === "INCOME" || movement.type === "INCOME";
  const amountColor = isIncome ? COLORS.success : COLORS.error;
  const amountPrefix = isIncome ? "+" : "−";
  const amount = fmtMoney(movement.amount, movement.currencyCode ?? movement.currency);
  const generatedAt = new Date().toLocaleDateString("es-MX", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

  return React.createElement(
    Document,
    { title: `Comprobante movimiento ${movement.reference ?? movement.id}` },
    React.createElement(
      Page,
      { size: "LETTER", style: styles.page },

      // ── Header ──
      React.createElement(
        View,
        { style: styles.headerBox },
        React.createElement(Text, { style: styles.headerTitle }, "Comprobante de movimiento"),
        React.createElement(Text, { style: styles.headerSub }, `${orgName}  ·  Generado: ${generatedAt}`),
      ),

      // ── Monto destacado ──
      React.createElement(
        View,
        { style: styles.amountBox },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.amountLabel }, "Monto"),
          React.createElement(Text, {
            style: { ...styles.amountValue, color: amountColor },
          }, `${amountPrefix}${amount}`),
        ),
        React.createElement(
          View,
          { style: { alignItems: "flex-end" } },
          React.createElement(Text, { style: { fontSize: 9, color: COLORS.secondary } }, "Tipo"),
          React.createElement(Text, { style: { fontSize: 11, fontWeight: "bold", color: COLORS.text } },
            TYPE_LABELS[movement.movementType ?? movement.type] ?? movement.movementType ?? "—"),
        ),
      ),

      // ── Datos del movimiento ──
      React.createElement(Text, { style: styles.sectionTitle }, "Datos del movimiento"),
      ...[
        ["Cuenta bancaria", accountName],
        ["Fecha", fmtDate(movement.occurredAt ?? movement.movementDate)],
        ["Referencia", movement.reference ?? movement.externalReference],
        ["Estado", STATUS_LABELS[movement.status] ?? movement.status],
        ["Moneda", movement.currencyCode ?? movement.currency ?? "MXN"],
        ["Conciliado", movement.isReconciled ? "Sí" : "No"],
      ].map(([label, value]) =>
        React.createElement(
          View,
          { style: styles.fieldRow, key: label },
          React.createElement(Text, { style: styles.fieldLabel }, label),
          React.createElement(Text, { style: styles.fieldValue }, value || "—"),
        ),
      ),
      ...(movement.description
        ? [React.createElement(
            View,
            { style: styles.fieldRow, key: "desc" },
            React.createElement(Text, { style: styles.fieldLabel }, "Descripción"),
            React.createElement(Text, { style: { ...styles.fieldValue, fontSize: 9 } }, movement.description),
          )]
        : []),
      ...(movement.notes
        ? [React.createElement(
            View,
            { style: styles.fieldRow, key: "notes" },
            React.createElement(Text, { style: styles.fieldLabel }, "Notas"),
            React.createElement(Text, { style: { ...styles.fieldValue, fontSize: 9 } }, movement.notes),
          )]
        : []),

      // ── Adjuntos ──
      ...(attachments.length > 0
        ? [
            React.createElement(Text, { style: styles.sectionTitle, key: "att-title" }, "Documentos adjuntos"),
            ...attachments.map((att, idx) =>
              React.createElement(
                View,
                { style: styles.attachmentRow, key: idx },
                React.createElement(Text, { style: styles.attachmentIcon }, "•"),
                React.createElement(Text, { style: styles.attachmentName },
                  att.originalName ?? att.label ?? `Adjunto ${idx + 1}`),
              ),
            ),
          ]
        : []),

      // ── Footer ──
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerText }, "Generado por AtlasERP"),
        React.createElement(Text, { style: styles.footerText },
          `${movement.reference ?? movement.id ?? "—"}`),
        React.createElement(Text, {
          style: styles.footerText,
          render: ({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`,
        }),
      ),
    ),
  );
}

/**
 * Descarga el comprobante PDF del movimiento directamente.
 *
 * @param {object} opts — Ver buildMovementReceiptDocument
 * @param {string} [filename] — Nombre de archivo sin extensión
 */
export async function downloadMovementReceipt(opts, filename) {
  const [{ pdf }, pdfLib] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@react-pdf/renderer").then((m) => m),
  ]);

  const { Document, Page, View, Text } = pdfLib;
  const doc = buildMovementReceiptDocument(opts, { Document, Page, View, Text });
  const blob = await pdf(doc).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename ?? `comprobante-movimiento-${opts.movement?.reference ?? opts.movement?.id ?? "sin-ref"}`}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
