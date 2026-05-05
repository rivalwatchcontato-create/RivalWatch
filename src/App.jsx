import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Home from '@/pages/Home';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Competitors from '@/pages/Competitors';
import CompetitorDetail from '@/pages/CompetitorDetail';
import Alerts from '@/pages/Alerts';
import Insights from '@/pages/Insights';
import Settings from '@/pages/Settings';

// Protects /dashboard/* — redirects to home if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground font-medium">Carregando RivalWatch...</span>
        </div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') return <UserNotRegisteredError />;
  if (authError?.type === 'auth_required') {
    navigateToLogin();
    return null;
  }

  if (!isAuthenticated) {
    navigateToLogin();
    return null;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<Home />} />

            {/* Protected app routes under /dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
            </Route>

            <Route
              path="/competitors"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Competitors />} />
              <Route path=":id" element={<CompetitorDetail />} />
            </Route>

            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Alerts />} />
            </Route>

            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Insights />} />
            </Route>

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Settings />} />
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;