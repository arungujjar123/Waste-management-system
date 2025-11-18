import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./common/LoadingSpinner";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();

  // 1️⃣ Jab tak auth check ho raha hai
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2️⃣ Agar user login nahi hai
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3️⃣ Role-based access check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Agar galat role hai to redirect according to user role
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "driver":
        return <Navigate to="/driver/dashboard" replace />;
      case "user":
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // 4️⃣ Sab sahi hai → Page render karo
  return children;
}
