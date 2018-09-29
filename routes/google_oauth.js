let passport = require('passport');

let google_oauth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

let google_oauth_callback = passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
});

module.exports.google_oauth = google_oauth;
module.exports.google_oauth_callback = google_oauth_callback;
