var User = require('../models/user');
var Fitbit = require('../models/dataStreams/fitbit');
var mongoose = require('mongoose');

module.exports = function (router, passport) {
  // make sure a user is logged in
  router.use(function(req, res, next) {
      // if user is authenticated in the session, call the next() to call the next request handler; Passport adds this method to request object.
      if (req.isAuthenticated())
          return next();
      // if the user is not authenticated then redirect him to the auth/login page
      res.redirect('/');
  });

  router.put('/starinsight', function (req, res) {
    var objectId = mongoose.Types.ObjectId(req.body.insightId);
    var conditions = { 'local.username': req.body.username, 'insights._id': objectId };
    var update = { $set: { 'insights.$.liked': req.body.isLiked } };
    var options = { multi: false };

    // db.foo.update({"array.value" : 22}, {"$set" : {"array.$.text" : "blah"}})
    User.update(conditions, update, options,
      function (err, numAffected) {
        if (err) {
          res.status(500).json({ message: 'internal server error - try refreshing the page' });
        }

        res.json({ message: 'insight star success' });
      }
    );
  });

  router.get('/session', function (req, res) {
    res.json(req.user);
  });

  router.post('/datastream/fitbit', function (req, res) {
    var fitbit = new Fitbit();
    fitbit.owner = req.body.username;
    fitbit.icon = 'circle thin';

    fitbit.save(function (err) {
      if (err, fitbit) {
        res.send(err);
      } else {
        var fitbitId = fitbit.id;
        console.log('fitbit data stream created');
      };
    });

    User.findOne({ 'local.username': req.body.username }, function (err, user) {
      if (err) {
        res.status(500).send('internal server error - try refreshing the page');
      } else if (user === null) {
        res.status(401).send('user not found');
      } else if (user) {
        user.dataStreams.push(res.fitbitId);

        user.save(function (err) {
          if (err) { res.send(err); }

          console.log('here');
          res.json({ message: 'user updated with new insight' });
        });
      }
    });
  });

  router.get('/fitbit', function (req, res) {
    var accessToken = req.query.code;

    // #/?= handles any extras things fitbit leaves on query string
    res.redirect('/#/?=' + accessToken);
  });

  router.get('/signout', function (req, res) {
    req.logout();
    res.json({ message: 'sign out success' });
  });

};