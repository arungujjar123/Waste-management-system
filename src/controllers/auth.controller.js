const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// generate JWT token
const generateToken = (user)=>{
    return jwt.sign({
        id:user._id, role:user.role},
        process.env.JWT_SECRET,
        {expiresIn:"7d"
    })
};
// signup 
exports.signup = async (req,res)=>{
try {
    const {name,email,password,role,location} = req.body;
  // check if user is already registered 
  const existingUser  = await User.findOne({email});
  if(existingUser) return res.status(400).json({message:"User is already exist "})

    const user = await User.create({name,email,password,role,location})

    res.status(201).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        token:generateToken(user),
    })

} catch (error) {
     res.status(500).json({message:error.message})
}
}

// sign in
exports.login = async (req,res)=>{
    const {email,password} = req.body;

    try {
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"user not found "})

            const isMatch =  await bcrypt.compare(password, user.password);
           if(!isMatch)   return res.status(400).json({message:"invalid credentials"})

            res.json({
                _id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
                token:generateToken(user),
            })

    } catch (error) {
        res.status(500).json({message:error.message})
    }
}
