const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const keys = require('../../keys');
const login_registration = require('./login_register_bo');
const logging = require('../../lib/logging');

const sdo = require('./social_information_do');

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
    console.log("social id ", profile.id);
    console.log("provider ", profile.provider);
    console.log("lastName ", profile.name.familyName);

    let user = {
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      // set with a random pw if from Google auth
      pw: String(Math.floor(Math.random() * 100000000))
    }

    // I will explain the tenant stuff later.
    let context = {tenant: "E6156"};

    // logging.debug_message(moduleName+functionName + "tenant  = ", req.tenant);
    // logging.debug_message(moduleName+functionName + "body  = ", data);

    try {
      console.log("test");
      let result =  await login_registration.register(user, context);
      console.log("social register result: ", result);
      if (result) {
        console.log("social register result: ", result);

        const socialInfoDo = new sdo.SocialDAO();
        let social_result = await socialInfoDo.create({
          id: result.id,
          provider: profile.provider,
          social_id: profile.id,
          token: accessToken
        }, context);
        
        if (social_result) {
          console.log("social info create result: ", result);
          done(null, user);
        } 
        else {
          console.log("error");
          done("err", null);
        }
        // done(null, user);
      } 
      else {
        console.log("error");
        done("Error in google oauth", null);
      }
    } catch(e) {
      console.log("exception: ", e);
      done(e, null);
    }
    
  }
));
