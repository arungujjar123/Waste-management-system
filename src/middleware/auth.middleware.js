const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  // console.log('gdfhdjmg,d')
  let token;
  const authorization = req.headers.authorization;
  if (authorization) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token)
    return res.status(401).json({ message: "not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "not authorized, token failed" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `user role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
