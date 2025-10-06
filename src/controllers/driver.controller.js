const Driver = require("../models/driver.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// generate JWT Token
const generateToken = (driver) => {
  return jwt.sign(
    {
      id: driver._id,
      role: "driver",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
// driver signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, vehicleNumber, location } = req.body;
    // check if driver is already registered
    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ message: "Driver already exists" });
    }
    const driver = await Driver.create({
        name,email,password,vehicleNumber,location
    });
    res.status(201).json({_id:driver._id,
        name:driver.name,
        email:driver.email,
        vehicleNumber:driver.vehicleNumber,
        isAvailable:driver.isAvailable,
        token:generateToken(driver),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req,res)=>{
    const {email,password}  = req.body;
    try {
           const driver = await Driver.findOne({email});
              if(!driver) return res.status(400).json({message:"driver not found"})
                const isMatch = await bcrypt.compare(password,driver.password);
                if(!isMatch) return res.status(400).json({message:"invalid credentials"})
                res.json({
                    _id:driver._id,
                    name:driver.name,
                    email:driver.email,
                    vehicleNumber:driver.vehicleNumber,
                    isAvailable:driver.isAvailable,
                    token:generateToken(driver),
                })
    } catch (error) {
         res.status(500).json({message:error.message})
    }
};
// update driver location
exports.updateLocation = async (req,res)=>{
    const {coordinates} = req.body; // [longitude, latitude]
    try {
         const driver = await Driver.findByIdAndUpdate(req.user.id,{
            location:{type:"point",coordinates} },
            {new:true}
            );
            res.json({
                message:"location updated",
                location:driver.location,
            })
           
    } catch (error) {
         res.status(500).json({message:error.message})
    }

};
// update driver availability
exports.updateAvailability = async (req,res)=>{
    const {isAvailable} = req.body;
     try {
        const driver = await Driver.findByIdAndUpdate(req.user.id,
            {isAvailable},
            {new:true}
            );
            res.json({
                message:"availability updated",
                isAvailable:driver.isAvailable,
            })
     } catch (error) {
         res.status(500).json({message:error.message})
     }
}