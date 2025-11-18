import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPickupStats, createPickupRequest } from "../../api/pickupApi";
import UserPickupList from "./UserPickupList";

export default function UserDashboard() {
  const { user, logout } = useAuth();

  // 1️⃣ Stats state management
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    inProgress: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  // 2️⃣ Enhanced pickup form state with location
  const [formData, setFormData] = useState({
    wasteType: "",
    address: "",
    scheduledDate: "",
    scheduledTime: "",
    instructions: "",
    location: null, // ✅ Location coordinates
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // 3️⃣ Component mount पर stats fetch करो
  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  // 4️⃣ Stats fetch करने का function
  const fetchUserStats = async () => {
    try {
      console.log("📊 Fetching user pickup stats...");
      setStatsLoading(true);
      setStatsError("");

      const data = await getPickupStats();
      console.log("✅ Stats received:", data.stats);

      setStats(data.stats);
    } catch (error) {
      console.error("❌ Stats fetch failed:", error);
      setStatsError("Failed to load pickup statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  // 5️⃣ Retry function
  const retryStats = () => {
    fetchUserStats();
  };

  // 6️⃣ Get User Location Function
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      console.log("🌍 Getting user location...");
      setLocationLoading(true);
      setLocationError("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = [
            position.coords.longitude, // GeoJSON format: [lng, lat]
            position.coords.latitude,
          ];

          const location = {
            type: "Point",
            coordinates: coordinates,
          };

          console.log("✅ Location obtained:", location);
          setLocationLoading(false);
          resolve(location);
        },
        (error) => {
          console.error("❌ Location error:", error);
          setLocationLoading(false);

          let errorMessage = "Failed to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location permission denied. Please allow location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }

          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    });
  };

  // 7️⃣ Auto-detect location when form opens
  const handleAutoLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setFormData((prev) => ({
        ...prev,
        location: location,
      }));

      // Optional: Get readable address from coordinates
      await getAddressFromCoordinates(location.coordinates);
    } catch (error) {
      console.error("Auto location failed:", error);
      setLocationError(error.message);
    }
  };

  // 8️⃣ Reverse Geocoding (Optional)
  const getAddressFromCoordinates = async (coordinates) => {
    try {
      const [lng, lat] = coordinates;
      console.log(`📍 Coordinates: ${lat}, ${lng}`);
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
  };

  // 9️⃣ Form handling functions
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear messages when user starts typing
    if (formError) setFormError("");
    if (formSuccess) setFormSuccess("");
    if (locationError) setLocationError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Enhanced validation with location
    if (
      !formData.wasteType ||
      !formData.address ||
      !formData.scheduledDate ||
      !formData.scheduledTime
    ) {
      setFormError("Please fill all required fields");
      return;
    }

    if (!formData.location) {
      setFormError("Please get your current location to find nearby drivers");
      return;
    }

    try {
      console.log("📝 Creating new pickup request with location...");
      setFormLoading(true);
      setFormError("");
      setFormSuccess("");

      // Combine date and time
      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      const pickupData = {
        wasteType: formData.wasteType,
        address: formData.address,
        location: formData.location, // ✅ Include GPS coordinates
        scheduledDate: scheduledDateTime,
        instructions: formData.instructions || "",
      };

      console.log("📤 Pickup data with location:", pickupData);

      const response = await createPickupRequest(pickupData);
      console.log("✅ Pickup created:", response);

      // Success handling
      setFormSuccess(
        `Pickup request created successfully! 🎉 ${
          response.pickup?.assignedDriver
            ? `Assigned to: ${response.pickup.assignedDriver.name}`
            : "Finding nearest driver..."
        }`
      );

      // Reset form
      setFormData({
        wasteType: "",
        address: "",
        scheduledDate: "",
        scheduledTime: "",
        instructions: "",
        location: null,
      });

      // Clear location state
      setLocationError("");

      // Refresh stats to show updated count
      fetchUserStats();
    } catch (error) {
      console.error("❌ Pickup creation failed:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to create pickup request. Make sure there are available drivers nearby."
      );
    } finally {
      setFormLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
        <div className="text-white text-2xl font-bold">
          Loading user data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                {user.email} •{" "}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account
              </p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              📊 Your Pickup Statistics
            </h2>
            <button
              onClick={retryStats}
              disabled={statsLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {statsLoading ? "🔄 Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {/* Loading State */}
          {statsLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">
                Loading your pickup statistics...
              </p>
            </div>
          )}

          {/* Error State */}
          {statsError && !statsLoading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😞</div>
              <p className="text-red-600 font-semibold mb-4">{statsError}</p>
              <button
                onClick={retryStats}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Stats Cards Grid */}
          {!statsLoading && !statsError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Pickups Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Total Pickups
                    </p>
                    <p className="text-4xl font-bold mt-2">{stats.total}</p>
                    <p className="text-blue-100 text-xs mt-1">
                      All time requests
                    </p>
                  </div>
                  <div className="text-5xl opacity-80">📦</div>
                </div>
              </div>

              {/* Pending Pickups Card */}
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">
                      Pending
                    </p>
                    <p className="text-4xl font-bold mt-2">{stats.pending}</p>
                    <p className="text-yellow-100 text-xs mt-1">
                      Awaiting pickup
                    </p>
                  </div>
                  <div className="text-5xl opacity-80">⏳</div>
                </div>
              </div>

              {/* Completed Pickups Card */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Completed
                    </p>
                    <p className="text-4xl font-bold mt-2">{stats.completed}</p>
                    <p className="text-green-100 text-xs mt-1">
                      Successfully picked up
                    </p>
                  </div>
                  <div className="text-5xl opacity-80">✅</div>
                </div>
              </div>

              {/* Cancelled Pickups Card */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">
                      Cancelled
                    </p>
                    <p className="text-4xl font-bold mt-2">{stats.cancelled}</p>
                    <p className="text-red-100 text-xs mt-1">
                      Cancelled requests
                    </p>
                  </div>
                  <div className="text-5xl opacity-80">❌</div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!statsLoading && !statsError && stats.total === 0 && (
            <div className="text-center py-8 border-t border-gray-200 mt-6">
              <div className="text-6xl mb-4">🚮</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No pickup requests yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first pickup request to see statistics here!
              </p>
              <button
                onClick={() => {
                  const formSection = document
                    .querySelector("form")
                    .closest(".bg-white\\/90");
                  if (formSection) {
                    formSection.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    setTimeout(() => {
                      const firstField = document.querySelector(
                        'select[name="wasteType"]'
                      );
                      if (firstField) firstField.focus();
                    }, 500);
                  }
                }}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg"
              >
                📝 Create First Pickup Request
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Create Pickup Form Section with GPS */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              ➕ Create New Pickup Request
            </h2>
            <div className="text-sm text-gray-600">
              GPS-enabled driver assignment
            </div>
          </div>

          {/* Location Status Card */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-500 text-xl mr-3">📍</span>
                <div>
                  <p className="text-blue-800 font-medium">
                    {formData.location
                      ? "✅ Location Detected"
                      : "📍 Location Required"}
                  </p>
                  <p className="text-blue-600 text-sm">
                    {formData.location
                      ? `Coordinates: ${formData.location.coordinates[1].toFixed(
                          6
                        )}, ${formData.location.coordinates[0].toFixed(6)}`
                      : "Get your current location to find nearby drivers"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleAutoLocation}
                disabled={locationLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Getting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="mr-1">🌍</span>
                    Get Location
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Location Error */}
          {locationError && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-yellow-500 text-xl mr-3">⚠️</span>
                <span className="text-yellow-800 font-medium">
                  {locationError}
                </span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {formSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✅</span>
                <span className="text-green-800 font-medium">
                  {formSuccess}
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-3">❌</span>
                <span className="text-red-800 font-medium">{formError}</span>
              </div>
            </div>
          )}

          {/* Enhanced Pickup Form */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Row 1: Waste Type and Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Waste Type Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Waste Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="wasteType"
                  value={formData.wasteType}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Waste Type</option>
                  <option value="Dry Waste">
                    🗂️ Dry Waste (Paper, Plastic, Metal)
                  </option>
                  <option value="Wet Waste">
                    🍃 Wet Waste (Food, Organic)
                  </option>
                  <option value="E-waste">💻 E-waste (Electronics)</option>
                  <option value="Mixed Waste">♻️ Mixed Waste</option>
                  <option value="Hazardous Waste">⚠️ Hazardous Waste</option>
                </select>
              </div>

              {/* Address Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pickup Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Enter your detailed pickup address"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include landmarks, floor number, etc. for easy pickup
                </p>
              </div>
            </div>

            {/* Row 2: Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pickup Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleFormChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Time Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pickup Time <span className="text-red-500">*</span>
                </label>
                <select
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Time Slot</option>
                  <option value="09:00">🌅 9:00 AM - 10:00 AM</option>
                  <option value="10:00">☀️ 10:00 AM - 11:00 AM</option>
                  <option value="11:00">☀️ 11:00 AM - 12:00 PM</option>
                  <option value="14:00">🌞 2:00 PM - 3:00 PM</option>
                  <option value="15:00">🌞 3:00 PM - 4:00 PM</option>
                  <option value="16:00">🌆 4:00 PM - 5:00 PM</option>
                  <option value="17:00">🌆 5:00 PM - 6:00 PM</option>
                </select>
              </div>
            </div>

            {/* Row 3: Instructions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleFormChange}
                placeholder="Any special instructions (e.g., gate code, building entrance, contact number, etc.)"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={formLoading || !formData.location}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {formLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Finding Driver...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="mr-2">🚛</span>
                    Create Pickup Request
                  </div>
                )}
              </button>
            </div>

            {/* Info Text */}
            <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <p className="flex items-center justify-center">
                <span className="mr-2">💡</span>
                We'll automatically find the nearest available driver within 5km
                radius
              </p>
            </div>
          </form>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🚀 Advanced Features Available
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>GPS-based driver assignment</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Real-time pickup statistics</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Email & push notifications</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-blue-500">🔄</span>
              <span>View pickup history & tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
