// encrypt and decrypt passwords
const bcrypt = require("bcrypt");
// passport and strategies to handle auth
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

// user model for passport stuff
const User = require("../models/user");

// passport localstrategy
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return done(null, false, { msg: "Incorrect username" });
            }
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    // password match. log user in
                    return done(null, user);
                } else {
                    return done(null, false, {
                        msg: "Incorrect password",
                    });
                }
            });
        } catch (err) {
            done(err);
        }
    })
);

// Json web token strategy. This will extract the token from the header
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        // we need async as we have to wait for a jwt payload to exist or else routes will give a 500 status error even with a correct token
        async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.user);
                // if can't find user, then don't login. else set user to req.user
                if (!user) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            } catch (err) {
                return done(err);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
