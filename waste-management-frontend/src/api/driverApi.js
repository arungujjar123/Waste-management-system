import axios from "axios";

const API_URL = "http://localhost:5000/api/driver";

// Add token to requests
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// fetch driver assigned pickups
export const getDriverPickups = async () => {
  try {
    const response = await axios.get(`${API_URL}/pickups`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching driver pickups:", error);
    throw error;
  }
};

// update pickup status (e.g. "in-progress", "completed")
export const updatePickupStatus = async (pickupId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/pickup/${pickupId}/status`,
      { status },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating pickup status:", error);
    throw error;
  }
};
