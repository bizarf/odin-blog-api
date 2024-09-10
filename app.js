const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

const indexRouter = require("./routes/index");
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");
const commentRoute = require("./routes/commentRoute");

const app = express();

// setup dotenv and mongoose connection
require("dotenv").config();
// passport js config
require("./utils/passportConfig");

const { connectToDatabase } = require("./middleware/mongoConfig");

connectToDatabase().then(() => {
    console.log("Connected to the database");
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(helmet());
app.use(cors());

// express rate limiter
const { rateLimit } = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
app.use(limiter);

app.use("/", indexRouter);
app.use("/api", userRoute);
app.use("/api", postRoute);
app.use("/api", commentRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send("404 Error");
});

module.exports = app;
