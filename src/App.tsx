import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DoctorLayout } from "@/components/layout/DoctorLayout";
import { PatientLayout } from "@/components/layout/PatientLayout";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import SplashScreen from "@/components/SplashScreen";

// Admin Pages
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
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAssignedReports from "./pages/doctor/DoctorAssignedReports";
import DoctorReportReview from "./pages/doctor/DoctorReportReview";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorCriticalCases from "./pages/doctor/DoctorCriticalCases";
import DoctorNotifications from "./pages/doctor/DoctorNotifications";
import DoctorProfile from "./pages/doctor/DoctorProfile";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientUpload from "./pages/patient/PatientUpload";
import PatientReportStatus from "./pages/patient/PatientReportStatus";
import PatientAIResults from "./pages/patient/PatientAIResults";
import PatientFeedback from "./pages/patient/PatientFeedback";
import PatientMedicalHistory from "./pages/patient/PatientMedicalHistory";
import PatientNotifications from "./pages/patient/PatientNotifications";
import PatientProfile from "./pages/patient/PatientProfile";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') return <Navigate to="/" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
    if (user.role === 'patient') return <Navigate to="/patient" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
    if (user.role === 'patient') return <Navigate to="/patient" replace />;
  }
  return <>{children}</>;
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      
      {/* Admin Routes */}
      <Route path="/" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><Index /></MainLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><UserManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><ReportManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/assign" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><AssignReports /></MainLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><PatientHistory /></MainLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><Notifications /></MainLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><Logs /></MainLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
      
      {/* Doctor Routes */}
      <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorDashboard /></DoctorLayout></ProtectedRoute>} />
      <Route path="/doctor/reports" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorAssignedReports /></DoctorLayout></ProtectedRoute>} />
      <Route path="/doctor/review" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorReportReview /></DoctorLayout></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorPatients /></DoctorLayout></ProtectedRoute>} />
      <Route path="/doctor/critical" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorCriticalCases /></DoctorLayout></ProtectedRoute>} />
      <Route path="/doctor/notifications" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorNotifications /></DoctorLayout></ProtectedRoute>} />
      <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorProfile /></DoctorLayout></ProtectedRoute>} />
      
      {/* Patient Routes */}
      <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><PatientDashboard /></PatientLayout></ProtectedRoute>} />
      <Route path="/patient/upload" element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><PatientUpload /></PatientLayout></ProtectedRoute>} />
      <Route path="/patient/status" element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><PatientReportStatus /></PatientLayout></ProtectedRoute>} />
      <Route path="/patient/results" element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><PatientAIResults /></PatientLayout></ProtectedRoute>} />
      <Route path="/patient/feedback" element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><PatientFeedback /></PatientLayout></ProtectedRoute>} />
      <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><PatientMedicalHistory /></PatientLayout></ProtectedRoute>} />
      <Route path="/patient/notifications" element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><PatientNotifications /></PatientLayout></ProtectedRoute>} />
      <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><PatientProfile /></PatientLayout></ProtectedRoute>} />
      
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
