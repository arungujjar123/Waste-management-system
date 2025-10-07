const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const {
  signup,
  login,
  getDashboardStats,
  getAllDrivers,
  getAllPickups,
  assignDriverManually
} = require("../controllers/admin.controller");

// Auth
router.post("/signup", signup);
router.post("/login", login);

// Protected admin routes
router.get("/dashboard", protect, authorize("admin"), getDashboardStats);
router.get("/drivers", protect, authorize("admin"), getAllDrivers);
router.get("/pickups", protect, authorize("admin"), getAllPickups);
router.put("/assign-driver/:pickupId/:driverId", protect, authorize("admin"), assignDriverManually);

module.exports = router;
