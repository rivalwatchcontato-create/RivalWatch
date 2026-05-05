import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { AuthProvider } from "@/lib/AuthContext";

import PageNotFound from "./lib/PageNotFound";
import Home from "@/pages/Home";
import Login from "@/pages/Login";

import AppLayout from "@/components/layout/AppLayout";

import ProtectedRoute from "@/components/ProtectedRoute";

import Dashboard from "@/pages/Dashboard";
import Competitors from "@/pages/Competitors";
import CompetitorDetail from "@/pages/CompetitorDetail";
import Alerts from "@/pages/Alerts";
import Insights from "@/pages/Insights";
import Settings from "@/pages/Settings";

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* PROTECTED ROUTES */}
            <Route element={<ProtectedRoute />}>
              
              <Route element={<AppLayout />}>
                
                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/competitors" element={<Competitors />} />
                <Route path="/competitors/:id" element={<CompetitorDetail />} />

                <Route path="/alerts" element={<Alerts />} />

                <Route path="/insights" element={<Insights />} />

                <Route path="/settings" element={<Settings />} />

              </Route>

            </Route>

            {/* 404 */}
            <Route path="*" element={<PageNotFound />} />

          </Routes>
        </Router>

        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;