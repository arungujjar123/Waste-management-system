const express = require("express");

const {
  signup,
  login,
  getDashboardStats,
} = require("../controllers/admin.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

// Admin signup
router.post("/signup", signup);

// Admin login

router.post("/login", login);

// Dashboard stats (protected route,only admin can access)

router.get("/dashboard", protect, authorize("admin"), getDashboardStats);
module.exports = router;
