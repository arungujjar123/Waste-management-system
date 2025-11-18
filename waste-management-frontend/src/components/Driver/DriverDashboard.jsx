import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDriverPickups, updatePickupStatus } from "../../api/driverApi";

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchDriverPickups();
  }, []);

  const fetchDriverPickups = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDriverPickups();
      setPickups(data.pickups || []);
    } catch (err) {
      setError("Failed to fetch assigned pickups");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (pickupId, status) => {
    try {
      setUpdating(pickupId);
      await updatePickupStatus(pickupId, status);
      await fetchDriverPickups();
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-green-600 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 rounded-2xl shadow-2xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {user.name}! 🚛
            </h1>
            <p className="text-gray-600 mt-1">
              {user.email} • Driver Dashboard
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Error / Loading */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center text-white text-xl animate-pulse">
            Loading your assigned pickups...
          </div>
        ) : pickups.length === 0 ? (
          <div className="bg-white/80 rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">No pickups assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pickups.map((pickup) => (
              <div
                key={pickup._id}
                className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    🗑️ {pickup.wasteType}
                  </h2>
                  <p className="text-gray-700 mb-1">
                    <strong>Address:</strong> {pickup.address}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Scheduled:</strong>{" "}
                    {new Date(pickup.scheduledDate).toLocaleString()}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        pickup.status === "completed"
                          ? "text-green-600"
                          : pickup.status === "in-progress"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    >
                      {pickup.status}
                    </span>
                  </p>
                  <p className="text-gray-700 text-sm mt-2">
                    {pickup.instructions && (
                      <em>"{pickup.instructions}"</em>
                    )}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end mt-4 gap-3">
                  {pickup.status === "pending" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(pickup._id, "in-progress")
                      }
                      disabled={updating === pickup._id}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-all"
                    >
                      {updating === pickup._id
                        ? "Updating..."
                        : "Start Pickup"}
                    </button>
                  )}
                  {pickup.status === "in-progress" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(pickup._id, "completed")
                      }
                      disabled={updating === pickup._id}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all"
                    >
                      {updating === pickup._id
                        ? "Completing..."
                        : "Mark Completed"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
