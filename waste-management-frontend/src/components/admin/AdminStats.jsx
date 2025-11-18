import { useState, useEffect } from "react";
import { getAdminStats } from "../../api/adminApi"; // backend API call
import { useAuth } from "../../context/AuthContext";

export default function AdminStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalPickups: 0,
    pendingPickups: 0,
    completedPickups: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      // TODO: Replace with real backend API
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error("❌ Failed to fetch admin stats:", err);
      setError("Failed to load statistics. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mb-4"></div>
        <p className="text-gray-300 font-medium">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="text-lg font-semibold">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 bg-green-500 px-5 py-2 rounded-lg text-white font-semibold hover:bg-green-600 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Users */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
        <p className="text-sm font-medium">👤 Total Users</p>
        <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
        <p className="text-xs mt-1">Registered users</p>
      </div>

      {/* Total Drivers */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
        <p className="text-sm font-medium">🚛 Total Drivers</p>
        <p className="text-4xl font-bold mt-2">{stats.totalDrivers}</p>
        <p className="text-xs mt-1">Active drivers</p>
      </div>

      {/* Total Pickups */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
        <p className="text-sm font-medium">🗑️ Total Pickups</p>
        <p className="text-4xl font-bold mt-2">{stats.totalPickups}</p>
        <p className="text-xs mt-1">All requests</p>
      </div>

      {/* Pending Pickups */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
        <p className="text-sm font-medium">⏳ Pending Pickups</p>
        <p className="text-4xl font-bold mt-2">{stats.pendingPickups}</p>
        <p className="text-xs mt-1">Awaiting action</p>
      </div>

      {/* Completed Pickups */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
        <p className="text-sm font-medium">✅ Completed Pickups</p>
        <p className="text-4xl font-bold mt-2">{stats.completedPickups}</p>
        <p className="text-xs mt-1">Successfully done</p>
      </div>
    </div>
  );
}
