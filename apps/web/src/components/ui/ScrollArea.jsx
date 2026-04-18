import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

/**
 * ScrollArea — Meridian Design System sobre Radix ScrollArea.
 *
 * Custom scrollbar con tokens Meridian. Reemplaza el CSS
 * ::-webkit-scrollbar con un scrollbar cross-browser.
 *
 * @param {{
 *   children: React.ReactNode,
 *   className?: string,
 *   orientation?: 'vertical' | 'horizontal' | 'both',
 * }} props
 */
export default function ScrollArea({
  children,
  className = "",
  orientation = "vertical",
}) {
  return (
    <ScrollAreaPrimitive.Root
      className={["overflow-hidden", className].join(" ")}
    >
      <ScrollAreaPrimitive.Viewport className="w-full h-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>

      {(orientation === "vertical" || orientation === "both") && (
        <ScrollAreaPrimitive.Scrollbar
          orientation="vertical"
          className={[
            "flex touch-none select-none p-0.5",
            "transition-colors hover:bg-surface-sunken",
            "w-2",
          ].join(" ")}
        >
          <ScrollAreaPrimitive.Thumb
            className={[
              "relative flex-1 rounded-full",
              "bg-border-strong hover:bg-neutral-400",
              "transition-colors",
            ].join(" ")}
          />
        </ScrollAreaPrimitive.Scrollbar>
      )}

      {(orientation === "horizontal" || orientation === "both") && (
        <ScrollAreaPrimitive.Scrollbar
          orientation="horizontal"
          className={[
            "flex touch-none select-none flex-col p-0.5",
            "transition-colors hover:bg-surface-sunken",
            "h-2",
          ].join(" ")}
        >
          <ScrollAreaPrimitive.Thumb
            className={[
              "relative flex-1 rounded-full",
              "bg-border-strong hover:bg-neutral-400",
              "transition-colors",
            ].join(" ")}
          />
        </ScrollAreaPrimitive.Scrollbar>
      )}

      <ScrollAreaPrimitive.Corner className="bg-surface-sunken" />
    </ScrollAreaPrimitive.Root>
  );
}
