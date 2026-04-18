import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

/**
 * AlertDialog — Meridian Design System sobre Radix AlertDialog.
 *
 * Para confirmaciones destructivas (eliminar, cancelar).
 * A diferencia del Modal, NO se cierra al hacer click fuera.
 *
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   title: string,
 *   description: string,
 *   cancelLabel?: string,
 *   confirmLabel?: string,
 *   onConfirm: () => void,
 *   variant?: 'destructive' | 'default',
 * }} props
 */
export default function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  onConfirm,
  variant = "destructive",
}) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        {/* Overlay */}
        <AlertDialogPrimitive.Overlay
          className={[
            "fixed inset-0 z-50 bg-surface-overlay backdrop-blur-sm",
            "data-[state=open]:animate-[atlas-overlay-in_200ms_ease-out]",
            "data-[state=closed]:animate-[atlas-overlay-out_150ms_ease-in]",
          ].join(" ")}
        />

        {/* Content */}
        <AlertDialogPrimitive.Content
          className={[
            "fixed z-50",
            "inset-4 m-auto h-fit md:inset-auto",
            "md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
            "w-auto max-w-md",
            "rounded-xl border border-border bg-surface shadow-xl p-6",
            "data-[state=open]:animate-[atlas-content-in_200ms_ease-out]",
            "data-[state=closed]:animate-[atlas-content-out_150ms_ease-in]",
            "focus:outline-none",
          ].join(" ")}
        >
          <AlertDialogPrimitive.Title className="text-base font-semibold text-text-primary">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="mt-2 text-sm text-text-secondary leading-relaxed">
            {description}
          </AlertDialogPrimitive.Description>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <AlertDialogPrimitive.Cancel
              className={[
                "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium",
                "border border-border bg-surface text-text-primary",
                "hover:bg-surface-subtle transition-colors",
                "focus-visible:shadow-focus focus-visible:outline-none",
              ].join(" ")}
            >
              {cancelLabel}
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action
              onClick={onConfirm}
              className={[
                "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium",
                "transition-colors",
                "focus-visible:shadow-focus focus-visible:outline-none",
                variant === "destructive"
                  ? "bg-error text-on-error hover:bg-error/90"
                  : "bg-ink-600 text-text-inverse hover:bg-ink-700",
              ].join(" ")}
            >
              {confirmLabel}
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
