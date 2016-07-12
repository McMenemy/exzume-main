var localSignup = require('./local-signup');
var localSignin = require('./local-login');
var fitbit = require('./fitbit');
var User = require('../../models/user');

module.exports = function (passport) {

  // serialize so that passwords are not stored in database
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  localSignup(passport);
  localSignin(passport);
  fitbit(passport);
};
