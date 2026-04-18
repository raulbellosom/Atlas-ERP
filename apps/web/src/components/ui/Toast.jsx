import * as ToastPrimitive from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useReducer } from "react";

// ─── Variant styles con tokens semánticos Meridian ───────────────────────────

const VARIANT_STYLES = {
  success: "bg-success-subtle border-success-border text-success",
  error:   "bg-error-subtle border-error-border text-error",
  warning: "bg-warning-subtle border-warning-border text-warning",
  info:    "bg-info-subtle border-info-border text-info",
};

const VARIANT_ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5h1.5v4.5h-1.5V4.5zm0 5.5h1.5v1.5h-1.5V10z" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5L1 14h14L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <line x1="8" y1="6" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.75" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="7" x2="8" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  ),
};

// ─── Store ───────────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

let _nextId = 0;
let _lastToast = { signature: "", at: 0 };

function toastReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast];
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

/**
 * ToastProvider — Meridian Design System sobre Radix Toast.
 *
 * Envuelve la aplicación para habilitar toasts con swipe-to-dismiss,
 * auto-close timer y variantes semánticas.
 */
export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const remove = useCallback((id) => dispatch({ type: "REMOVE", id }), []);

  const add = useCallback(
    ({ message, variant = "info", duration = 5000 }) => {
      const signature = `${variant}::${message}`;
      const now = Date.now();
      const isDuplicateBurst =
        _lastToast.signature === signature && now - _lastToast.at < 5000;

      if (isDuplicateBurst) return null;

      _lastToast = { signature, at: now };
      const id = ++_nextId;
      dispatch({ type: "ADD", toast: { id, message, variant, duration } });
      return id;
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ add, remove }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}

        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.duration}
            onOpenChange={(open) => {
              if (!open) remove(t.id);
            }}
            className={[
              "flex items-start gap-3 px-4 py-3 rounded-lg border text-sm shadow-md",
              "pointer-events-auto",
              VARIANT_STYLES[t.variant] ?? VARIANT_STYLES.info,
              "data-[state=open]:animate-[atlas-toast-in_250ms_ease-out]",
              "data-[state=closed]:animate-[atlas-toast-out_200ms_ease-in]",
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
              "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
              "data-[swipe=end]:animate-[atlas-toast-swipe-out_150ms_ease-out]",
            ].join(" ")}
          >
            <span className="shrink-0 mt-0.5">
              {VARIANT_ICONS[t.variant] ?? VARIANT_ICONS.info}
            </span>
            <ToastPrimitive.Description className="flex-1 text-sm leading-snug">
              {t.message}
            </ToastPrimitive.Description>
            <ToastPrimitive.Close
              aria-label="Cerrar"
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity p-0.5 rounded focus-visible:shadow-focus"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        {/* Viewport — posicionamiento de los toasts */}
        <ToastPrimitive.Viewport
          className={[
            "fixed bottom-4 right-4 z-[100]",
            "flex flex-col gap-2",
            "w-[calc(100%-2rem)] max-w-sm",
            "outline-none",
          ].join(" ")}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Hook para emitir toasts desde cualquier componente.
 * @returns {{ toast: { success, error, info, warning } }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");

  return {
    toast: {
      success: (message, opts) => ctx.add({ message, variant: "success", ...opts }),
      error: (message, opts) => ctx.add({ message, variant: "error", ...opts }),
      info: (message, opts) => ctx.add({ message, variant: "info", ...opts }),
      warning: (message, opts) => ctx.add({ message, variant: "warning", ...opts }),
    },
  };
}
