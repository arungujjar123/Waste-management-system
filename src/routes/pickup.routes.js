const express = require("express");
const {
  createPickup,
  getUserPickups,
  updateStatus,
} = require("../controllers/pickup.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

// user side
router.post("/create", protect, authorize("user"), createPickup);
router.get("/my-pickups", protect, authorize("user"), getUserPickups);
// Driver side
router.put("/update-status", protect, authorize("driver"), updateStatus);

module.exports = router;
