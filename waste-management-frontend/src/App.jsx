import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// ✅ Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

// ✅ Role-based Dashboards
import UserDashboard from "./components/user/UserDashboard";
import DriverDashboard from "./components/Driver/DriverDashboard";
import AdminDashboard from "./components/admin/AdminDashboard"; // future use

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 🟢 Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🟠 Common User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user", "driver", "admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* 🚛 Driver Dashboard */}
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute allowedRoles={["driver"]}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* ⚡ Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ❌ Fallback route (optional) */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-screen text-2xl font-bold text-red-600">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
