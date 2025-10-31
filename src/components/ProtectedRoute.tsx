import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: ("patient" | "doctor")[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  if (roles && roles.length > 0) {
    const userRole = (sessionStorage.getItem('userRole') || '').toLowerCase();
    if (!roles.includes(userRole as any)) {
      // If role mismatch, send to their home if known, else login
      if (userRole === 'patient') return <Navigate to="/patient/dashboard" replace />;
      if (userRole === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
      return <Navigate to="/login" replace />;
    }
  }
  return <>{children}</>;
};

export default ProtectedRoute;
