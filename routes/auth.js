var User = require('../models/user');
var Feature = require('../models/feature');
var config = require('../config/config');
var mongoose = require('mongoose');
var axios = require('axios');
var async = require('async');
var apiURLs = require('./resources/apiURLs');
var dataStreamAPIs = require('../controllers/dataStreamAPIs/dataStreamAPIs');
var Util = require('../controllers/dataStreamAPIs/util');

module.exports = function (router, passport) {
  // makes sure a user is logged in
  router.use(function (req, res, next) {
      // if user is authenticated in the session, call the next() to call the
      // next request handler; Passport adds this method to request object.
      if (req.isAuthenticated()) {
        return next();
      } else {
        res.redirect('/');
      }
    }
  );

  router.get('/session', function (req, res) {
    res.json(req.user);
  });

  // router.get('/insights', function (req, res) {
  //   Insight.find({ ownerId: req.user._id }, function (err, insights) {
  //     if (err) res.send(err);
  //     res.json(insights);
  //   });
  // });
  //
  // router.route('/insights/:insightId')
  //   .get(function (req, res) {
  //     Insight.findOne({ _id: req.params.insightId }, function (err, insight) {
  //       if (err) res.send(err);
  //       if (insight) res.json(insight);
  //     });
  //   })
  //   .put(function (req, res) {
  //     Insight.findOne({ _id: req.params.insightId }, function (err, insight) {
  //       if (insight) {
  //         insight.message = req.body.message;
  //         insight.liked = req.body.liked;
  //         insight.save(function (err, insight) {
  //           if (err) res.send(err);
  //           if (insight) res.json(insight);
  //         });
  //       }
  //     });
  //   })
  //   .post(function (req, res) {
  //     var newInsight = new Insight();
  //     newInsight.message = req.body.message;
  //     newInsight.ownerId = mongoose.Types.ObjectId(req.body.ownerId);
  //     newInsight.save(function (err, newInsight) {
  //       if (err) res.send(err);
  //       res.json(newInsight);
  //     });
  //   })
  //   .delete(function (req, res) {
  //     Insight.remove({ _id: req.params.insightId }, function (err, insight) {
  //       if (err) res.send(err);
  //       if (insight) res.json(insight);
  //     });
  //   });

  router.route('/zumes/:zumeId')
    .post(function (req, res) {
      req.user.zumes.push(req.body);
      req.user.save(function (err, user) {
        if (err) {
          res.send(err);
        } else if (user) {
          res.json(user);
        }
      });
    });

  // only used for survey dataStream
  router.route('/userfeatures/:datastream/:feature')
    .post(function (req, res) {
      Feature.findOne({ name: req.params.feature }, function (err, feature) {
        if (err) {
          res.send(err);
        } else if (feature) {
          var userFeature = {
            name: feature.name,
            prompt: feature.options.prompt,
            format: feature.options.format,
          };
          req.user.datastreams.survey.features.push(userFeature);
          req.user.save(function (err, user) {
            if (err) {
              res.send(err);
            } else if (user) {
              feature.users.push(req.user._id);
              feature.save();
              res.json(user);
            }
          });
        }
      });
    })
    .put(function (req, res) {
      var userFeatures = req.user.datastreams[req.params.datastream].features;
      var userFeature;
      for (var i = 0; i < userFeatures.length; i++) {
        if (userFeatures[i].name == req.params.feature) {
          userFeature = userFeatures[i];
        }
      }

      userFeature.data.push({
        dateTime: moment().format('YYYY-MM-DD'),
        value: parseInt(req.body.data),
      });
      req.user.save(function (err, user) {
        if (err) {
          res.send(err);
        } else {
          res.json(user);
        }
      });
    });

  router.route('/features/:featureId')
    .put(function (req, res) {
      Feature.findOne({ _id: req.params.featureId }, function (err, feature) {
        if (feature) {
          feature.users.push(req.user._id);
          feature.save(function (err, feature) {
            if (err) res.send(err);
            if (feature) res.json(feature);
          });
        }
      });
    });

  router.get('/datastreams/:datastream', function (req, res) {
      dataStreamAPIs[req.params.datastream].connect(passport)(req, res);
    }
  );

  router.get('/datastreams/:datastream/callback', function (req, res) {
      passport.authenticate(req.params.datastream, {
        successRedirect: '/#/dashboard?=', // redirect to grab from API and redirect
        failureRedirect: '/',
      })(req, res);
    }
  );

  router.get('/datastreams/:datastream/grab', function (req, res) {
      var user = req.user;
      var currentStreamName = req.params.datastream;
      var currentStream = user.datastreams[currentStreamName];

      // get fitbit data
      if (currentStreamName == 'fitbit') {
        dataStreamAPIs.fitbit.sync(res, user);
      }

      // get lastfm data
      if (currentStreamName == 'lastfm') {
        dataStreamAPIs.lastfm.sync(res, user);
      }
    }
  );

  router.get('/signout', function (req, res) {
    req.logout();
    res.json({ message: 'sign out success' });
  });

  router.get('/*', function (req, res) {
    res.redirect('/');
  });
};
