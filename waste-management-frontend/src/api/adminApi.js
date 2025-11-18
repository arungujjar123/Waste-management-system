import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

export const getAdminStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch admin stats", error);
    return {
      totalUsers: 0,
      totalDrivers: 0,
      totalPickups: 0,
      pendingPickups: 0,
    };
  }
};

// 🔹 Get all users
export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // Fix: Return direct array response
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; // Let component handle the error
  }
};

// 🔹 Delete user by ID
export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// 🔹 Get all pickup requests
export const getAllPickups = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/pickup/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // Fix: Return direct array response
  } catch (error) {
    console.error("Error fetching pickups:", error);
    throw error; // Let component handle the error
  }
};

// 🔹 Update pickup status
export const updatePickupStatus = async (pickupId, newStatus) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.patch(
      `${API_URL}/pickup/${pickupId}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("Error updating pickup status:", error);
    throw error;
  }
};

// 🔹 Get all drivers
export const getAllDrivers = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/drivers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // Fix: Return direct array response
  } catch (error) {
    console.error("Error fetching drivers:", error);
    throw error; // Let component handle the error
  }
};

// 🔹 Update driver status (active/inactive)
export const updateDriverStatus = async (driverId, status) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.patch(
      `${API_URL}/drivers/${driverId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("Error updating driver status:", error);
    throw error;
  }
};

// 🔹 Assign pickup to driver
export const assignPickupToDriver = async (pickupId, driverId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_URL}/pickup/${pickupId}/assign`,
      { driverId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("Error assigning pickup to driver:", error);
    throw error;
  }
};
