const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: { type: String, required: true, unique: true }, // Unique email
    password: { type: String, required: true }, // Login ke liye password
    vehicleNumber: { type: String, required: true }, // Driver ka gaadi number
    isAvailable: { type: Boolean, default: true }, // Driver free hai ya busy
    location: {
      // Driver ka current GPS location
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required:true}, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

// Add geospatial index for location field to support $near queries
driverSchema.index({ location: "2dsphere" });

// save se phele password hash hoga
driverSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
module.exports = mongoose.model("Driver", driverSchema);
