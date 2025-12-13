import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import UserManagement from "./pages/UserManagement";
import ReportManagement from "./pages/ReportManagement";
import AssignReports from "./pages/AssignReports";
import PatientHistory from "./pages/PatientHistory";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Logs from "./pages/Logs";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><MainLayout><Index /></MainLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><MainLayout><UserManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><MainLayout><ReportManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/assign" element={<ProtectedRoute><MainLayout><AssignReports /></MainLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><MainLayout><PatientHistory /></MainLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><MainLayout><Logs /></MainLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
