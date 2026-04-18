import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";

// Layouts
import PublicLayout from "@/components/layout/PublicLayout";
import PrivateLayout from "@/components/layout/PrivateLayout";

// Route guards
import RequireAuth from "@/components/layout/RequireAuth";
import AlreadyAuth from "@/components/layout/AlreadyAuth";

// UI providers
import { ToastProvider } from "@/components/ui/Toast";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// Pages — lazy loaded
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const UsersPage = lazy(() => import("@/pages/users/UsersPage"));
const RolesPage = lazy(() => import("@/pages/roles/RolesPage"));
const AuditPage = lazy(() => import("@/pages/audit/AuditPage"));
const AttachmentsPage = lazy(() => import("@/pages/attachments/AttachmentsPage"));
const SyncCenterPage = lazy(() => import("@/pages/sync/SyncCenterPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Financial Operations module — lazy routes
import { financialOperationsRoutes } from "@/modules/financial-operations/routes";
import FinOpsLayout from "@/modules/financial-operations/components/FinOpsLayout";

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
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Rutas públicas — redirigen al dashboard si ya hay sesión */}
                <Route element={<AlreadyAuth />}>
                  <Route element={<PublicLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                  </Route>
                </Route>

                {/* Rutas privadas */}
                <Route element={<RequireAuth />}>
                  <Route element={<PrivateLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/roles" element={<RolesPage />} />
                    <Route path="/audit" element={<AuditPage />} />
                    <Route path="/attachments" element={<AttachmentsPage />} />
                    <Route path="/sync" element={<SyncCenterPage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* Financial Operations module */}
                    <Route path="/financial-operations" element={<FinOpsLayout />}>
                      <Route index element={<Navigate to="bank-accounts" replace />} />
                      {financialOperationsRoutes
                        .filter((r) => !r.index)
                        .map((r) => (
                          <Route key={r.path} path={r.path} element={<r.element />} />
                        ))}
                    </Route>
                  </Route>
                </Route>

                {/* Redireccion raiz */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
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
