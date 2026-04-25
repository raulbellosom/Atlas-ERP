const MODULE_MANIFEST = {
  'financial-operations': {
    label: 'Tesorería',
    category: 'Finanzas',
    route: '/financial-operations/bank-accounts',
    accentColor: 'bg-blue-500/10',
    accentFg: 'text-blue-600',
    icon: ({ size = 28, className = '' }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  accounting: {
    label: 'Contabilidad',
    category: 'Finanzas',
    route: '/accounting',
    accentColor: 'bg-emerald-500/10',
    accentFg: 'text-emerald-600',
    icon: ({ size = 28, className = '' }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M9 13h6M9 17h4" />
      </svg>
    ),
  },
  hr: {
    label: 'Recursos Humanos',
    category: 'Personas',
    route: '/hr',
    accentColor: 'bg-violet-500/10',
    accentFg: 'text-violet-600',
    icon: ({ size = 28, className = '' }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  empresa: {
    label: 'Empresa',
    category: 'Plataforma',
    route: '/empresa',
    accentColor: 'bg-amber-500/10',
    accentFg: 'text-amber-600',
    icon: ({ size = 28, className = '' }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect x="2" y="7" width="20" height="15" rx="1" />
        <path d="M16 22V7l-4-5-4 5v15" />
        <line x1="9" y1="12" x2="9" y2="12.01" />
        <line x1="15" y1="12" x2="15" y2="12.01" />
      </svg>
    ),
  },
};

const FALLBACK_META = {
  label: null,
  category: 'Módulos',
  route: null,
  accentColor: 'bg-surface-subtle',
  accentFg: 'text-text-disabled',
  icon: ({ size = 28, className = '' }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 8a2 2 0 0 0-1.05-1.76l-7-3.94a2 2 0 0 0-1.9 0l-7 3.94A2 2 0 0 0 3 8v8a2 2 0 0 0 1.05 1.76l7 3.94a2 2 0 0 0 1.9 0l7-3.94A2 2 0 0 0 21 16z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  ),
};

export function getModuleMeta(moduleKey) {
  return MODULE_MANIFEST[moduleKey] ?? { ...FALLBACK_META, label: moduleKey };
}

export default MODULE_MANIFEST;
