const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../db/user.model");
require("dotenv").config();

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
        console.log('Google Strategy Callback');
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
            console.log('New user created:', user);
          }else {
            console.log('User found:', user);
          }
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user._id);
    done(null, user._id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user:', id);
    try {
      const user = await User.findById(id);
      if(!user) {
        console.log('User not found during deserialization');
        return done(new Error("User not found"), null);
      }
      console.log('User deserialized:', user);
      done(null, user);
    } catch (error) {
      console.error('Error during deserialization:', error);
      done(error, null);
    }
  });
};

module.exports = initializePassport;
