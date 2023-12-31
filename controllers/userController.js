const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// user sign up post method
exports.user_signup_post = [
    body("firstname", "You must enter a first name").trim().escape().notEmpty(),
    body("lastname", "You must enter a last name").trim().escape().notEmpty(),
    body("username")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("You must enter a username")
        .custom(async (value, { req, res }) => {
            const userExists = await User.findOne({
                username: value,
            }).exec();

            if (userExists) {
                throw new Error("User already exists");
            }
        }),
    body("password")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("You must enter a password")
        .isLength({ min: 8 })
        .withMessage("Your password must be at least 8 characters long"),
    body("confirmPassword")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("You must confirm the password")
        .isLength({ min: 8 })
        .withMessage("Your password must be at least 8 characters long")
        // custom validator to compare password and confirm password fields
        .custom(async (value, { req, res }) => {
            // wait for the password field or else there is no value to compare
            await req.body.password;
            if (req.body.password != value) {
                throw new Error("The passwords don't match");
            }
        }),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        // hash the password using bcrypt
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            if (err) {
                throw new Error(err);
            } else {
                // hashedPassword instead of req.body.password as we want to save the hashed password to the database
                const user = new User({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    username: req.body.username,
                    password: hashedPassword,
                });

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        success: false,
                        errors: errors.array({ onlyFirstError: true }),
                    });
                } else {
                    await user.save();
                    return res.status(201).json({
                        success: true,
                        message: "Sign up was successful!",
                    });
                }
            }
        });
    }),
];

// user login POST method
exports.user_login_post = [
    body("username")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("You must enter a username")
        .custom(async (value, { req, res }) => {
            const userExists = await User.findOne({
                username: value,
            }).exec();

            if (!userExists) {
                throw new Error("User does not exist");
            }
        }),
    body("password", "The password must not be empty")
        .trim()
        .escape()
        .notEmpty(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(401).json({
                success: false,
                errors: errors.array({ onlyFirstError: true }),
            });
        }
        // req, res, next at the end or else passport authenticate will hang
        // passport local authentication. set session to false as I will use a jsonwebtoken instead
        passport.authenticate(
            "local",
            { session: false },
            (err, user, info) => {
                if (err || !user) {
                    // set status to 401 (unauthorized) and send the error message as a json object
                    res.status(401).json(info);
                } else {
                    req.login(user, { session: false }, (err) => {
                        if (err) {
                            res.send(err);
                        }

                        const token = jwt.sign(
                            { user: user._id },
                            process.env.JWT_SECRET,
                            { expiresIn: "1d" }
                        );
                        res.json({ success: true, token: token });
                    });
                }
            }
        )(req, res, next);
    }),
];

// logout function
exports.user_logout_get = asyncHandler(async (req, res, next) => {
    // req.logout(function (err) {
    //     if (err) {
    //         return next(err);
    //     }
    //     res.redirect("/");
    // });
    console.log("logged out");
    // don't need this function anymore, since the JWT is stored in the cookies so the logout function will be done in the client instead
});

exports.user_details_get = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userId)
        .select("-password")
        .exec();

    if (user === null) {
        return res
            .status(404)
            .json({ success: false, message: "User not found" });
    } else {
        return res.json({ success: true, user });
    }
});
