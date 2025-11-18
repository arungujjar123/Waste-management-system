import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserDashboard from "../components/user/UserDashboard";
import DriverDashboard from "../components/Driver/DriverDashboard";
import AdminDashboard from "../components/admin/AdminDashboard";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <LoadingSpinner />;
  }

  // Route to role-specific dashboards
  switch (user.role) {
    case "user":
      return <UserDashboard />;
    case "driver":
      return <DriverDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}
