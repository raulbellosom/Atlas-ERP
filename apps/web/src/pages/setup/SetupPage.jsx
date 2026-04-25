import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import Select from '@/components/ui/Select';

/* ── Animation keyframes injected once ─────────────────────────────────────── */

const ANIM_CSS = `
  @keyframes stepIn {
    from { opacity: 0; transform: translateY(14px) scale(0.99); }
    to   { opacity: 1; transform: translateY(0)     scale(1);    }
  }
  @keyframes floatA {
    0%,100% { transform: translateY(0)    scale(1);    }
    50%      { transform: translateY(-18px) scale(1.04); }
  }
  @keyframes floatB {
    0%,100% { transform: translateY(0)    scale(1);    }
    50%      { transform: translateY(14px)  scale(0.97); }
  }
  @keyframes pulseRing {
    0%,100% { opacity:0.6; transform:scale(1);   }
    50%      { opacity:0.3; transform:scale(1.08); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

/* ── Helpers ────────────────────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function calcStrength(pwd) {
  if (!pwd) return { score: 0, label: '', checks: {} };
  const c = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /\d/.test(pwd),
    symbol: /[^A-Za-z0-9]/.test(pwd),
  };
  const score = Object.values(c).filter(Boolean).length;
  const labels = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
  return { score, label: labels[score] || '', checks: c };
}

function genPassword() {
  const u = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const l = 'abcdefghijklmnopqrstuvwxyz';
  const n = '0123456789';
  const s = '!@#$%&*()_+';
  const all = u + l + n + s;
  const rnd = (pool) => pool[Math.floor(Math.random() * pool.length)];
  const base = [rnd(u), rnd(l), rnd(n), rnd(s)];
  const rest = Array.from({ length: 8 }, () => rnd(all));
  return [...base, ...rest].sort(() => Math.random() - 0.5).join('');
}

function validateStep(step, form) {
  const errors = {};
  if (step === 1) {
    if (!form.ownerFirstName.trim() || form.ownerFirstName.trim().length < 2)
      errors.ownerFirstName = 'Ingresa tu nombre (mín. 2 caracteres).';
    if (!form.ownerLastName.trim() || form.ownerLastName.trim().length < 2)
      errors.ownerLastName = 'Ingresa tus apellidos (mín. 2 caracteres).';
    if (!EMAIL_RE.test(form.ownerEmail.trim()))
      errors.ownerEmail = 'Ingresa un correo electrónico válido.';
  }
  if (step === 2) {
    if (!form.businessLegalName.trim() || form.businessLegalName.trim().length < 2)
      errors.businessLegalName = 'La razón social es requerida (mín. 2 caracteres).';
    if (!form.businessName.trim() || form.businessName.trim().length < 2)
      errors.businessName = 'El nombre comercial es requerido (mín. 2 caracteres).';
  }
  if (step === 3) {
    const { score } = calcStrength(form.ownerPassword);
    if (!form.ownerPassword) errors.ownerPassword = 'La contraseña es requerida.';
    else if (score < 3)
      errors.ownerPassword =
        'La contraseña es demasiado débil. Agrega mayúsculas, números y símbolos.';
    if (!form.ownerPasswordConfirm) errors.ownerPasswordConfirm = 'Confirma tu contraseña.';
    else if (form.ownerPassword !== form.ownerPasswordConfirm)
      errors.ownerPasswordConfirm = 'Las contraseñas no coinciden.';
  }
  return errors;
}

/* ── SVG Icon ───────────────────────────────────────────────────────────────── */

const PATHS = {
  check: 'm4.5 12.75 6 6 9-13.5',
  eye: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  eyeOff:
    'M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88',
  refresh:
    'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
  copy: 'M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z',
  edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125',
  rArrow: 'M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3',
  lArrow: 'M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18',
  shield:
    'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
  chart:
    'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
  cloud:
    'M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z',
  cubes:
    'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z',
  users:
    'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
  sparkle:
    'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z',
  lock: 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z',
};

function Ico({ n, size = 18, cls = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cls}
      aria-hidden="true"
    >
      <path d={PATHS[n]} />
    </svg>
  );
}

/* ── FloatingInput ──────────────────────────────────────────────────────────── */

function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onFocus: onFocusProp,
  error,
  success,
  required,
  autoComplete,
  helper,
  disabled,
}) {
  const [focused, setFocused] = useState(false);
  const raised = focused || Boolean(value);

  const borderCls = error
    ? 'border-error focus:ring-error/40'
    : success
      ? 'border-success focus:ring-success/30'
      : 'border-border focus:border-brand-500 focus:ring-brand-500/25';

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => {
            setFocused(true);
            onFocusProp?.();
          }}
          onBlur={() => setFocused(false)}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder=" "
          className={`peer w-full h-13 px-4 pt-5 pb-1 text-[15px] text-text-primary bg-surface border rounded-lg outline-none ring-0 focus:ring-2 transition-all duration-150 touch-manipulation ${borderCls} disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : helper ? `${id}-help` : undefined}
        />
        <label
          htmlFor={id}
          className={`absolute left-4 pointer-events-none select-none transition-all duration-150 ${
            raised
              ? `top-2.25 text-[11px] font-semibold ${error ? 'text-error' : 'text-brand-500'}`
              : 'top-1/2 -translate-y-1/2 text-[14px] font-medium text-text-tertiary'
          }`}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-error" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {success && !error && (
          <span
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-success pointer-events-none"
            aria-hidden="true"
          >
            <Ico n="check" size={15} />
          </span>
        )}
      </div>

      {error && (
        <p
          id={`${id}-err`}
          role="alert"
          className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-error"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </p>
      )}
      {helper && !error && (
        <p id={`${id}-help`} className="mt-1.5 text-[12px] text-text-tertiary">
          {helper}
        </p>
      )}
    </div>
  );
}

