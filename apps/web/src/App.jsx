import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';

import PublicLayout from '@/components/layout/PublicLayout';
import PrivateLayout from '@/components/layout/PrivateLayout';
import RequireAuth from '@/components/layout/RequireAuth';
import RequireModule from '@/components/layout/RequireModule';
import AlreadyAuth from '@/components/layout/AlreadyAuth';
import { ToastProvider } from '@/components/ui/Toast';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SetupPage = lazy(() => import('@/pages/setup/SetupPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const MiPerfilPage = lazy(() => import('@/pages/profile/MiPerfilPage'));
const ModuleStorePage = lazy(() => import('@/modules/module-store/pages/ModuleStorePage'));
const UsersPage = lazy(() => import('@/pages/users/UsersPage'));
const RolesPage = lazy(() => import('@/pages/roles/RolesPage'));
const AuditPage = lazy(() => import('@/pages/audit/AuditPage'));
const AttachmentsPage = lazy(() => import('@/pages/attachments/AttachmentsPage'));
const SyncCenterPage = lazy(() => import('@/pages/sync/SyncCenterPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

import { financialOperationsRoutes } from '@/modules/financial-operations/routes';
import FinOpsLayout from '@/modules/financial-operations/components/FinOpsLayout';
import HRLayout from '@/modules/hr/components/HRLayout';
import AccountingLayout from '@/modules/accounting/components/AccountingLayout';
import EmpresaLayout from '@/modules/empresa/components/EmpresaLayout';
import InstanciaLayout from '@/modules/instancia/components/InstanciaLayout';

const HRHomePage = lazy(() => import('@/modules/hr/pages/HRHomePage'));
const EmployeesPage = lazy(() => import('@/modules/hr/pages/EmployeesPage'));
const DepartmentsPage = lazy(() => import('@/modules/hr/pages/DepartmentsPage'));
const LeavesPage = lazy(() => import('@/modules/hr/pages/LeavesPage'));
const AccountingHomePage = lazy(() => import('@/modules/accounting/pages/AccountingHomePage'));
const ChartOfAccountsPage = lazy(() => import('@/modules/accounting/pages/ChartOfAccountsPage'));
const JournalEntriesPage = lazy(() => import('@/modules/accounting/pages/JournalEntriesPage'));
const FiscalPeriodsPage = lazy(() => import('@/modules/accounting/pages/FiscalPeriodsPage'));
const IncomeStatementReportPage = lazy(
  () => import('@/modules/accounting/pages/IncomeStatementReportPage'),
);
const BalanceSheetReportPage = lazy(
  () => import('@/modules/accounting/pages/BalanceSheetReportPage'),
);
const TrialBalanceReportPage = lazy(
  () => import('@/modules/accounting/pages/TrialBalanceReportPage'),
);

const EmpresaHomePage = lazy(() => import('@/modules/empresa/pages/EmpresaHomePage'));
const EmpresaPerfilPage = lazy(() => import('@/modules/empresa/pages/EmpresaPerfilPage'));
const EmpresaMarcaPage = lazy(() => import('@/modules/empresa/pages/EmpresaMarcaPage'));
const EmpresaConfigPage = lazy(() => import('@/modules/empresa/pages/EmpresaConfigPage'));

const InstanciaHomePage = lazy(() => import('@/modules/instancia/pages/InstanciaHomePage'));
const InstanciaSessionsPage = lazy(() => import('@/modules/instancia/pages/InstanciaSessionsPage'));
const InstanciaFeatureFlagsPage = lazy(
  () => import('@/modules/instancia/pages/InstanciaFeatureFlagsPage'),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ToastProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<AlreadyAuth />}>
                    <Route element={<PublicLayout />}>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/setup" element={<SetupPage />} />
                    </Route>
                  </Route>

                  <Route element={<RequireAuth />}>
                    <Route element={<PrivateLayout />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/roles" element={<RolesPage />} />
                      <Route path="/audit" element={<AuditPage />} />
                      <Route path="/attachments" element={<AttachmentsPage />} />
                      <Route path="/sync" element={<SyncCenterPage />} />
                      <Route path="/profile" element={<MiPerfilPage />} />
                      <Route path="/settings" element={<Navigate to="/profile" replace />} />
                      <Route path="/module-store" element={<ModuleStorePage />} />
                    </Route>

                    <Route
                      path="/hr"
                      element={
                        <RequireModule moduleKey="hr">
                          <HRLayout />
                        </RequireModule>
                      }
                    >
                      <Route index element={<HRHomePage />} />
                      <Route path="employees" element={<EmployeesPage />} />
                      <Route path="departments" element={<DepartmentsPage />} />
                      <Route path="leaves" element={<LeavesPage />} />
                    </Route>

                    <Route
                      path="/accounting"
                      element={
                        <RequireModule moduleKey="accounting">
                          <AccountingLayout />
                        </RequireModule>
                      }
                    >
                      <Route index element={<AccountingHomePage />} />
                      <Route path="chart-of-accounts" element={<ChartOfAccountsPage />} />
                      <Route path="journal-entries" element={<JournalEntriesPage />} />
                      <Route path="fiscal-periods" element={<FiscalPeriodsPage />} />
                      <Route
                        path="reports/income-statement"
                        element={<IncomeStatementReportPage />}
                      />
                      <Route path="reports/balance-sheet" element={<BalanceSheetReportPage />} />
                      <Route path="reports/trial-balance" element={<TrialBalanceReportPage />} />
                    </Route>

                    <Route
                      path="/financial-operations"
                      element={
                        <RequireModule moduleKey="financial-operations">
                          <FinOpsLayout />
                        </RequireModule>
                      }
                    >
                      <Route index element={<Navigate to="bank-accounts" replace />} />
                      {financialOperationsRoutes
                        .filter((r) => !r.index)
                        .map((r) => (
                          <Route key={r.path} path={r.path} element={<r.element />} />
                        ))}
                    </Route>
                  </Route>

                  <Route path="/empresa" element={<EmpresaLayout />}>
                    <Route index element={<EmpresaHomePage />} />
                    <Route path="perfil" element={<EmpresaPerfilPage />} />
                    <Route path="marca" element={<EmpresaMarcaPage />} />
                    <Route path="configuracion" element={<EmpresaConfigPage />} />
                  </Route>

                  <Route path="/instancia" element={<InstanciaLayout />}>
                    <Route index element={<InstanciaHomePage />} />
                    <Route path="sesiones" element={<InstanciaSessionsPage />} />
                    <Route path="funciones" element={<InstanciaFeatureFlagsPage />} />
                  </Route>

                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default App;
