import * as SwitchPrimitive from "@radix-ui/react-switch";
import { forwardRef } from "react";

/**
 * Switch — Meridian Design System sobre Radix Switch.
 *
 * Toggle on/off accesible con animación spring.
 * Colores: ink-600 (on), neutral-300 (off).
 *
 * @param {{
 *   label?: string,
 *   checked?: boolean,
 *   onCheckedChange?: (checked: boolean) => void,
 *   disabled?: boolean,
 *   id?: string,
 *   size?: 'sm' | 'md',
 * }} props
 */
const Switch = forwardRef(function Switch(
  { label, checked, onCheckedChange, disabled, id, size = "md" },
  ref,
) {
  const switchId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const sizes = {
    sm: { root: "w-8 h-[18px]", thumb: "w-3.5 h-3.5 data-[state=checked]:translate-x-[14px]" },
    md: { root: "w-10 h-[22px]", thumb: "w-[18px] h-[18px] data-[state=checked]:translate-x-[18px]" },
  };

  const s = sizes[size] ?? sizes.md;

  return (
    <div className="flex items-center gap-2.5">
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={[
          "relative shrink-0 rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:shadow-focus",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "data-[state=checked]:bg-ink-600",
          "data-[state=unchecked]:bg-neutral-300",
          s.root,
        ].join(" ")}
      >
        <SwitchPrimitive.Thumb
          className={[
            "block rounded-full bg-white shadow-sm",
            "transition-transform duration-150",
            "translate-x-0.5",
            s.thumb,
          ].join(" ")}
        />
      </SwitchPrimitive.Root>

      {label && (
        <label
          htmlFor={switchId}
          className={[
            "text-sm text-text-primary select-none cursor-pointer",
            disabled ? "opacity-40 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {label}
        </label>
      )}
    </div>
  );
});

export default Switch;