/* ── PasswordInput ──────────────────────────────────────────────────────────── */

function PasswordInput({
  id,
  label,
  value,
  onChange,
  error,
  success,
  required,
  autoComplete,
  helper,
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const raised = focused || Boolean(value);

  const borderCls = error
    ? 'border-error focus:ring-error/40'
    : success
      ? 'border-success focus:ring-success/30'
      : 'border-border focus:border-brand-500 focus:ring-brand-500/25';

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          autoComplete={autoComplete}
          placeholder=" "
          className={`peer w-full h-13 pl-4 pr-12 pt-5 pb-1 text-[15px] text-text-primary bg-surface border rounded-lg outline-none ring-0 focus:ring-2 transition-all duration-150 touch-manipulation font-mono ${borderCls}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : helper ? `${id}-help` : undefined}
        />
        <label
          htmlFor={id}
          className={`absolute left-4 pointer-events-none select-none transition-all duration-150 font-sans ${
            raised
              ? `top-2.25 text-[11px] font-semibold ${error ? 'text-error' : 'text-brand-500'}`
              : 'top-1/2 -translate-y-1/2 text-[14px] font-medium text-text-tertiary'
          }`}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-error" aria-hidden="true">
              *
            </span>
          )}
        </label>

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-sunken transition-colors cursor-pointer"
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <Ico n={show ? 'eyeOff' : 'eye'} size={16} />
        </button>
      </div>

      {error && (
        <p
          id={`${id}-err`}
          role="alert"
          className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-error"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </p>
      )}
      {helper && !error && (
        <p id={`${id}-help`} className="mt-1.5 text-[12px] text-text-tertiary">
          {helper}
        </p>
      )}
    </div>
  );
}

/* ── StrengthMeter ──────────────────────────────────────────────────────────── */

function StrengthMeter({ password }) {
  const { score, label, checks } = calcStrength(password);

  const barColor =
    ['', 'bg-error', 'bg-warning', 'bg-amber-500', 'bg-success', 'bg-success'][score] ||
    'bg-border';
  const lblColor =
    ['', 'text-error', 'text-warning', 'text-amber-600', 'text-success', 'text-success'][score] ||
    '';

  if (!password) return null;

  return (
    <div className="space-y-3 pt-0.5">
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1 flex-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < score ? barColor : 'bg-border'}`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-semibold min-w-19 text-right tabular-nums ${lblColor}`}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
        {[
          { k: 'length', t: 'Mín. 8 caracteres' },
          { k: 'upper', t: 'Letra mayúscula' },
          { k: 'lower', t: 'Letra minúscula' },
          { k: 'number', t: 'Número (0-9)' },
          { k: 'symbol', t: 'Símbolo (!@#...)' },
        ].map(({ k, t }) => (
          <div
            key={k}
            className={`flex items-center gap-1.5 text-[11px] transition-colors duration-200 ${checks[k] ? 'text-success' : 'text-text-tertiary'}`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${checks[k] ? 'bg-success' : 'bg-surface-sunken border border-border'}`}
            >
              {checks[k] && (
                <svg
                  width="7"
                  height="7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </div>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 1: Account ────────────────────────────────────────────────────────── */

function StepAccount({ form, onChange, errors }) {
  const emailOk = EMAIL_RE.test(form.ownerEmail.trim());
  const firstNameOk = form.ownerFirstName.trim().length >= 2;
  const lastNameOk = form.ownerLastName.trim().length >= 2;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingInput
          id="ownerFirstName"
          label="Nombre"
          value={form.ownerFirstName}
          onChange={onChange}
          error={errors.ownerFirstName}
          success={firstNameOk && !errors.ownerFirstName}
          required
          autoComplete="given-name"
        />
        <FloatingInput
          id="ownerLastName"
          label="Apellidos"
          value={form.ownerLastName}
          onChange={onChange}
          error={errors.ownerLastName}
          success={lastNameOk && !errors.ownerLastName}
          required
          autoComplete="family-name"
        />
      </div>
      <FloatingInput
        id="ownerEmail"
        label="Correo electrónico"
        type="email"
        value={form.ownerEmail}
        onChange={onChange}
        error={errors.ownerEmail}
        success={emailOk && !errors.ownerEmail}
        required
        autoComplete="email"
        helper="Será tu usuario para iniciar sesión en AtlasERP"
      />
    </div>
  );
}

/* ── Step 2: Company ────────────────────────────────────────────────────────── */

const INDUSTRIES = [
  'Manufactura',
  'Comercio al por mayor',
  'Comercio al por menor',
  'Servicios profesionales',
  'Tecnología',
  'Salud y farmacia',
  'Educación',
  'Construcción',
  'Transporte y logística',
  'Alimentos y bebidas',
  'Hotelería y turismo',
  'Financiero y seguros',
  'Otro',
];

const SIZES = [
  { v: '1-10', l: '1–10 empleados' },
  { v: '11-50', l: '11–50 empleados' },
  { v: '51-200', l: '51–200 empleados' },
  { v: '201+', l: 'Más de 200 empleados' },
];

/* ── Helpers for color extraction ── */
function hexDist(a, b) {
  const p = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function extractTopColors(imageData, n = 5) {
  const { data } = imageData;
  const map = {};
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = Math.round(data[i] / 20) * 20;
    const g = Math.round(data[i + 1] / 20) * 20;
    const b = Math.round(data[i + 2] / 20) * 20;
    if (r > 235 && g > 235 && b > 235) continue;
    if (r < 15 && g < 15 && b < 15) continue;
    const key = `${r},${g},${b}`;
    map[key] = (map[key] || 0) + 1;
  }
  const sorted = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => {
      const [r, g, b] = k.split(',').map(Number);
      return '#' + [r, g, b].map((v) => Math.min(255, v).toString(16).padStart(2, '0')).join('');
    });
  const distinct = [];
  for (const hex of sorted) {
    if (distinct.every((d) => hexDist(d, hex) > 55)) distinct.push(hex);
    if (distinct.length >= n) break;
  }
  return distinct;
}

const LEGAL_ENTITY_TYPES = [
  'Persona Física',
  'S.A. de C.V.',
  'S.R.L. de C.V.',
  'S.A.S.',
  'S.A.P.I. de C.V.',
  'A.C.',
  'Otro',
];

const FISCAL_REGIMES = [
  { value: '601', label: '601 - General de Ley Personas Morales' },
  { value: '612', label: '612 - Personas Físicas con Act. Empresariales' },
  { value: '626', label: '626 - Régimen Simplificado de Confianza (RESICO)' },
  { value: '616', label: '616 - Sin obligaciones fiscales' },
  { value: '621', label: '621 - Incorporación Fiscal' },
  { value: '625', label: '625 - Plataformas Tecnológicas' },
];

function StepCompany({ form, onChange, errors, onClearError }) {
  const [logoPreview, setLogoPreview] = useState(null);
  const [palette, setPalette] = useState([]);
  const [selectedSwatch, setSelectedSwatch] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const customColorRef = useRef(null);
  const fileInputRef = useRef(null);

  const legalOk = form.businessLegalName.trim().length >= 2;
  const comrcOk = form.businessName.trim().length >= 2;

  // logo preview is managed locally via upload token; no base64 fallback needed

  const handleLogoFile = async (file) => {
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setLogoPreview(localPreview);
    setUploadError(null);

    const img = new Image();
    img.onload = () => {
      const SIZE = 80;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
      const colors = extractTopColors(imageData, 5);
      setPalette(colors);
      if (colors.length > 0) {
        setSelectedSwatch(colors[0]);
        onChange({ target: { name: 'primaryColor', value: colors[0] } });
      }
    };
    img.onerror = () => {};
    img.src = localPreview;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingLogo(true);
    try {
      const res = await apiClient.post('/v1/setup/logo-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const payload = res.data?.data ?? res.data;
      const token = payload?.logoUploadToken;

      if (!token) {
        throw new Error('No token de upload');
      }

      onChange({ target: { name: 'logoUploadToken', value: token } });
      onChange({ target: { name: 'logoFileName', value: file.name } });
      onChange({ target: { name: 'logoAttachmentId', value: '' } });
    } catch (err) {
      setUploadError(err?.response?.data?.message ?? err?.message ?? 'No se pudo subir el logo.');
      onChange({ target: { name: 'logoUploadToken', value: '' } });
    } finally {
      setUploadingLogo(false);
    }
  };

  const selectSwatch = (hex) => {
    setSelectedSwatch(hex);
    onChange({ target: { name: 'primaryColor', value: hex } });
  };

  const clearLogo = (e) => {
    e.stopPropagation();
    setLogoPreview(null);
    setPalette([]);
    setSelectedSwatch(null);
    setUploadError(null);
    onChange({ target: { name: 'logoUploadToken', value: '' } });
    onChange({ target: { name: 'logoFileName', value: '' } });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasPalette = palette.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold text-text-secondary mb-2">
          Logo de empresa <span className="font-normal text-text-tertiary ml-1">opcional</span>
        </p>
        <div
          role="button"
          tabIndex={0}
          aria-label="Seleccionar logo de empresa"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file?.type.startsWith('image/')) void handleLogoFile(file);
          }}
          className={[
            'flex items-center gap-4 p-4 rounded-xl border-2 border-dashed cursor-pointer',
            'transition-all duration-200 outline-none group',
            'focus-visible:[box-shadow:var(--shadow-focus)]',
            logoPreview
              ? 'border-brand-400/60 bg-brand-50/20'
              : 'border-border hover:border-brand-400/50 hover:bg-surface-subtle',
          ].join(' ')}
        >
          {logoPreview ? (
            <div className="w-18 h-18 rounded-xl overflow-hidden bg-white border border-border shrink-0 flex items-center justify-center shadow-sm">
              <img
                src={logoPreview}
                alt="Vista previa del logo"
                className="w-full h-full object-contain p-1.5"
              />
            </div>
          ) : (
            <div className="w-18 h-18 rounded-xl bg-surface-subtle border border-border shrink-0 flex items-center justify-center text-text-tertiary group-hover:text-brand-500 transition-colors">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {logoPreview ? (
              <>
                <p className="text-sm font-semibold text-text-primary">Logo cargado</p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {uploadingLogo
                    ? 'Subiendo logo al almacenamiento...'
                    : hasPalette
                      ? 'Selecciona un color de la paleta detectada'
                      : 'Haz clic para cambiar'}
                </p>
                <button
                  type="button"
                  onClick={clearLogo}
                  className="mt-1.5 text-xs font-medium text-error hover:underline"
                >
                  Quitar logo
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-text-primary group-hover:text-brand-600 transition-colors">
                  {uploadingLogo ? 'Subiendo...' : 'Subir imagen'}
                </p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  PNG, JPG, WEBP - Arrastra o haz clic
                </p>
              </>
            )}
          </div>

          {!logoPreview && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-text-tertiary group-hover:text-brand-500 transition-colors"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-hidden="true"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleLogoFile(file);
              e.target.value = '';
            }}
          />
        </div>
        {uploadError && <p className="mt-1.5 text-[12px] text-error">{uploadError}</p>}
      </div>

      <FloatingInput
        id="businessName"
        label="Nombre comercial"
        value={form.businessName}
        onChange={onChange}
        onFocus={() => onClearError?.('businessName')}
        error={errors.businessName}
        success={comrcOk && !errors.businessName}
        required
        autoComplete="off"
        helper="Nombre que aparecerá en la interfaz y reportes"
      />

      <FloatingInput
        id="businessLegalName"
        label="Razon social"
        value={form.businessLegalName}
        onChange={onChange}
        onFocus={() => onClearError?.('businessLegalName')}
        error={errors.businessLegalName}
        success={legalOk && !errors.businessLegalName}
        required
        autoComplete="organization"
        helper="Nombre legal registrado"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="legalEntityType"
          label="Tipo de persona"
          placeholder="Selecciona tipo"
          options={LEGAL_ENTITY_TYPES.map((t) => ({ value: t, label: t }))}
          value={form.legalEntityType}
          onValueChange={(value) => onChange({ target: { name: 'legalEntityType', value } })}
        />

        <FloatingInput
          id="rfc"
          label="RFC"
          value={form.rfc}
          onChange={onChange}
          autoComplete="off"
        />
      </div>

      <Select
        id="fiscalRegime"
        label="Régimen fiscal"
        placeholder="Selecciona régimen"
        options={FISCAL_REGIMES}
        value={form.fiscalRegime}
        onValueChange={(value) => onChange({ target: { name: 'fiscalRegime', value } })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="industry"
          label="Sector / Industria"
          placeholder="Selecciona tu sector"
          options={INDUSTRIES.map((ind) => ({ value: ind, label: ind }))}
          value={form.industry}
          onValueChange={(value) => onChange({ target: { name: 'industry', value } })}
        />

        <div>
          <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
            Tamano de empresa
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {SIZES.map(({ v, l }) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ target: { name: 'companySize', value: v } })}
                className={[
                  'px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-150 cursor-pointer',
                  form.companySize === v
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-surface border-border text-text-secondary hover:border-brand-400 hover:text-brand-600',
                ].join(' ')}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingInput
          id="phone"
          label="Teléfono"
          value={form.phone}
          onChange={onChange}
          autoComplete="tel"
        />
        <FloatingInput
          id="email"
          label="Correo de contacto"
          type="email"
          value={form.email}
          onChange={onChange}
          autoComplete="email"
        />
      </div>

      <FloatingInput
        id="website"
        label="Sitio web"
        value={form.website}
        onChange={onChange}
        autoComplete="url"
      />

      <FloatingInput
        id="street"
        label="Calle y número"
        value={form.street}
        onChange={onChange}
        autoComplete="street-address"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingInput
          id="city"
          label="Ciudad / Municipio"
          value={form.city}
          onChange={onChange}
          autoComplete="address-level2"
        />
        <FloatingInput
          id="state"
          label="Estado"
          value={form.state}
          onChange={onChange}
          autoComplete="address-level1"
        />
      </div>

      <FloatingInput
        id="postalCode"
        label="Código postal"
        value={form.postalCode}
        onChange={onChange}
        autoComplete="postal-code"
      />

      <div>
        <p className="text-[11px] font-semibold text-text-secondary mb-2 flex items-center gap-1.5">
          Color principal
          {hasPalette && (
            <span className="font-normal text-text-tertiary">paleta detectada del logo</span>
          )}
        </p>

        {hasPalette && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {palette.map((hex) => {
              const active = selectedSwatch === hex;
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => selectSwatch(hex)}
                  title={hex}
                  aria-label={'Seleccionar color ' + hex}
                  className={[
                    'relative w-9 h-9 rounded-xl border-2 transition-all duration-150 cursor-pointer',
                    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
                    'hover:scale-110 active:scale-95',
                    active
                      ? 'border-text-primary scale-110 shadow-md'
                      : 'border-transparent hover:border-border-strong',
                  ].join(' ')}
                  style={{ background: hex }}
                >
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}

            <div className="relative">
              <button
                type="button"
                title="Color personalizado"
                aria-label="Seleccionar color personalizado"
                onClick={() => customColorRef.current?.click()}
                className={[
                  'w-9 h-9 rounded-xl border-2 transition-all duration-150 cursor-pointer overflow-hidden',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
                  'hover:scale-110 active:scale-95 flex items-center justify-center',
                  selectedSwatch === 'custom'
                    ? 'border-text-primary scale-110 shadow-md'
                    : 'border-dashed border-border-strong hover:border-text-secondary',
                ].join(' ')}
                style={
                  selectedSwatch === 'custom'
                    ? { background: form.primaryColor }
                    : { background: 'var(--color-surface-subtle)' }
                }
              >
                {selectedSwatch === 'custom' ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-text-tertiary"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                )}
              </button>
              <input
                ref={customColorRef}
                type="color"
                value={form.primaryColor}
                onChange={(e) => {
                  setSelectedSwatch('custom');
                  onChange({ target: { name: 'primaryColor', value: e.target.value } });
                }}
                className="sr-only"
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        <div
          className={[
            'flex items-center gap-3 h-12 px-3 border rounded-xl bg-surface-subtle',
            'hover:border-border-strong transition-colors',
            hasPalette && selectedSwatch !== 'custom'
              ? 'border-border cursor-default'
              : 'cursor-pointer',
          ].join(' ')}
        >
          <input
            id="primaryColor"
            name="primaryColor"
            type="color"
            value={form.primaryColor}
            onChange={(e) => {
              if (!hasPalette) setSelectedSwatch(null);
              else setSelectedSwatch('custom');
              onChange({ target: { name: 'primaryColor', value: e.target.value } });
            }}
            className="h-8 w-10 rounded-lg border border-border/50 cursor-pointer bg-transparent p-0.5"
            title="Editar color manualmente"
          />
          <span className="text-sm font-mono text-text-secondary flex-1 select-all">
            {form.primaryColor}
          </span>
          <div
            className="w-5 h-5 rounded-full border border-border/40 shadow-sm shrink-0 transition-colors duration-200"
            style={{ background: form.primaryColor }}
            aria-hidden="true"
          />
        </div>
        <p className="mt-1.5 text-[12px] text-text-tertiary">
          {hasPalette
            ? 'Selecciona una muestra de la paleta o usa el selector manual'
            : 'Sube un logo para detectar colores o elige un color aqui'}
        </p>
      </div>
    </div>
  );
}

/* ── Step 3: Security ───────────────────────────────────────────────────────── */

function StepSecurity({ form, onChange, onGenerate, errors }) {
  const [copied, setCopied] = useState(false);

  const copyPwd = async () => {
    try {
      await navigator.clipboard.writeText(form.ownerPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard not available */
    }
  };

  const confirmOk = form.ownerPasswordConfirm && form.ownerPasswordConfirm === form.ownerPassword;

  return (
    <div className="space-y-4">
      {/* Generator card */}
      <div className="flex items-center gap-3 p-3.5 bg-surface-subtle border border-border-subtle rounded-lg">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'var(--gradient-accent)' }}
        >
          <Ico n="sparkle" size={15} cls="text-ink-950" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-text-primary">
            Generador de contraseña segura
          </p>
          <p className="text-[11px] text-text-tertiary mt-0.5">
            Crea automáticamente una contraseña robusta y única
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onGenerate}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface border border-border text-text-secondary hover:text-brand-600 hover:border-brand-400 transition-all duration-150 cursor-pointer"
            aria-label="Generar nueva contraseña"
          >
            <Ico n="refresh" size={15} />
          </button>
          <button
            type="button"
            onClick={copyPwd}
            disabled={!form.ownerPassword}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface border border-border text-text-secondary hover:text-brand-600 hover:border-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
            aria-label="Copiar contraseña al portapapeles"
          >
            {copied ? <Ico n="check" size={15} cls="text-success" /> : <Ico n="copy" size={15} />}
          </button>
        </div>
      </div>

      <PasswordInput
        id="ownerPassword"
        label="Contraseña"
        value={form.ownerPassword}
        onChange={onChange}
        error={errors.ownerPassword}
        required
        autoComplete="new-password"
      />

      {form.ownerPassword && <StrengthMeter password={form.ownerPassword} />}

      <PasswordInput
        id="ownerPasswordConfirm"
        label="Confirmar contraseña"
        value={form.ownerPasswordConfirm}
        onChange={onChange}
        error={errors.ownerPasswordConfirm}
        success={confirmOk && !errors.ownerPasswordConfirm}
        required
        autoComplete="new-password"
        helper="Repite la contraseña para confirmar"
      />
    </div>
  );
}

/* ── Step 4: Review ─────────────────────────────────────────────────────────── */

function StepReview({ form, onEdit }) {
  const sections = [
    {
      step: 1,
      icon: 'users',
      label: 'Cuenta de acceso',
      fields: [
        { label: 'Nombre', value: form.ownerFirstName },
        { label: 'Apellidos', value: form.ownerLastName },
        { label: 'Correo electrónico', value: form.ownerEmail },
      ],
    },
    {
      step: 2,
      icon: 'cubes',
      label: 'Perfil de empresa',
      fields: [
        { label: 'Razón social', value: form.businessLegalName },
        { label: 'Nombre comercial', value: form.businessName },
        { label: 'Tipo de persona', value: form.legalEntityType || '—' },
        { label: 'RFC', value: form.rfc || '—', mono: true },
        { label: 'Sector', value: form.industry || '—' },
        {
          label: 'Tamaño',
          value: form.companySize
            ? SIZES.find((s) => s.v === form.companySize)?.l || form.companySize
            : '—',
        },
        { label: 'Ciudad', value: form.city || '—' },
        { label: 'Estado', value: form.state || '—' },
        { label: 'Color principal', value: form.primaryColor || '—', mono: true },
        { label: 'Logo', value: form.logoFileName || '—' },
      ],
    },
    {
      step: 3,
      icon: 'lock',
      label: 'Seguridad',
      fields: [
        { label: 'Contraseña', value: '••••••••••••', mono: true },
        { label: 'Fortaleza', value: calcStrength(form.ownerPassword).label },
      ],
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 px-3.5 py-2.5 bg-success/5 border border-success/20 rounded-lg">
        <Ico n="check" size={14} cls="text-success mt-0.5 shrink-0" />
        <p className="text-[12px] text-success font-medium">
          Todo se ve bien. Revisa los datos y confirma para completar la configuración de AtlasERP.
        </p>
      </div>

      {sections.map((sec) => (
        <div key={sec.step} className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface-subtle border-b border-border">
            <div className="flex items-center gap-2">
              <Ico n={sec.icon} size={14} cls="text-brand-500" />
              <h3 className="text-[13px] font-semibold text-text-primary">{sec.label}</h3>
            </div>
            <button
              type="button"
              onClick={() => onEdit(sec.step)}
              className="flex items-center gap-1 text-[12px] text-brand-500 hover:text-brand-700 font-semibold cursor-pointer transition-colors"
            >
              <Ico n="edit" size={12} />
              Editar
            </button>
          </div>
          <div className="px-4 py-3 space-y-2">
            {sec.fields.map((f) => (
              <div key={f.label} className="flex items-baseline justify-between gap-4">
                <span className="text-[12px] text-text-tertiary shrink-0">{f.label}</span>
                <span
                  className={`text-[13px] text-text-primary font-medium text-right truncate max-w-[60%] ${f.mono ? 'font-mono' : ''}`}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── StepIndicator ──────────────────────────────────────────────────────────── */

const STEP_META = [
  { label: 'Cuenta', shortLabel: '1' },
  { label: 'Empresa', shortLabel: '2' },
  { label: 'Seguridad', shortLabel: '3' },
  { label: 'Revisión', shortLabel: '4' },
];

function StepIndicator({ current, completed }) {
  return (
    <nav aria-label="Progreso de configuración">
      <ol className="flex items-center gap-0">
        {STEP_META.map((s, i) => {
          const stepNum = i + 1;
          const isCompleted = completed.includes(stepNum);
          const isCurrent = current === stepNum;
          const isLast = i === STEP_META.length - 1;

          return (
            <li key={stepNum} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-brand-500 text-white shadow-sm'
                      : isCurrent
                        ? 'bg-brand-500 text-white shadow-md ring-4 ring-brand-500/20'
                        : 'bg-surface border-2 border-border text-text-tertiary'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? <Ico n="check" size={13} /> : stepNum}
                </div>
                {/* Label */}
                <span
                  className={`text-[10px] font-semibold whitespace-nowrap ${
                    isCurrent
                      ? 'text-brand-500'
                      : isCompleted
                        ? 'text-text-secondary'
                        : 'text-text-tertiary'
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 mx-1 mb-4 rounded-full transition-all duration-300 ${isCompleted ? 'bg-brand-500' : 'bg-border'}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── LeftPanel ──────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    ico: 'cubes',
    title: 'Módulos a la carta',
    desc: 'Instala solo lo que necesitas: finanzas, RRHH, CRM, punto de venta y más.',
  },
  {
    ico: 'shield',
    title: 'Seguridad empresarial',
    desc: 'Auditoría completa, roles granulares y control de acceso por módulo.',
  },
  {
    ico: 'cloud',
    title: 'Sincronización offline',
    desc: 'Trabaja sin conexión. Los datos se sincronizan al reconectarte.',
  },
  {
    ico: 'sparkle',
    title: 'Crece sin límites',
    desc: 'Añade nuevos módulos conforme crece tu negocio, sin migrar de plataforma.',
  },
];

/* ── AtlasLogo — compass isotipo (Meridian v2) ─────────────────────────────── */

function AtlasLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-label="AtlasERP"
      role="img"
    >
      <circle cx="18" cy="18" r="17" fill="oklch(55% 0.148 245 / 0.08)" />
      <circle
        cx="18"
        cy="18"
        r="15"
        stroke="oklch(55% 0.148 245 / 0.40)"
        strokeWidth="1"
        strokeDasharray="3 2.5"
      />
      <path
        d="M18 5.5 L9.5 30"
        stroke="oklch(78% 0.180 65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M18 5.5 L26.5 30"
        stroke="oklch(78% 0.180 65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M13 21.5 L23 21.5"
        stroke="oklch(67% 0.122 245)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="13" cy="21.5" r="1.5" fill="oklch(67% 0.122 245)" />
      <circle cx="23" cy="21.5" r="1.5" fill="oklch(67% 0.122 245)" />
      <circle cx="18" cy="21.5" r="1.5" fill="oklch(78% 0.180 65)" />
      <circle cx="18" cy="5.5" r="2.8" fill="oklch(78% 0.180 65)" />
      <circle cx="18" cy="5.5" r="1.2" fill="oklch(52% 0.150 65)" />
      <circle cx="16.8" cy="4.4" r="0.6" fill="oklch(90% 0.100 65 / 0.7)" />
    </svg>
  );
}

function LeftPanel() {
  return (
    <div
      className="h-full relative flex flex-col justify-between overflow-hidden p-10 xl:p-12"
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.045]" aria-hidden="true">
          <defs>
            <pattern id="dp" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dp)" />
        </svg>
        {/* Glow orb 1 – ink */}
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, oklch(55% 0.148 245 / 0.18), transparent 70%)',
            top: -80,
            right: -80,
            animation: 'floatA 9s ease-in-out infinite',
          }}
        />
        {/* Glow orb 2 – amber */}
        <div
          style={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, oklch(72.5% 0.192 65 / 0.13), transparent 70%)',
            bottom: 80,
            left: -60,
            animation: 'floatB 11s ease-in-out 1.5s infinite',
          }}
        />
        {/* Top amber accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'var(--gradient-accent)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full gap-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <AtlasLogo size={38} />
          <div>
            <div
              className="text-white font-bold text-[18px] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              AtlasERP
            </div>
            <span className="text-[9px] text-amber-500/60 tracking-[0.20em] uppercase font-mono">
              Meridian
            </span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="space-y-4">
          <h1
            className="text-white font-bold text-[28px] xl:text-[32px] leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            El ERP que tu empresa merece
          </h1>
          <p className="text-ink-300 text-[15px] leading-relaxed max-w-xs">
            Instala solo los módulos que necesitas hoy. Añade finanzas, RRHH, CRM, punto de venta y
            más conforme crece tu negocio.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 flex-1">
          {FEATURES.map((f) => (
            <div key={f.ico} className="flex items-start gap-3.5 group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white/5 border border-white/10 group-hover:border-amber-500/30 transition-colors duration-200">
                <Ico n={f.ico} size={16} cls="text-amber-400" />
              </div>
              <div className="pt-0.5">
                <div className="text-[13px] font-semibold text-white mb-0.5">{f.title}</div>
                <div className="text-[12px] text-ink-400 leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust badge */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {['A', 'M', 'R'].map((letter, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-ink-900 flex items-center justify-center text-[10px] font-bold text-ink-900"
                  style={{
                    background: [
                      'var(--gradient-accent)',
                      'linear-gradient(135deg,oklch(55% 0.148 245),oklch(35% 0.115 245))',
                      'linear-gradient(135deg,oklch(59% 0.168 148),oklch(42% 0.140 148))',
                    ][i],
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-ink-400 leading-tight">
              <span className="text-white font-semibold">+200 empresas</span> ya gestionan
              <br />
              sus operaciones con AtlasERP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main SetupPage ─────────────────────────────────────────────────────────── */

function buildForm() {
  return {
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPasswordConfirm: '',
    businessLegalName: '',
    businessName: '',
    legalEntityType: '',
    rfc: '',
    fiscalRegime: '',
    industry: '',
    companySize: '',
    phone: '',
    email: '',
    website: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    primaryColor: '#1d4ed8',
    logoUploadToken: '',
    logoFileName: '',
    logoAttachmentId: '',
  };
}

const TOTAL_STEPS = 4;

const STEP_INFO = [
  { title: 'Tu cuenta de acceso', desc: 'Crea las credenciales con las que accederás a AtlasERP.' },
  { title: 'Perfil de empresa', desc: 'Define la identidad legal y comercial de tu organización.' },
  { title: 'Contraseña segura', desc: 'Establece una contraseña robusta para proteger tu cuenta.' },
  {
    title: 'Revisión final',
    desc: 'Verifica que todo sea correcto antes de completar la configuración.',
  },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(buildForm);
  const [pageStatus, setPageStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState(null);
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [stepKey, setStepKey] = useState(0); // forces re-mount on step change for animation

  /* Load setup status */
  useEffect(() => {
    let mounted = true;

    async function checkStatus() {
      try {
        const res = await apiClient.get('/v1/setup/status');
        const data = res.data?.data ?? res.data;
        if (!mounted) return;
        if (!data?.setupRequired) {
          navigate('/login', { replace: true });
          return;
        }
        setPageStatus('ready');
      } catch (err) {
        if (!mounted) return;
        setLoadError(err?.message ?? 'No fue posible validar el estado de instalación.');
        setPageStatus('error');
      }
    }

    void checkStatus();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const clearError = (name) => setErrors((prev) => ({ ...prev, [name]: undefined }));

  const handleGenerate = () => {
    const pwd = genPassword();
    setForm((prev) => ({ ...prev, ownerPassword: pwd, ownerPasswordConfirm: pwd }));
    setErrors((prev) => ({ ...prev, ownerPassword: undefined, ownerPasswordConfirm: undefined }));
  };

  const goToStep = (target) => {
    setStep(target);
    setErrors({});
    setStepKey((k) => k + 1);
  };

  const handleNext = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setCompleted((prev) => (prev.includes(step) ? prev : [...prev, step]));
    goToStep(step + 1);
  };

  const handleBack = () => {
    goToStep(step - 1);
  };

  const handleEdit = (targetStep) => {
    goToStep(targetStep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      await apiClient.post('/v1/setup/initialize', {
        ownerFirstName: form.ownerFirstName.trim(),
        ownerLastName: form.ownerLastName.trim(),
        ownerEmail: form.ownerEmail.trim(),
        ownerPassword: form.ownerPassword,
        businessLegalName: form.businessLegalName.trim(),
        businessName: form.businessName.trim(),
        ...(form.legalEntityType ? { legalEntityType: form.legalEntityType } : {}),
        ...(form.rfc ? { rfc: form.rfc.trim() } : {}),
        ...(form.fiscalRegime ? { fiscalRegime: form.fiscalRegime } : {}),
        ...(form.industry ? { industry: form.industry } : {}),
        ...(form.companySize ? { companySize: form.companySize } : {}),
        ...(form.phone ? { phone: form.phone.trim() } : {}),
        ...(form.email ? { email: form.email.trim() } : {}),
        ...(form.website ? { website: form.website.trim() } : {}),
        ...(form.street ? { street: form.street.trim() } : {}),
        ...(form.city ? { city: form.city.trim() } : {}),
        ...(form.state ? { state: form.state.trim() } : {}),
        ...(form.postalCode ? { postalCode: form.postalCode.trim() } : {}),
        primaryColor: form.primaryColor,
        ...(form.logoUploadToken ? { logoUploadToken: form.logoUploadToken } : {}),
        ...(form.logoFileName ? { logoFileName: form.logoFileName } : {}),
        ...(form.logoAttachmentId ? { logoAttachmentId: form.logoAttachmentId.trim() } : {}),
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setSubmitError(
        err?.message ?? 'No fue posible completar la configuración. Inténtalo de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading state ── */
  if (pageStatus === 'loading') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'var(--gradient-mesh), var(--color-surface-subtle)' }}
      >
        <style>{ANIM_CSS}</style>
        <div className="flex flex-col items-center gap-4">
          {/* Skeleton shimmer logo */}
          <div className="w-12 h-12 rounded-xl bg-ink-100 animate-pulse" />
          <div className="space-y-2 text-center">
            <div className="h-4 w-36 rounded bg-ink-100 animate-pulse mx-auto" />
            <div className="h-3 w-24 rounded bg-ink-100 animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (pageStatus === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface-subtle">
        <style>{ANIM_CSS}</style>
        <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-error"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary mb-1">Error de conexión</h1>
            <p className="text-sm text-text-secondary">{loadError}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  /* ── Main layout ── */
  const currentStepInfo = STEP_INFO[step - 1];
  const isLastStep = step === TOTAL_STEPS;

  return (
    <div className="fixed inset-0 z-50 flex" style={{ fontFamily: 'var(--font-sans)' }}>
      <style>{ANIM_CSS}</style>

      {/* ── Left branding panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:flex-col lg:w-[46%] xl:w-[42%] shrink-0">
        <LeftPanel />
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-surface overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <AtlasLogo size={28} />
            <div>
              <span
                className="font-bold text-[15px] text-text-primary leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                AtlasERP
              </span>
              <div className="text-[9px] text-amber-600/70 tracking-[0.18em] uppercase font-mono leading-none mt-0.5">
                Meridian
              </div>
            </div>
          </div>
          <span className="text-[12px] font-semibold text-text-tertiary">
            Paso {step} de {TOTAL_STEPS}
          </span>
        </div>

        {/* Form scroll area */}
        <div className="flex-1 flex items-start justify-center">
          <div className="w-full max-w-110 px-5 sm:px-8 py-8 lg:py-12">
            {/* Step indicator */}
            <div className="mb-8">
              <StepIndicator current={step} completed={completed} />
            </div>

            {/* Step header */}
            <div className="mb-7">
              <h2
                className="text-[22px] font-bold text-text-primary mb-1.5"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {currentStepInfo.title}
              </h2>
              <p className="text-[14px] text-text-secondary leading-relaxed">
                {currentStepInfo.desc}
              </p>
            </div>

            {/* Step content — key forces animation on step change */}
            <form
              onSubmit={
                isLastStep
                  ? handleSubmit
                  : (e) => {
                      e.preventDefault();
                      handleNext();
                    }
              }
              noValidate
            >
              <div
                key={stepKey}
                style={{ animation: 'stepIn 220ms cubic-bezier(0.25,0.46,0.45,0.94) forwards' }}
              >
                {step === 1 && <StepAccount form={form} onChange={handleChange} errors={errors} />}
                {step === 2 && (
                  <StepCompany
                    form={form}
                    onChange={handleChange}
                    errors={errors}
                    onClearError={clearError}
                  />
                )}
                {step === 3 && (
                  <StepSecurity
                    form={form}
                    onChange={handleChange}
                    onGenerate={handleGenerate}
                    errors={errors}
                  />
                )}
                {step === 4 && <StepReview form={form} onEdit={handleEdit} />}
              </div>

              {/* Global submit error */}
              {submitError && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-2.5 px-4 py-3 bg-error/5 border border-error/20 rounded-lg"
                >
                  <svg
                    className="w-4 h-4 text-error mt-0.5 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <p className="text-[13px] text-error font-medium">{submitError}</p>
                </div>
              )}

              {/* Navigation */}
              <div className={`mt-8 flex gap-3 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={submitting}
                    className="flex items-center gap-2 h-11 px-5 text-sm font-semibold text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-subtle hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                  >
                    <Ico n="lArrow" size={15} />
                    Atrás
                  </button>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 h-11 px-6 text-sm font-semibold text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all duration-150 active:scale-[0.98] shadow-sm hover:shadow-md"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Configurando...
                    </>
                  ) : isLastStep ? (
                    <>
                      <Ico n="sparkle" size={15} />
                      Completar configuración
                    </>
                  ) : (
                    <>
                      Continuar
                      <Ico n="rArrow" size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-[11px] text-text-tertiary">
              AtlasERP · Configuración inicial · Sesión local segura
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
