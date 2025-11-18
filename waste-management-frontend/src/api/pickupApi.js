import axiosInstance from "./axiosInstance";

/**
 * 1️⃣ Fetch all pickup requests for logged-in user
 */
export const getUserPickups = async () => {
  try {
    console.log("📋 Fetching user pickup requests...");
    const response = await axiosInstance.get("/pickup/my-pickups");
    console.log("✅ User pickups fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user pickups:", error);
    throw error;
  }
};

/**
 * 2️⃣ Create a new pickup request with GPS location
 */
export const createPickupRequest = async (pickupData) => {
  try {
    console.log("🚛 Creating pickup request:", pickupData);

    if (
      !pickupData.wasteType ||
      !pickupData.address ||
      !pickupData.scheduledDate
    ) {
      throw new Error(
        "Missing required fields: wasteType, address, scheduledDate"
      );
    }

    if (
      !pickupData.location?.coordinates ||
      pickupData.location.coordinates.length !== 2
    ) {
      throw new Error("Valid GPS coordinates are required");
    }

    const [lng, lat] = pickupData.location.coordinates;
    if (typeof lng !== "number" || typeof lat !== "number") {
      throw new Error("Coordinates must be numbers");
    }

    const response = await axiosInstance.post("/pickup/create", pickupData);
    console.log("✅ Pickup created:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating pickup request:", error);
    if (error.response?.data?.message?.includes("No available drivers")) {
      throw new Error(
        "No drivers available nearby. Try later or contact support."
      );
    }
    throw error;
  }
};

/**
 * 3️⃣ Cancel pickup request
 */
export const cancelPickupRequest = async (pickupId, reason = "") => {
  try {
    if (!pickupId) throw new Error("Pickup ID is required");
    const response = await axiosInstance.patch(`/pickup/${pickupId}/cancel`, {
      reason,
    });
    console.log("✅ Pickup cancelled:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error cancelling pickup:", error);
    throw error;
  }
};

// ✅ Export alias for backward compatibility
export const cancelPickup = cancelPickupRequest;

/**
 * 4️⃣ Reschedule pickup request
 */
export const reschedulePickupRequest = async (
  pickupId,
  newDate,
  reason = ""
) => {
  try {
    if (!pickupId || !newDate)
      throw new Error("Pickup ID and new date required");

    const scheduledDate = new Date(newDate);
    if (scheduledDate <= new Date())
      throw new Error("Scheduled date must be in the future");

    const response = await axiosInstance.patch(
      `/pickup/${pickupId}/reschedule`,
      { newDate, reason }
    );
    console.log("✅ Pickup rescheduled:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error rescheduling pickup:", error);
    throw error;
  }
};

/**
 * 5️⃣ Fetch pickup statistics
 */
export const getPickupStats = async () => {
  try {
    console.log("📊 Fetching pickup statistics...");
    const response = await axiosInstance.get("/pickup/stats");
    const defaultStats = {
      total: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      inProgress: 0,
    };
    return { stats: { ...defaultStats, ...response.data.stats } };
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    return {
      stats: {
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        inProgress: 0,
      },
    };
  }
};

/**
 * 6️⃣ Update pickup status (for drivers)
 */
export const updatePickupStatus = async (pickupId, status, notes = "") => {
  try {
    if (!pickupId || !status) throw new Error("Pickup ID and status required");
    const validStatuses = [
      "pending",
      "assigned",
      "en-route",
      "in-progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status))
      throw new Error(`Invalid status: ${status}`);

    const response = await axiosInstance.patch(`/pickup/${pickupId}/status`, {
      status,
      notes,
    });
    console.log("✅ Pickup status updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating pickup status:", error);
    throw error;
  }
};

/**
 * 7️⃣ Fetch pickup by ID
 */
export const getPickupById = async (pickupId) => {
  try {
    if (!pickupId) throw new Error("Pickup ID required");
    const response = await axiosInstance.get(`/pickup/${pickupId}`);
    console.log("✅ Pickup details fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching pickup by ID:", error);
    throw error;
  }
};

/**
 * 8️⃣ Get nearby drivers (for debugging or auto-assign)
 */
export const getNearbyDrivers = async (location, maxDistance = 5000) => {
  try {
    if (!location?.coordinates)
      throw new Error("Location coordinates required");
    const response = await axiosInstance.post("/pickup/nearby-drivers", {
      location,
      maxDistance,
    });
    console.log("✅ Nearby drivers fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching nearby drivers:", error);
    throw error;
  }
};
