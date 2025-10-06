const express = require("express");
const {
  signup,
  login,
  updateLocation,
  updateAvailability,
} = require("../controllers/driver.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();
console.log("Driver rotues loaded");

router.post("/signup", signup);
router.post("/login", login);

// Protected Routes (only driver can access)
router.put("/location", protect, authorize("driver"), updateLocation);
router.put("/availability", protect, authorize("driver"), updateAvailability);

module.exports = router;
