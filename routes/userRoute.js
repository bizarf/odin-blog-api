const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// API welcome message
router.get("/", (req, res, next) => {
    res.json({ message: "Welcome to the blog API" });
});

// user stuff
//
// user sign up post method
router.post("/sign-up", userController.user_signup_post);

// user login
router.post("/login", userController.user_login_post);

// user logout
router.get("/logout", userController.user_logout_get);

module.exports = router;
