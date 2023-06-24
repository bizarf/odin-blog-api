const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
    res.redirect("/api/v1/user");
});

module.exports = router;
