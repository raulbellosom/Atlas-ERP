import { forwardRef } from "react";

/**
 * Textarea — Meridian Design System
 *
 * Misma API de label/error/helpText que Input.
 * Compatible con react-hook-form (forwardRef).
 *
 * @param {{
 *   label?: string,
 *   error?: string,
 *   helpText?: string,
 *   rows?: number,
 *   resize?: 'none'|'vertical'|'both',
 * } & React.TextareaHTMLAttributes} props
 */
const Textarea = forwardRef(function Textarea(
  { label, error, helpText, id, rows = 4, resize = "vertical", className = "", ...rest },
  ref,
) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const hasError = Boolean(error);

  const resizeClass = {
    none:     "resize-none",
    vertical: "resize-y",
    both:     "resize",
  }[resize] ?? "resize-y";

  const wrapperClass = [
    "rounded-lg border bg-surface",
    "transition-shadow",
    hasError
      ? "border-error-border focus-within:border-error focus-within:shadow-focus-error"
      : "border-border hover:border-border-strong focus-within:border-border-focus focus-within:shadow-focus",
  ].join(" ");

  const textareaClass = [
    "block w-full bg-transparent",
    "text-sm text-text-primary placeholder:text-text-disabled",
    "px-3 py-[0.5625rem]",
    "focus:outline-none",
    "min-h-[5rem]",
    resizeClass,
    className,
  ].join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-text-primary select-none"
        >
          {label}
          {rest.required && (
            <span className="ml-0.5 text-error" aria-hidden="true">*</span>
          )}
        </label>
      )}

      <div className={wrapperClass}>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaClass}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError
              ? `${textareaId}-error`
              : helpText
              ? `${textareaId}-hint`
              : undefined
          }
          {...rest}
        />
      </div>

      {hasError && (
        <p id={`${textareaId}-error`} role="alert" className="flex items-center gap-1 text-xs text-error">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5h1.5v4.5h-1.5V4.5zm0 5.5h1.5v1.5h-1.5V10z" />
          </svg>
          {error}
        </p>
      )}

      {helpText && !hasError && (
        <p id={`${textareaId}-hint`} className="text-xs text-text-secondary">
          {helpText}
        </p>
      )}
    </div>
  );
});

export default Textarea;
