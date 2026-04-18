/**
 * printReport — Utilidad de impresión nativa para el desktop Tauri.
 *
 * Aplica la clase `print-mode` al contenedor del reporte antes de llamar
 * a `window.print()`, lo que activa los @media print definidos en
 * `report-print.css` (sidebar, topbar y controles ocultos; solo tabla
 * y encabezado visibles). Remueve la clase al terminar.
 *
 * Task origen: T-1610 (Fase 16 Bloque 3)
 * Decisión: window.print() sobre plugin Tauri — suficiente para v1.
 *           Plugin nativo (T-0908) reservado para impresión silenciosa.
 */

/**
 * @param {object}  opts
 * @param {string}  opts.containerId  — ID del contenedor del reporte (aplica print-mode).
 * @param {string}  [opts.title]      — Nombre del documento para el diálogo nativo (document.title).
 * @returns {void}
 */
export function printReport({ containerId, title } = {}) {
  const container = containerId ? document.getElementById(containerId) : null;

  const prevTitle = document.title;
  if (title) document.title = title;

  if (container) {
    container.classList.add("print-mode");
  } else {
    document.body.classList.add("print-mode");
  }

  try {
    window.print();
  } finally {
    if (container) {
      container.classList.remove("print-mode");
    } else {
      document.body.classList.remove("print-mode");
    }
    if (title) document.title = prevTitle;
  }
}
