import { useState, useEffect } from "react";
import { getAllUsers, deleteUser } from "../../api/adminApi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers(); // API call to fetch users
      console.log("✅ Users fetched:", data);
      setUsers(Array.isArray(data) ? data : []); // Fix: Handle direct array response
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
      setError("Failed to load users. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("❌ Failed to delete user:", err);
      alert("Failed to delete user. Try again.");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mb-4"></div>
        <p className="text-gray-300 font-medium">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="text-lg font-semibold">{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 bg-green-500 px-5 py-2 rounded-lg text-white font-semibold hover:bg-green-600 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-gray-700 hover:bg-gray-700 transition-all"
                >
                  <td className="py-3 px-6 text-white">{user.name || "N/A"}</td>
                  <td className="py-3 px-6 text-white">
                    {user.email || "N/A"}
                  </td>
                  <td className="py-3 px-6 capitalize text-white">
                    {user.role || "user"}
                  </td>
                  <td className="py-3 px-6 text-center space-x-2">
                    {/* Future: Add Edit Button */}
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-white text-sm transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
