const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const keys = {
  googleClientID: "362228718688-l4t8ujt9hthq7tc0e83h90bt8og1l9bd.apps.googleusercontent.com",
  googleClientSecret: "Sz1zLI7TE7potvofRvmFnlNC"
};

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: "http://localhost:3000/auth/google/callback",
  },
  function(req, accessToken, refreshToken, profile, done) {
    console.log(profile);
  }
));
