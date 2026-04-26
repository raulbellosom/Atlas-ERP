import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "@/api/client";
import useAuthStore from "@/store/auth.store";

/* ─── Atlas compass isotipo ───────────────────────────────────────────────── */
function AtlasLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-label="AtlasERP" role="img">
      <circle cx="18" cy="18" r="17" fill="oklch(55% 0.148 245 / 0.08)" />
      <circle cx="18" cy="18" r="15" stroke="oklch(55% 0.148 245 / 0.40)" strokeWidth="1" strokeDasharray="3 2.5" />
      <path d="M18 5.5 L9.5 30" stroke="oklch(78% 0.180 65)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 5.5 L26.5 30" stroke="oklch(78% 0.180 65)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13 21.5 L23 21.5" stroke="oklch(67% 0.122 245)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="13"  cy="21.5" r="1.5" fill="oklch(67% 0.122 245)" />
      <circle cx="23"  cy="21.5" r="1.5" fill="oklch(67% 0.122 245)" />
      <circle cx="18"  cy="21.5" r="1.5" fill="oklch(78% 0.180 65)" />
      <circle cx="18"  cy="5.5"  r="2.8"  fill="oklch(78% 0.180 65)" />
      <circle cx="18"  cy="5.5"  r="1.2"  fill="oklch(52% 0.150 65)" />
      <circle cx="16.8" cy="4.4" r="0.6" fill="oklch(90% 0.100 65 / 0.7)" />
    </svg>
  );
}

