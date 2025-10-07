const Pickup = require("../models/pickup.model");
const Driver = require("../models/driver.model");
const User = require("../models/user.model");

const sendEmail = require("../config/sendEmail");

// createa a picup request by a user

exports.createPickup = async (req, res) => {
  try {
    const { location, address } = req.body;
    // find nearest available driver
    const nearestDriver = await Driver.findOne({
      isAvailable: true,
      // MongoDB ke $near geospatial query se
      // hum nearest available driver find karte hain (within 5 km)
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: location.coordinates },
          $maxDistance: 5000, // within 5km
        },
      },
    });
    ///
    if (!nearestDriver) {
      return res.status(404).json({ message: "No available driver nearby" });
    }

    // create picup record
    // Agar driver mil gaya toh ek pickup
    // record ban jata hai jisme user + driver dono linked hote hain

    const existingPickup = await Pickup.findOne({
      user: req.user.id,
      driver: nearestDriver._id,
      vehicleNumber: nearestDriver.vehicleNumber,
      location,
      address,
    });

    // mark driver unavailable
    // Taki wo driver ek aur request
    // accept na kare jab tak current request complete na ho
    nearestDriver.isAvailable = false;
    await nearestDriver.save();

    // send email to user
    const user = await User.findById(req.user.id);
    await sendEmail({
      to: user.email,
      subject: "pickup assiagned",
      textL: `Hello ${user.name},your waste pickup has been scheduled with driver ${nearestDriver.name},vehicle number:${nearestDriver.vehicleNumber}.`,
    });

    res.status(201).json({
      message: "pickup request created successfully",
      pickup: existingPickup,
      assignedDriver: nearestDriver.name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get user pickup request
// 🟡 2. Get User Pickup Requests
// Pickup.find({ user: req.user.id }) se current user ke sabhi pickup records fetch karte hain
// 2️⃣	Driver details show karte hain	.populate("driver", "name vehicleNumber") se pickup ke
// saath driver ka naam aur vehicleNumber attach ho jata hai
// 3️⃣	Sorted by latest first	.sort({ createdAt: -1 }) latest pickup sabse upar
// 4️⃣	Response send	Pickup history frontend ya Postman me show ho jati hai
exports.getUserPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ user: req.user.id })
      .populate("driver", "name vehicleNumber")
      .sort({ createdAt: -1 });
    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// update a pickup  stauts (driver update )

exports.updateStatus = async (req, res) => {
  try {
    const { pickupId, status } = req.body;

    const pickup = await Pickup.findById(pickupId);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });

    // Only assigned driver can update
    if (pickup.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    pickup.status = status;
    await pickup.save();

    // If completed, make driver available again
    if (status === "completed") {
      const driver = await Driver.findById(pickup.driver);
      driver.isAvailable = true;
      await driver.save();
    }

    //// send email about completion to user
    const user = await User.findById(pickup.user);
    await sendEmail({
      to: user.email,
      subject: "pickup completed",
      textL: `Hello ${user.name}, your waste pickup at ${pickup.address} has been completed by the driver ${pickup.driver.name}.`,
    });

    res.json({ message: "Status updated", pickup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// flow of the code:
// User → createPickup()
//         ↓
// Find nearest available driver
//         ↓
// Create pickup request
//         ↓
// Driver → updateStatus("accepted" / "completed")
//         ↓
// Driver availability auto-update
