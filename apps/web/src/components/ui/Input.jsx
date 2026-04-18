import { forwardRef } from "react";

/**
 * Input — Meridian v2 Design System
 *
 * Compatible con react-hook-form (forwardRef).
 * Touch target mínimo: 44px de altura en size md (por defecto).
 * Focus ring doble (blanco + ink) para accesibilidad Premium.
 *
 * @param {{
 *   label?: string,
 *   error?: string,
 *   helpText?: string,
 *   leadingIcon?: React.ReactNode,
 *   trailingIcon?: React.ReactNode,
 *   size?: 'sm' | 'md' | 'lg',
 * } & React.InputHTMLAttributes} props
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    helpText,
    id,
    leadingIcon,
    trailingIcon,
    size = "md",
    className = "",
    ...rest
  },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const hasError = Boolean(error);

  /* Alturas: sm=36px, md=44px (touch target), lg=50px */
  const heightClass = {
    sm: "h-9",
    md: "h-11",  /* 44px — Apple HIG mínimo */
    lg: "h-12",
  }[size] ?? "h-11";

  const paddingY = {
    sm: "py-2",
    md: "py-[0.6875rem]",
    lg: "py-3",
  }[size] ?? "py-[0.6875rem]";

  const textSize = {
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
  }[size] ?? "text-sm";

  const wrapperClass = [
    "relative flex items-center",
    "rounded-lg border bg-surface",
    "transition-all duration-150",
    hasError
      ? "border-error-border hover:border-error focus-within:border-error focus-within:[box-shadow:var(--shadow-focus-error)]"
      : "border-border hover:border-border-strong focus-within:border-ink-500 focus-within:[box-shadow:var(--shadow-focus)]",
  ].join(" ");

  const inputClass = [
    "w-full bg-transparent",
    textSize,
    "text-text-primary placeholder:text-text-disabled",
    "focus:outline-none",
    heightClass,
    leadingIcon  ? "pl-10 pr-3" : "px-3.5",
    trailingIcon ? "pr-10" : "",
    paddingY,
    className,
  ].join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-text-primary select-none"
        >
          {label}
          {rest.required && (
            <span className="ml-0.5 text-error" aria-hidden="true"> *</span>
          )}
        </label>
      )}

      <div className={wrapperClass}>
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3.5 w-4.25 h-4.25 text-text-disabled flex items-center justify-center shrink-0">
            {leadingIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={inputClass}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError
              ? `${inputId}-error`
              : helpText
              ? `${inputId}-hint`
              : undefined
          }
          {...rest}
        />

        {trailingIcon && (
          <span className="pointer-events-none absolute right-3.5 w-4.25 h-4.25 text-text-disabled flex items-center justify-center shrink-0">
            {trailingIcon}
          </span>
        )}
      </div>

      {hasError && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-error"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM7.25 4.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}

      {helpText && !hasError && (
        <p id={`${inputId}-hint`} className="text-xs text-text-tertiary leading-relaxed">
          {helpText}
        </p>
      )}
    </div>
  );
});

export default Input;
