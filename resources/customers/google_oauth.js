const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const keys = require('../../keys');
const login_registration = require('./login_register_bo');
const logging = require('../../lib/logging');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: "http://localhost:3000/auth/google/callback",
  },
  async function(accessToken, refreshToken, profile, done) {
    console.log(JSON.stringify(profile));

    let user = {
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      // set with a random pw if from Google auth
      pw: String(Math.floor(Math.random() * 100000000))
    };

    let socialInfo = {
      provider: profile.provider,
      social_id: profile.id,
      token: accessToken
    };

    // I will explain the tenant stuff later.
    let context = {tenant: "E6156"};

    // logging.debug_message(moduleName+functionName + "tenant  = ", req.tenant);
    // logging.debug_message(moduleName+functionName + "body  = ", data);

    try {
      let result =  await login_registration.registerBySocial(user, context, socialInfo);
      logging.debug_message("social register result: ", result);
      done(null, user);
    } catch(err) {
      console.log("exception: ", err);
      done(err, null);
    }
  }
));
