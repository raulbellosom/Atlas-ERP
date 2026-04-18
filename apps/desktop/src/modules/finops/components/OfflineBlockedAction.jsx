/**
 * OfflineBlockedAction — envuelve acciones que no están disponibles offline.
 *
 * Props:
 *   isOffline: boolean  — si true, aplica el bloqueo.
 *   mode: 'hide' | 'disable'
 *     - 'hide': no renderiza children en offline.
 *     - 'disable': renderiza children con atributo disabled y tooltip.
 *   reason: string  — mensaje que explica por qué está bloqueado.
 *   children: ReactNode
 *
 * En online siempre renderiza children normalmente.
 *
 * Task origen: T-1514 (Fase 15 Bloque 3)
 */

import { cloneElement, isValidElement } from "react";

/**
 * @param {{
 *   isOffline: boolean,
 *   mode?: 'hide' | 'disable',
 *   reason?: string,
 *   children: React.ReactNode,
 * }} props
 */
export function OfflineBlockedAction({
  isOffline,
  mode = "hide",
  reason = "No disponible en modo offline.",
  children,
}) {
  if (!isOffline) return children;

  if (mode === "hide") return null;

  // mode === 'disable': deshabilitar + tooltip
  if (!isValidElement(children)) return null;

  return (
    <span title={reason} className="inline-flex cursor-not-allowed">
      {cloneElement(children, {
        disabled: true,
        "aria-disabled": true,
        tabIndex: -1,
        style: { ...(children.props.style ?? {}), pointerEvents: "none", opacity: 0.5 },
      })}
    </span>
  );
}
