import * as Dialog from "@radix-ui/react-dialog";

/**
 * Modal — Meridian Design System sobre Radix Dialog.
 *
 * Accesibilidad completa: focus trap, scroll lock, portal, Escape,
 * overlay dismiss—todo manejado por Radix.
 *
 * Responsive: full-screen en mobile, centrado con max-width en desktop.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title: string,
 *   description?: string,
 *   children: React.ReactNode,
 *   footer?: React.ReactNode,
 *   size?: 'sm' | 'md' | 'lg' | 'xl',
 *   closeOnOverlay?: boolean,
 * }} props
 */
export default function Modal({
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
    sm: "md:max-w-sm",
    md: "md:max-w-lg",
    lg: "md:max-w-2xl",
    xl: "md:max-w-4xl",
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className={[
            "fixed inset-0 z-50 bg-surface-overlay backdrop-blur-sm",
            "data-[state=open]:animate-[atlas-overlay-in_200ms_ease-out]",
            "data-[state=closed]:animate-[atlas-overlay-out_150ms_ease-in]",
          ].join(" ")}
          onClick={closeOnOverlay ? undefined : (e) => e.preventDefault()}
        />

        {/* Content */}
        <Dialog.Content
          className={[
            "fixed inset-0 z-50 flex flex-col bg-surface",
            "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
            "md:rounded-xl md:border md:border-border md:shadow-xl",
            "md:max-h-[85vh] w-full",
            sizeClasses[size] ?? sizeClasses.md,
            "data-[state=open]:animate-[atlas-content-in_200ms_ease-out]",
            "data-[state=closed]:animate-[atlas-content-out_150ms_ease-in]",
            "focus:outline-none",
          ].join(" ")}
          onPointerDownOutside={
            closeOnOverlay ? undefined : (e) => e.preventDefault()
          }
          onEscapeKeyDown={undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-border shrink-0">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-base font-semibold text-text-primary truncate">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-xs text-text-secondary mt-0.5 truncate">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Cerrar"
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
