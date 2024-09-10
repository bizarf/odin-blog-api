require("dotenv").config();
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/blog";

module.exports = { PORT, MONGODB_URI };
