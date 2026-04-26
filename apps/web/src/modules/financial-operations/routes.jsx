import { lazy } from "react";

/**
 * Definición de rutas del módulo Financial Operations.
 *
 * Convención de nomenclatura: T-0020 (kebab-case, /<modulo>/<recurso>).
 * Todas las páginas son lazy-loaded para code-splitting.
 *
 * Rutas:
 *   /financial-operations                      → redirect a bank-accounts
 *   /financial-operations/bank-accounts         → listado
 *   /financial-operations/bank-accounts/new     → crear
 *   /financial-operations/bank-accounts/:id     → detalle
 *   /financial-operations/bank-accounts/:id/edit → editar
 *   /financial-operations/movements             → listado
 *   /financial-operations/movements/new         → crear movimiento manual
 *   /financial-operations/movements/:id         → detalle
 *   /financial-operations/movements/:id/edit    → editar movimiento
 *   /financial-operations/transfers/new         → crear transferencia
 *   /financial-operations/reconciliation        → listado sesiones
 *   /financial-operations/reconciliation/:id    → flujo visual
 *   /financial-operations/balances              → saldos/resumen
 *   /financial-operations/receivables           → CxC simples
 *   /financial-operations/payables              → CxP simples
 */

// ─── Pages lazy-loaded ───────────────────────────────────────────────────────

const BankAccountsPage = lazy(
  () => import("@/pages/financial-operations/BankAccountsPage"),
);
const BankAccountFormPage = lazy(
  () => import("@/pages/financial-operations/BankAccountFormPage"),
);
const BankAccountDetailPage = lazy(
  () => import("@/pages/financial-operations/BankAccountDetailPage"),
);
const MovementsPage = lazy(
  () => import("@/pages/financial-operations/MovementsPage"),
);
const MovementFormPage = lazy(
  () => import("@/pages/financial-operations/MovementFormPage"),
);
const MovementDetailPage = lazy(
  () => import("@/pages/financial-operations/MovementDetailPage"),
);
const TransferFormPage = lazy(
  () => import("@/pages/financial-operations/TransferFormPage"),
);
const ReconciliationPage = lazy(
  () => import("@/pages/financial-operations/ReconciliationPage"),
);
const ReconciliationFlowPage = lazy(
  () => import("@/pages/financial-operations/ReconciliationFlowPage"),
);
const BalancesPage = lazy(
  () => import("@/pages/financial-operations/BalancesPage"),
);
const ReceivablesPage = lazy(
  () => import("@/pages/financial-operations/ReceivablesPage"),
);
const PayablesPage = lazy(
  () => import("@/pages/financial-operations/PayablesPage"),
);

// ── Reportes ──
const MovementsReportPage = lazy(
  () => import("@/pages/financial-operations/reports/MovementsReportPage"),
);
const MovementsByAccountReportPage = lazy(
  () => import("@/pages/financial-operations/reports/MovementsByAccountReportPage"),
);
const BalancesReportPage = lazy(
  () => import("@/pages/financial-operations/reports/BalancesReportPage"),
);
const TransfersReportPage = lazy(
  () => import("@/pages/financial-operations/reports/TransfersReportPage"),
);
const ReceivablesReportPage = lazy(
  () => import("@/pages/financial-operations/reports/ReceivablesReportPage"),
);
const PayablesReportPage = lazy(
  () => import("@/pages/financial-operations/reports/PayablesReportPage"),
);

// ─── Route config ────────────────────────────────────────────────────────────

/**
 * Array de objetos de ruta compatibles con React Router v6.
 * Se importa desde App.jsx para montar bajo `<Route path="/financial-operations/*">`.
 */
export const financialOperationsRoutes = [
  // ── Cuentas bancarias ──
  { index: true, element: null, redirectTo: "bank-accounts" },
  { path: "bank-accounts", element: BankAccountsPage },
  { path: "bank-accounts/new", element: BankAccountFormPage },
  { path: "bank-accounts/:id", element: BankAccountDetailPage },
  { path: "bank-accounts/:id/edit", element: BankAccountFormPage },

  // ── Movimientos ──
  { path: "movements", element: MovementsPage },
  { path: "movements/new", element: MovementFormPage },
  { path: "movements/:id", element: MovementDetailPage },
  { path: "movements/:id/edit", element: MovementFormPage },

  // ── Transferencias ──
  { path: "transfers/new", element: TransferFormPage },

  // ── Conciliación ──
  { path: "reconciliation", element: ReconciliationPage },
  { path: "reconciliation/:id", element: ReconciliationFlowPage },

  // ── Saldos ──
  { path: "balances", element: BalancesPage },

  // ── CxC / CxP ──
  { path: "receivables", element: ReceivablesPage },
  { path: "payables", element: PayablesPage },

  // ── Reportes ──
  { path: "reports/movements", element: MovementsReportPage },
  { path: "reports/movements-by-account", element: MovementsByAccountReportPage },
  { path: "reports/balances", element: BalancesReportPage },
  { path: "reports/transfers", element: TransfersReportPage },
  { path: "reports/receivables", element: ReceivablesReportPage },
  { path: "reports/payables", element: PayablesReportPage },
];

/**
 * Permisos del módulo Financial Operations.
 * Formato: recurso:acción según convención del backend.
 */
export const FINOPS_PERMISSIONS = {
  BANK_ACCOUNT_READ: "finops:bank_account:read",
  BANK_ACCOUNT_WRITE: "finops:bank_account:write",
  MOVEMENT_READ: "finops:financial_movement:read",
  MOVEMENT_WRITE: "finops:financial_movement:write",
  TRANSFER_READ: "finops:transfer:read",
  TRANSFER_WRITE: "finops:transfer:write",
  RECONCILIATION_READ: "finops:reconciliation:read",
  RECONCILIATION_WRITE: "finops:reconciliation:write",
  BALANCE_READ: "finops:balance_snapshot:read",
  ATTACHMENT_WRITE: "finops:attachment:write",
  RECEIVABLE_READ: "finops:receivable:read",
  RECEIVABLE_WRITE: "finops:receivable:write",
  PAYABLE_READ: "finops:payable:read",
  PAYABLE_WRITE: "finops:payable:write",
};
