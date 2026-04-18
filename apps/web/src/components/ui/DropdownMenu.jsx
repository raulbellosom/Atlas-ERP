import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

/**
 * DropdownMenu — Meridian Design System sobre Radix DropdownMenu.
 *
 * Menú contextual con sub-menus, separadores, keyboard nav y portal.
 *
 * Uso:
 *   <DropdownMenu trigger={<Button>Acciones</Button>}>
 *     <DropdownMenuItem onClick={handleEdit}>Editar</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem onClick={handleDelete} variant="destructive">Eliminar</DropdownMenuItem>
 *   </DropdownMenu>
 */

export function DropdownMenu({ trigger, children, align = "end", sideOffset = 4 }) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={sideOffset}
          className={[
            "z-50 min-w-[10rem] overflow-hidden",
            "rounded-lg border border-border bg-surface shadow-lg p-1",
            "data-[state=open]:animate-atlas-in",
            "data-[state=closed]:animate-atlas-out",
          ].join(" ")}
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

/**
 * Item individual del DropdownMenu.
 * @param {{ variant?: 'default' | 'destructive', icon?: React.ReactNode }} props
 */
export function DropdownMenuItem({
  children,
  icon,
  variant = "default",
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={[
        "relative flex items-center gap-2 px-3 py-2 rounded-md text-sm",
        "cursor-pointer select-none outline-none",
        "transition-colors",
        variant === "destructive"
          ? "text-error data-[highlighted]:bg-error-subtle data-[highlighted]:text-error"
          : "text-text-primary data-[highlighted]:bg-ink-50 data-[highlighted]:text-ink-700",
        "data-[disabled]:text-text-disabled data-[disabled]:pointer-events-none",
      ].join(" ")}
      {...props}
    >
      {icon && <span className="w-4 h-4 shrink-0">{icon}</span>}
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

/**
 * Separador visual dentro del dropdown.
 */
export function DropdownMenuSeparator() {
  return (
    <DropdownMenuPrimitive.Separator className="h-px my-1 bg-border" />
  );
}

/**
 * Etiqueta de grupo dentro del dropdown.
 */
export function DropdownMenuLabel({ children }) {
  return (
    <DropdownMenuPrimitive.Label className="px-3 py-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
      {children}
    </DropdownMenuPrimitive.Label>
  );
}
