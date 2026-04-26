import * as Dialog from "@radix-ui/react-dialog";

/**
 * SidePanel (Sheet/Drawer) — Meridian Design System sobre Radix Dialog.
 *
 * Panel lateral deslizante desde la derecha.
 * Mobile: full-width overlay.
 * Desktop: anchura configurable con slide-in animation.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title: string,
 *   description?: string,
 *   children: React.ReactNode,
 *   footer?: React.ReactNode,
 *   size?: 'sm' | 'md' | 'lg',
 *   closeOnOverlay?: boolean,
 * }} props
 */
export default function SidePanel({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
}) {
  const sizeClasses = {
    sm: "md:max-w-xs",
    md: "md:max-w-md lg:max-w-[28rem]",
    lg: "md:max-w-xl lg:max-w-[40rem]",
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className={[
            "fixed inset-0 z-40 bg-surface-overlay backdrop-blur-sm",
            "data-[state=open]:animate-[atlas-overlay-in_200ms_ease-out]",
            "data-[state=closed]:animate-[atlas-overlay-out_150ms_ease-in]",
          ].join(" ")}
        />

        {/* Panel */}
        <Dialog.Content
          className={[
            "fixed inset-y-0 right-0 z-50 flex flex-col w-full bg-surface",
            "border-l border-border shadow-xl",
            sizeClasses[size] ?? sizeClasses.md,
            "data-[state=open]:animate-[atlas-slide-in-right_250ms_ease-out]",
            "data-[state=closed]:animate-[atlas-slide-out-right_200ms_ease-in]",
            "focus:outline-none",
          ].join(" ")}
          onPointerDownOutside={
            closeOnOverlay ? undefined : (e) => e.preventDefault()
          }
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-border shrink-0">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-base font-semibold text-text-primary truncate">
                {title}
              </Dialog.Title>
              <Dialog.Description
                className={
                  description
                    ? "text-xs text-text-secondary mt-0.5"
                    : "sr-only"
                }
              >
                {description ?? "Contenido del panel"}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Cerrar panel"
              className="shrink-0 ml-3 text-text-disabled hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-surface-subtle focus-visible:shadow-focus"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 md:px-6 md:py-4">
            {children}
          </div>

          {/* Footer opcional */}
          {footer && (
            <div className="px-4 py-3 md:px-6 md:py-4 border-t border-border shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
