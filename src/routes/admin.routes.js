const express =  require("express");

const {login, getDashboardStats}  = require("../controllers/admin.controller");
const {protect, authorize} = require("../middleware/auth.middleware");

const router = express.Router();


// Admin login

router.post("/login",login);

// Dashboard stats (protected route,only admin can access)

router.get("/dashboard",protect,authorize("admin"),getDashboardStats);
module.exports = router;
