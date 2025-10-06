const Admin = require("../models/admin.model");
const Driver = require("../models/driver.model");
const Pickup = require("../models/pickup.model");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// generate JWT Token

const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: "admin",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Admin login

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "invalid credentials" });

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard stats

exports.getDashboardStats = async (req, res) => {
  try {
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ isAvailable: true });
    const totalPickups = await Pickup.countDocuments();
    const completedPickups = await Pickup.countDocuments({
      status: "completed",
    });
    const pendingPickups = await Pickup.countDocuments({ staus: "pending" });

    // Optional :area-wise pickup stats

    const areastats = await Pickup.aggregate({
      $group: {
        _id: "$address",
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
      },
    });

    res.json({
      totalDrivers,
      activeDrivers,
      totalPickups,
      completedPickups,
      pendingPickups,
      areastats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