/* ─── Company monogram ────────────────────────────────────────────────────── */
function CompanyMonogram({ name, size = 36, primaryColor }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0 ring-1 ring-ink-200/30"
      style={{
        width: size,
        height: size,
        background: primaryColor || "var(--gradient-primary)",
        fontFamily: "var(--font-display)",
        fontSize: size * 0.42,
        fontWeight: 700,
        color: "#fff",
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

function CompanyBrandMark({ branding, size = 36 }) {
  const logoSrc = branding?.logoUrl || branding?.logoDataUrl || branding?.logoDataUrlLegacy;
  if (logoSrc) {
    return (
      <div
        className="rounded-xl bg-white border border-border ring-1 ring-ink-200/30 overflow-hidden flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <img
          src={logoSrc}
          alt={`Logo de ${branding?.companyName ?? "la empresa"}`}
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  }

  return <CompanyMonogram name={branding?.companyName} size={size} primaryColor={branding?.primaryColor} />;
}

/* ─── Floating-label input ────────────────────────────────────────────────── */
function FloatingInput({ id, label, type = "text", value, onChange, onBlur, error, autoComplete, inputMode, required }) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  const lifted = focused || filled;

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={[
          "peer w-full px-3.5 pt-5 pb-2 text-sm text-text-primary",
          "bg-surface-subtle border rounded-xl",
          "outline-none transition-all duration-150",
          error
            ? "border-error [box-shadow:0_0_0_1px_var(--color-error)]"
            : focused
            ? "border-ink-400 [box-shadow:var(--shadow-focus)]"
            : "border-border hover:border-border-strong",
        ].join(" ")}
      />
      <label
        htmlFor={id}
        className={[
          "absolute left-3.5 pointer-events-none select-none transition-all duration-150 origin-left",
          lifted
            ? "top-1.5 text-[10px] font-semibold tracking-wide"
            : "top-[50%] -translate-y-1/2 text-sm",
          error
            ? "text-error"
            : focused
            ? "text-ink-400"
            : "text-text-disabled",
        ].join(" ")}
      >
        {label}
      </label>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-error pl-0.5">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Password input with eye toggle ─────────────────────────────────────── */
function PasswordInput({ id, label, value, onChange, error, autoComplete }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const filled = value.length > 0;
  const lifted = focused || filled;

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        required
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={[
          "peer w-full pl-3.5 pr-11 pt-5 pb-2 text-sm text-text-primary",
          "bg-surface-subtle border rounded-xl",
          "outline-none transition-all duration-150",
          error
            ? "border-error [box-shadow:0_0_0_1px_var(--color-error)]"
            : focused
            ? "border-ink-400 [box-shadow:var(--shadow-focus)]"
            : "border-border hover:border-border-strong",
        ].join(" ")}
      />
      <label
        htmlFor={id}
        className={[
          "absolute left-3.5 pointer-events-none select-none transition-all duration-150 origin-left",
          lifted
            ? "top-1.5 text-[10px] font-semibold tracking-wide"
            : "top-[50%] -translate-y-1/2 text-sm",
          error ? "text-error" : focused ? "text-ink-400" : "text-text-disabled",
        ].join(" ")}
      >
        {label}
      </label>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors focus:outline-none"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-error pl-0.5">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Email regex ─────────────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const login     = useAuthStore((s) => s.login);

  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [branding, setBranding] = useState(null); // { companyName, primaryColor, logoUrl, logoDataUrlLegacy }

  const from = location.state?.from?.pathname ?? "/dashboard";

  /* read atlas-branding written by SetupPage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("atlas-branding");
      if (raw) setBranding(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  /* redirect to setup if needed */
  useEffect(() => {
    let mounted = true;
    async function checkStatus() {
      try {
        const res  = await apiClient.get("/v1/setup/status");
        const data = res.data?.data ?? res.data;
        const payloadBranding = data?.branding;
        if (mounted && payloadBranding) {
          setBranding((prev) => ({
            ...(prev ?? {}),
            companyName:
              payloadBranding.organizationName ??
              prev?.companyName ??
              null,
            primaryColor:
              payloadBranding.primaryColor ??
              prev?.primaryColor ??
              null,
            logoUrl: payloadBranding.logoUrl ?? null,
            logoDataUrlLegacy: payloadBranding.logoDataUrlLegacy ?? null,
          }));
        }
        if (mounted && data?.setupRequired) {
          navigate("/setup", { replace: true });
          return;
        }
      } catch { /* allow login attempt on error */ }
      finally { if (mounted) setCheckingSetup(false); }
    }
    void checkStatus();
    return () => { mounted = false; };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validateEmail = () => {
    if (!form.email) {
      setErrors((p) => ({ ...p, email: "El correo es obligatorio." }));
    } else if (!EMAIL_RE.test(form.email.trim())) {
      setErrors((p) => ({ ...p, email: "Formato de correo inválido." }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.email)                       nextErrors.email    = "El correo es obligatorio.";
    else if (!EMAIL_RE.test(form.email.trim())) nextErrors.email = "Formato de correo inválido.";
    if (!form.password)                    nextErrors.password = "La contraseña es obligatoria.";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }

    setSubmitError(null);
    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(err?.response?.data?.message ?? err?.message ?? "Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading skeleton ── */
  if (checkingSetup) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          <div className="flex items-center gap-2 text-text-disabled text-sm">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Verificando instalación...
          </div>
        </div>
      </div>
    );
  }

  const hasCompany = Boolean(
    branding?.companyName ||
    branding?.logoUrl ||
    branding?.logoDataUrl ||
    branding?.logoDataUrlLegacy,
  );

  return (
    <div className="w-full max-w-sm">
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">

        {/* ── Brand header ── */}
        <div className="px-8 pt-8 pb-6 border-b border-border">
          {hasCompany ? (
            /* dual-brand lockup */
            <div className="flex items-center justify-between gap-3">
              {/* Atlas side */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0 p-1.5 rounded-xl bg-surface-subtle border border-border ring-1 ring-border">
                  <AtlasLogo size={28} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-text-disabled leading-none" style={{ fontFamily: "var(--font-mono)" }}>
                    Powered by
                  </p>
                  <p className="text-sm font-bold text-text-primary leading-tight truncate" style={{ fontFamily: "var(--font-display)" }}>
                    AtlasERP
                  </p>
                </div>
              </div>

              {/* separator */}
              <span className="text-text-disabled text-base font-light select-none shrink-0" aria-hidden="true">×</span>

              {/* Company side */}
              <div className="flex items-center gap-2.5 min-w-0 flex-row-reverse sm:flex-row">
                <div className="min-w-0 text-right sm:text-left">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-text-disabled leading-none" style={{ fontFamily: "var(--font-mono)" }}>
                    Empresa
                  </p>
                  <p className="text-sm font-bold text-text-primary leading-tight truncate max-w-30" style={{ fontFamily: "var(--font-display)" }}>
                    {branding.companyName || "Tu empresa"}
                  </p>
                </div>
                <CompanyBrandMark branding={branding} size={36} />
              </div>
            </div>
          ) : (
            /* single-brand centered */
            <div className="flex flex-col items-center gap-3">
              <div className="p-2 rounded-2xl bg-surface-subtle border border-border ring-1 ring-border">
                <AtlasLogo size={40} />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  AtlasERP
                </h1>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-text-disabled mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                  Meridian v2
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Form ── */}
        <div className="px-8 py-7 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
              Iniciar sesión
            </h2>
            <p className="text-xs text-text-disabled mt-0.5">
              Accede a tu cuenta para continuar
            </p>
          </div>

          {submitError && (
            <div role="alert" className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-px" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FloatingInput
              id="email"
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={validateEmail}
              error={errors.email}
              autoComplete="email"
              inputMode="email"
              required
            />

            <PasswordInput
              id="password"
              label="Contraseña"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={loading}
              className={[
                "w-full py-2.5 px-4 rounded-xl",
                "text-sm font-semibold text-white",
                "transition-all duration-150 active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
                loading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:opacity-90",
              ].join(" ")}
              style={{ background: "var(--gradient-accent)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>

      </div>

      {/* ── Footer ── */}
      <p className="text-center text-[11px] text-text-disabled mt-5" style={{ fontFamily: "var(--font-mono)" }}>
        AtlasERP · Meridian v2 — © {new Date().getFullYear()}
      </p>
    </div>
  );
}
