import * as TooltipPrimitive from "@radix-ui/react-tooltip";

/**
 * Tooltip — Meridian Design System sobre Radix Tooltip.
 *
 * Tooltip accesible con posicionamiento automático y delay.
 *
 * @param {{
 *   content: React.ReactNode,
 *   children: React.ReactNode,
 *   side?: 'top' | 'right' | 'bottom' | 'left',
 *   delayDuration?: number,
 * }} props
 */
export function Tooltip({
  content,
  children,
  side = "top",
  delayDuration = 300,
}) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={[
            "z-50 px-2.5 py-1.5 rounded-md text-xs font-medium",
            "bg-ink-900 text-text-inverse shadow-md",
            "data-[state=delayed-open]:animate-[atlas-tooltip-in_120ms_ease-out]",
            "data-[state=closed]:animate-[atlas-tooltip-out_80ms_ease-in]",
            "select-none",
          ].join(" ")}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-ink-900" width={10} height={5} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/**
 * TooltipProvider — envuelve la app para habilitar tooltips.
 * Debe colocarse en el root de la aplicación.
 */
export function TooltipProvider({ children }) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      {children}
    </TooltipPrimitive.Provider>
  );
}
