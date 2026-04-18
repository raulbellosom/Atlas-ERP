import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { forwardRef } from "react";

/**
 * Checkbox — Meridian Design System sobre Radix Checkbox.
 *
 * Checkbox accesible con checked/indeterminate, ink-600 cuando activo.
 * Extraído del componente Table.jsx para reutilización general.
 *
 * @param {{
 *   label?: string,
 *   checked?: boolean | 'indeterminate',
 *   onCheckedChange?: (checked: boolean | 'indeterminate') => void,
 *   disabled?: boolean,
 *   id?: string,
 *   className?: string,
 * }} props
 */
const Checkbox = forwardRef(function Checkbox(
  { label, checked, onCheckedChange, disabled, id, className = "" },
  ref,
) {
  const checkboxId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={["flex items-center gap-2", className].join(" ")}>
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={[
          "group shrink-0 flex items-center justify-center",
          "w-4 h-4 rounded border transition-colors",
          "focus-visible:outline-none focus-visible:shadow-focus",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "data-[state=checked]:bg-ink-600 data-[state=checked]:border-ink-600",
          "data-[state=indeterminate]:bg-ink-600 data-[state=indeterminate]:border-ink-600",
          "data-[state=unchecked]:border-border-strong data-[state=unchecked]:bg-surface",
          "data-[state=unchecked]:hover:border-ink-400",
        ].join(" ")}
      >
        <CheckboxPrimitive.Indicator className="text-text-inverse">
          {checked === "indeterminate" ? (
            /* Guion horizontal para indeterminate */
            <svg width="9" height="2" viewBox="0 0 9 2" fill="none" aria-hidden="true">
              <rect width="9" height="2" rx="1" fill="currentColor" />
            </svg>
          ) : (
            /* Checkmark */
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
              <path
                d="M1 3.5L3.5 6L8 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {label && (
        <label
          htmlFor={checkboxId}
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

export default Checkbox;
