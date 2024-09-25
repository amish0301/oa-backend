const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../db/user.model");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const initializePassport = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.create({
              name: profile.displayName,
              profileImage: profile.photos[0].value,
              email: profile.emails[0].value,
              googleId: profile.id,
              password: Date.now().toString(),
            });

            await user.save();
          }

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("in serialize user", user);
    done(null, user._id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      console.log("deserializing user", user);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = initializePassport;
