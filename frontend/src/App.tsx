import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { MyAppsPage } from "@/pages/MyAppsPage";
import { AppDetailPage } from "@/pages/AppDetailPage";
import { SystemMonitorPage } from "@/pages/SystemMonitorPage";
import { LLMProvidersPage } from "@/pages/LLMProvidersPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("ianoie_token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <AuthGuard>
                <AppShell />
              </AuthGuard>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/my-apps" element={<MyAppsPage />} />
            <Route path="/app/:id" element={<AppDetailPage />} />
            <Route path="/llm-providers" element={<LLMProvidersPage />} />
            <Route path="/system" element={<SystemMonitorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
