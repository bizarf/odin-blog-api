const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
    res.redirect("/api");
});

// API welcome message
router.get("/api", (req, res) => {
    res.json({ message: "Welcome to the blog API" });
});

module.exports = router;
