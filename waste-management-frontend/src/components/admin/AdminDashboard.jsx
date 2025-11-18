import { useState } from "react";
import AdminStats from "./AdminStats";
import UserManagement from "./UserManagement";
import DriverManagement from "./DriverManagement";
import PickupManagement from "./PickupManagement";
import ErrorBoundary from "../common/ErrorBoundary";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("stats");

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return (
          <ErrorBoundary>
            <UserManagement />
          </ErrorBoundary>
        );
      case "drivers":
        return (
          <ErrorBoundary>
            <DriverManagement />
          </ErrorBoundary>
        );
      case "pickups":
        return (
          <ErrorBoundary>
            <PickupManagement />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <AdminStats />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
      {/* 🌟 Header Section */}
      <header className="bg-gray-900 shadow-md py-5 px-8 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-wide">
          🚮 Admin Dashboard —{" "}
          <span className="text-green-400">{user?.name || "Admin"}</span>
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg text-white font-semibold transition-all duration-300"
        >
          Logout
        </button>
      </header>

      {/* 🧭 Tabs Navigation */}
      <nav className="flex justify-center bg-gray-800 p-3 space-x-6 border-b border-gray-700">
        {[
          { id: "stats", label: "📊 Stats" },
          { id: "users", label: "👤 Users" },
          { id: "drivers", label: "🚛 Drivers" },
          { id: "pickups", label: "🗑️ Pickups" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-semibold pb-1 transition-all duration-200 ${
              activeTab === tab.id
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-green-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 🧩 Main Content */}
      <main className="p-8">{renderTabContent()}</main>
    </div>
  );
}
