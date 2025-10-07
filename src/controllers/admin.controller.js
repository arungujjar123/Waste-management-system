const Admin = require("../models/admin.model");
const Driver = require("../models/driver.model");
const Pickup = require("../models/pickup.model");
const User = require("../models/user.model");
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

// Admin signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // check if admin is already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    const admin = await Admin.create({ name, email, password });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
    const pendingPickups = await Pickup.countDocuments({ status: "pending" });

    // Optional :area-wise pickup stats

    const areastats = await Pickup.aggregate([
      {
        $group: {
          _id: "$address",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        },
      },
    ]);

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

// get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select("-password");
    res.json(drivers);
  } catch (error) {
    console.log("get all drivers error:", error);
    res.status(500).json({ message: error.message } || "Server error");
  }
};
// get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.log("get all users error:", error);
    res.status(500).json({ message: error.message } || "Server error");
  }
};

/// Assiafn driver manually
exports.assiagnDriverManually = async (req, res) => {
  try {
    const { driverId, pickupId } = req.body;
    const driver = await Driver.findById(driverId);
    const pickup = await Pickup.findById(pickupId);

    if (!pickup || !driver) {
      return res.status(404).json({ message: "driver or pickup not found" });
    }
    // Assiagn only if driver is available and pickup is pending
    pickup.driver = driverId;
    pickup.status = "assigned";
    await pickup.save();

    driver.isAvailable = false;
    await driver.save();
    res.json({ message: "driver assigned successfully", pickup, driver });
  } catch (error) {
    console.log("assign driver manually error:", error);
    res.status(500).json({ message: error.message } || "Server error");
  }
};


// Delete a user
exports.deleteUser = async (req,res)=>{
  try {
        const {id} = req.params;
        await User.findByIdAndDelete(id);
        res.json({message:"user deleted successfully"})

  } catch (error) {
    console.log("delete user error:", error);
    res.status(500).json({ message: error.message } || "Server error");
  }
}

// delete a deriver
exports.deleteDriver  = async(req,res)=>{
  const {id} = req.params;
  try {
    await Driver.findByIdAndDelete(id);
    res.json({ message: "driver deleted successfully" });
  } catch (error) {
    console.log("delete driver error:", error);
    res.status(500).json({ message: error.message } || "Server error");
  }
}