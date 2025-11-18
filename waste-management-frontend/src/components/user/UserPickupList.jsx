import { useEffect, useState } from "react";
import { getUserPickups, cancelPickup } from "../../api/pickupApi";

export default function UserPickupList() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const data = await getUserPickups();
      setPickups(data.pickups || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load pickups");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this pickup?")) return;
    try {
      await cancelPickup(id);
      fetchPickups(); // refresh list
      alert("Pickup cancelled successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel pickup");
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  if (loading) return <p className="text-center py-6">Loading pickups...</p>;
  if (error) return <p className="text-red-500 text-center py-6">{error}</p>;
  if (pickups.length === 0)
    return <p className="text-center py-6">No pickups found</p>;

  return (
    <div className="space-y-4">
      {pickups.map((p) => (
        <div
          key={p._id}
          className="p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">{p.wasteType}</p>
            <p className="text-sm text-gray-600">{p.address}</p>
            <p className="text-xs text-gray-500">
              {new Date(p.scheduledDate).toLocaleString()} • Status:{" "}
              <span
                className={`font-bold ${
                  p.status === "Completed"
                    ? "text-green-600"
                    : p.status === "Cancelled"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {p.status}
              </span>
            </p>
          </div>
          {p.status === "Pending" && (
            <button
              onClick={() => handleCancel(p._id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
