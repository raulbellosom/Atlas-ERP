import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef } from 'react';

/**
 * Select — Meridian Design System sobre Radix Select.
 *
 * Portal rendering, keyboard navigation, accesibilidad completa.
 * Chevron «aguja del compás» como indicador visual.
 *
 * @param {{
 *   label?: string,
 *   error?: string,
 *   helpText?: string,
 *   placeholder?: string,
 *   options: Array<{ value: string, label: string, disabled?: boolean }>,
 *   groups?: Array<{ label: string, options: Array<{ value: string, label: string, disabled?: boolean }> }>,
 *   value?: string,
 *   onValueChange?: (value: string) => void,
 *   required?: boolean,
 *   disabled?: boolean,
 *   id?: string,
 *   className?: string,
 * }} props
 */
const Select = forwardRef(function Select(
  {
    label,
    error,
    helpText,
    id,
    placeholder = 'Seleccionar...',
    options = [],
    groups,
    value,
    onValueChange,
    required,
    disabled,
    className = '',
  },
  ref,
) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-text-primary select-none">
          {label}
          {required && (
            <span className="ml-0.5 text-error" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <SelectPrimitive.Root
        value={value ? String(value) : undefined}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          id={selectId}
          className={[
            'flex items-center justify-between w-full h-11',
            'rounded-lg border bg-surface transition-all duration-150',
            'px-3.5 py-[0.6875rem] text-sm text-text-primary',
            'cursor-pointer focus:outline-none',
            'data-[placeholder]:text-text-disabled',
            hasError
              ? 'border-error-border focus:border-error'
              : 'border-border hover:border-border-strong focus:border-border-strong',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
            className,
          ].join(' ')}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError ? `${selectId}-error` : helpText ? `${selectId}-hint` : undefined
          }
        >
          <SelectPrimitive.Value placeholder={placeholder}>
            {(() => {
              if (!value) return undefined;
              const valStr = String(value).toUpperCase();
              const allOptions = options || groups?.flatMap((g) => g.options) || [];
              const match = allOptions.find((o) => String(o.value).toUpperCase() === valStr);
              return match ? match.label : undefined;
            })()}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon className="ml-2 text-text-disabled shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 5L7 9L11 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className={[
              'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden',
              'rounded-lg border border-border bg-surface shadow-lg',
              'data-[state=open]:animate-atlas-in',
              'data-[state=closed]:animate-atlas-out',
            ].join(' ')}
          >
            <SelectPrimitive.Viewport className="p-1 max-h-60">
              {/* Opciones planas */}
              {!groups &&
                options.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
                    {opt.label}
                  </SelectItem>
                ))}

              {/* Opciones agrupadas */}
              {groups &&
                groups.map((group, gi) => (
                  <SelectPrimitive.Group key={gi}>
                    <SelectPrimitive.Label className="px-3 py-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      {group.label}
                    </SelectPrimitive.Label>
                    {group.options.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectPrimitive.Group>
                ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {hasError && (
        <p
          id={`${selectId}-error`}
          role="alert"
          className="flex items-center gap-1 text-xs text-error"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5h1.5v4.5h-1.5V4.5zm0 5.5h1.5v1.5h-1.5V10z" />
          </svg>
          {error}
        </p>
      )}

      {helpText && !hasError && (
        <p id={`${selectId}-hint`} className="text-xs text-text-secondary">
          {helpText}
        </p>
      )}
    </div>
  );
});

/**
 * Item individual del Select.
 */
function SelectItem({ children, ...props }) {
  return (
    <SelectPrimitive.Item
      className={[
        'relative flex items-center px-3 py-2 rounded-md text-sm text-text-primary',
        'cursor-pointer select-none outline-none',
        'data-[highlighted]:bg-ink-50 data-[highlighted]:text-ink-700',
        'data-[disabled]:text-text-disabled data-[disabled]:pointer-events-none',
        'transition-colors',
      ].join(' ')}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 text-ink-600">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2.5 7L5.5 10L11.5 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export default Select;
