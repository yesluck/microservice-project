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
    // console.log(profile);
    console.log("email ", profile.emails[0].value);
    console.log("firstName ", profile.name.givenName);
    console.log("lastName ", profile.name.familyName);

    let user = {
      "email": profile.emails[0].value,
      "firstName": profile.name.givenName,
      "lastName": profile.name.familyName,
      // set with a random pw if from Google auth
      "pw": String(Math.floor(Math.random() * 100000000))
    }

    let data = user;

    // I will explain the tenant stuff later.
    let context = {tenant: "E6156"};

    // logging.debug_message(moduleName+functionName + "tenant  = ", req.tenant);
    // logging.debug_message(moduleName+functionName + "body  = ", data);

    try {
      let result =  await login_registration.register(data, context);
      if (result) {
        console.log("res: ", result);
      } else {
        console.log("error");
      }
    } catch(e) {
      console.log("exception: ", e);
    }
    

    // .then(
    //     function(result) {
    //         if (result) {
    //             console.log("res: ", result);
    //             map_response(result, res);
    //         }
    //         else {
    //             reject(return_codes.codes.internal_error);
    //         }
    //     },
    //     function(error) {
    //         logging.error_message(moduleName+functionName + " error = ", error);
    //         map_response(error, res);
    //     }
    // );

    done(null, user);
  }
));
