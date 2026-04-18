import * as TabsPrimitive from "@radix-ui/react-tabs";

/**
 * Tabs — Meridian Design System sobre Radix Tabs.
 *
 * Tabs accesibles con keyboard navigation, indicador visual Meridian
 * y scroll horizontal responsivo en mobile.
 *
 * @param {{
 *   tabs: Array<{ value: string, label: string, disabled?: boolean, icon?: React.ReactNode }>,
 *   defaultValue?: string,
 *   value?: string,
 *   onValueChange?: (value: string) => void,
 *   variant?: 'line' | 'pills',
 *   children: React.ReactNode,
 * }} props
 */
export function Tabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  variant = "line",
  children,
}) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue ?? tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
    >
      {/* Tab list — scroll horizontal en mobile */}
      <TabsPrimitive.List
        className={[
          "flex gap-1 overflow-x-auto scrollbar-none",
          variant === "line"
            ? "border-b border-border"
            : "bg-surface-sunken rounded-lg p-1",
        ].join(" ")}
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={[
              "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap",
              "transition-colors select-none shrink-0",
              "focus-visible:outline-none focus-visible:shadow-focus focus-visible:rounded-md",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              variant === "line"
                ? [
                    "border-b-2 -mb-px rounded-t-md",
                    "border-transparent text-text-secondary",
                    "hover:text-text-primary hover:border-border-strong",
                    "data-[state=active]:border-ink-600 data-[state=active]:text-ink-700",
                  ].join(" ")
                : [
                    "rounded-md",
                    "text-text-secondary",
                    "hover:text-text-primary hover:bg-surface",
                    "data-[state=active]:bg-surface data-[state=active]:text-ink-700 data-[state=active]:shadow-sm",
                  ].join(" "),
            ].join(" ")}
          >
            {tab.icon && (
              <span className="w-4 h-4 shrink-0">{tab.icon}</span>
            )}
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {children}
    </TabsPrimitive.Root>
  );
}

/**
 * TabContent — contenido de un tab individual.
 *
 * @param {{ value: string, children: React.ReactNode, className?: string }} props
 */
export function TabContent({ value, children, className = "" }) {
  return (
    <TabsPrimitive.Content
      value={value}
      className={[
        "mt-4 focus-visible:outline-none focus-visible:shadow-focus focus-visible:rounded-md",
        className,
      ].join(" ")}
    >
      {children}
    </TabsPrimitive.Content>
  );
}
