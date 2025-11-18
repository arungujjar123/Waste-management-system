import { useEffect, useState } from "react";
import { getAllPickups, updatePickupStatus } from "../../api/adminApi";

export default function PickupManagement() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllPickups();
      console.log("✅ Pickups fetched:", data);
      setPickups(Array.isArray(data) ? data : []); // Fix: Handle direct array response
    } catch (err) {
      console.error("Error fetching pickups:", err);
      setError("Failed to fetch pickups. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (pickupId, newStatus) => {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;

    try {
      await updatePickupStatus(pickupId, newStatus);
      setPickups((prev) =>
        prev.map((p) => (p._id === pickupId ? { ...p, status: newStatus } : p))
      );
      alert("✅ Status updated successfully");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("❌ Failed to update status");
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-300 mt-10">Loading pickups...</p>
    );
  if (error)
    return (
      <div className="text-center mt-10">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchPickups}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="p-6 bg-gray-800 shadow-lg rounded-2xl mt-8">
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
        🗑️ Pickup Management
      </h2>

      {pickups.length === 0 ? (
        <p className="text-gray-400 text-center">No pickup requests found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-left text-white">
                <th className="px-4 py-3 border-b border-gray-700">User</th>
                <th className="px-4 py-3 border-b border-gray-700">
                  Waste Type
                </th>
                <th className="px-4 py-3 border-b border-gray-700">Address</th>
                <th className="px-4 py-3 border-b border-gray-700">
                  Scheduled
                </th>
                <th className="px-4 py-3 border-b border-gray-700">Status</th>
                <th className="px-4 py-3 border-b border-gray-700 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pickups.map((pickup) => (
                <tr
                  key={pickup._id}
                  className="hover:bg-gray-700 transition text-white"
                >
                  <td className="px-4 py-3 border-b border-gray-700">
                    {pickup.user?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700">
                    {pickup.wasteType}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700">
                    {pickup.address}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700">
                    {new Date(pickup.scheduledDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 capitalize">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        pickup.status === "completed"
                          ? "bg-green-900 text-green-300"
                          : pickup.status === "in-progress"
                          ? "bg-yellow-900 text-yellow-300"
                          : pickup.status === "assigned"
                          ? "bg-blue-900 text-blue-300"
                          : pickup.status === "cancelled"
                          ? "bg-red-900 text-red-300"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {pickup.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-center">
                    <select
                      className="border border-gray-600 bg-gray-700 text-white rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={pickup.status}
                      onChange={(e) =>
                        handleStatusUpdate(pickup._id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
