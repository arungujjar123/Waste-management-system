const express = require("express");
const cors  = require("cors");
const dotenv = require("dotenv");
const driverRoutes = require("./src/routes/driver.routes.js");
const connectDB = require("./src/config/db.js");
const userRoutes = require("./src/routes/user.routes.js")
const pickupRoutes = require("./src/routes/pickup.routes.js")

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", require("./src/routes/auth.routes.js"));
app.use("/api/drivers", driverRoutes);
app.use("/api/users",userRoutes);
app.use("/api/pickups",pickupRoutes);
// test route
app.get("/", (req, res) => {
    res.send("Waste pickup Backend API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
