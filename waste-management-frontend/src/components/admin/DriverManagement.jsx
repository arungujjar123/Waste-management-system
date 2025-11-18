import { useEffect, useState } from "react";
import {
  getAllDrivers,
  updateDriverStatus,
  assignPickupToDriver,
} from "../../api/adminApi";

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pickupId, setPickupId] = useState(""); // For assigning pickups

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllDrivers();
      console.log("✅ Drivers fetched:", data);
      setDrivers(Array.isArray(data) ? data : []); // Fix: Handle direct array response
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setError("Failed to load drivers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (driverId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      if (!window.confirm(`Change driver status to "${newStatus}"?`)) return;

      await updateDriverStatus(driverId, newStatus);
      setDrivers((prev) =>
        prev.map((d) => (d._id === driverId ? { ...d, status: newStatus } : d))
      );
      alert(`✅ Driver status updated to "${newStatus}"`);
    } catch (err) {
      console.error("Error updating driver status:", err);
      alert("❌ Failed to update driver status");
    }
  };

  const handleAssignPickup = async (driverId) => {
    try {
      if (!pickupId.trim()) return alert("Please enter a Pickup ID first!");

      await assignPickupToDriver(pickupId, driverId);
      alert("✅ Pickup assigned successfully!");
      setPickupId("");
    } catch (err) {
      console.error("Error assigning pickup:", err);
      alert("❌ Failed to assign pickup");
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-300 mt-10">Loading drivers...</p>
    );

  if (error)
    return (
      <div className="text-center mt-10">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchDrivers}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="p-6 bg-gray-800 shadow-lg rounded-2xl mt-8">
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
        👨‍💼 Driver Management
      </h2>

      {drivers.length === 0 ? (
        <p className="text-gray-400 text-center">No drivers found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-left text-white">
                <th className="px-4 py-3 border-b border-gray-700">Name</th>
                <th className="px-4 py-3 border-b border-gray-700">Email</th>
                <th className="px-4 py-3 border-b border-gray-700">Vehicle</th>
                <th className="px-4 py-3 border-b border-gray-700">Status</th>
                <th className="px-4 py-3 border-b border-gray-700 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr
                  key={driver._id}
                  className="hover:bg-gray-700 transition text-white"
                >
                  <td className="px-4 py-3 border-b border-gray-700 font-medium">
                    {driver.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700">
                    {driver.email || "N/A"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700">
                    {driver.vehicleNumber || "N/A"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 capitalize">
                    {driver.status === "active" ? (
                      <span className="text-green-400 font-semibold flex items-center gap-1">
                        ✅ Active
                      </span>
                    ) : (
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        ❌ Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-700 text-center">
                    <button
                      onClick={() =>
                        handleStatusToggle(driver._id, driver.status)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm mr-2 transition-all"
                    >
                      Toggle Status
                    </button>

                    <div className="flex items-center gap-2 justify-center mt-2">
                      <input
                        type="text"
                        placeholder="Pickup ID"
                        value={pickupId}
                        onChange={(e) => setPickupId(e.target.value)}
                        className="border border-gray-600 bg-gray-700 text-white rounded-lg px-2 py-1 text-sm w-28 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <button
                        onClick={() => handleAssignPickup(driver._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-all"
                      >
                        🚛 Assign
                      </button>
                    </div>
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
