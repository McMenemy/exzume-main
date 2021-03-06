var config = require('../../config/config');
var util = require('./util');
var axios = require('axios');
var async = require('async');
var moment = require('moment');

// checks to see if user needs added to feature and if user feature array is initialized
var preSync = function (user, featureName, streamName, startSync) {
  // if user stream doesn't contain feature array doesn't exist it will init it
  var prepUserFeatureArr = function (user, featureName, streamName, startSync) {
    var currentStream = user.datastreams[streamName];

    // check if user already has initialized userFeature
    var featureExists = false;
    for (var i = 0; i < currentStream.features.length; i++) {
      if (currentStream.features[i].name == featureName) {
        featureExists = true;
      }
    }

    if (featureExists) {
      startSync(null);
    } else {
      currentStream.features.push({ name: featureName });
      user.save(function (err, user) {
        if (err) {
          startSync(err);
        } else if (user) {
          startSync(null);
        }
      });
    }
  };

  prepUserFeatureArr(user, featureName, streamName, startSync);
};

var lastfmAPI = {
  connect: function (passport) {
    return passport.authenticate('lastfm');
  },

  sync: function (user, endSync) {

    var processTracksData = function (newData, idx) {
      // function to create new day data object
      var newDayData = function (date, val) {
        return { dateTime: date, value: val };
      };

      // case 1: use lastSongTime/lastSongSynced from DB (TODO)
      // if (user.datastreams.lastfm.lastSongSyncedTime) {
      //   // unix timestamp of the last dateTime in seconds
      //   lastSongTime = user.datastreams.lastfm.lastSongSyncedTime;
      //
      //   // find beginning of day (locally) for that last song, start putting in buckets from there
      //   timeLastDay = Math.floor(lastSongTime / daySeconds) * daySeconds + user.timezoneOffset / 1000;
      // // case 2: track from beginning of 600 recent tracks
      // } else {
      // }

      if (idx == 0) {
        // track from beginning of that page
        lastSongTime = parseInt(newData[newData.length - 1].date.uts);
        console.log('start here: ' + lastSongTime);
        timeLastDay = Math.floor(lastSongTime / daySeconds) * daySeconds + user.timezoneOffset / 1000;
        console.log('start here: ' + moment(timeLastDay * 1000).format('YYYY-MM-DD'));
        currentDay = newDayData(moment(timeLastDay * 1000).format('YYYY-MM-DD'), 0);
      } else {
        // make copy of last day object
        currentDay = processedData[processedData.length - 1];
        processedData.pop();
      }

      // store tracks played by day as counts in newData object
      for (var i = newData.length - 1; i >= 0; i--) {
        // do not include now playing track
        if (newData[i].date != null) {
          var timeThisTrack = parseInt(newData[i].date.uts);
          console.log(timeThisTrack);

          if (timeThisTrack > lastSongTime) {
            if (moment(timeThisTrack * 1000).isSame(moment(timeLastDay * 1000), 'day')) {
              currentDay.value++;
              console.log(currentDay.value);
            } else {
              console.log(currentDay.dateTime);
              console.log(currentDay.value);
              processedData.push(currentDay);

              // set new timeLastDay to beginning of next day
              timeLastDay += daySeconds;
              currentDay = newDayData(moment(timeLastDay * 1000).format('YYYY-MM-DD'), 1);
            }
          }
        }
      }

      // set lastSongSyncedTime in DB
      // if (!user.datastreams.lastfm.lastSongSyncedTime ||
      //     user.datastreams.lastfm.lastSongSyncedTime < timeThisTrack) {
      //   user.datastreams.lastfm.lastSongSyncedTime = timeThisTrack;
      //   user.save(function (err) {
      //     if (err) {
      //       console.log('error in saving user: ' + err);
      //       throw err;
      //     } else {
      //       console.log('user saved with new lastSongSyncedTime of ' + timeThisTrack);
      //     }
      //   });
      // }

      console.log(currentDay.dateTime);
      console.log(currentDay.value);
      processedData.push(currentDay);
    };

    var processedData = []; // initialize array to hold all 600 tracks data
    const daySeconds = 86400; // seconds in day
    var lastSongTime; // furthest back time in unix time from data OR based on lastSongSyncedTime in DB
    var timeLastDay;
    var currentDay;

    var resources = [3, 2, 1];
    var series = resources.map(function (resource, idx) {
      return (
        function (nextSync) {
          preSync(user, 'Tracks Played', 'lastfm', function (err) {
            if (err) {
              nextSync(err, null);
            } else {
              // make axios call before calling processTracksData
              axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                  method: 'user.getrecenttracks',
                  limit: 200,
                  user: user.datastreams.lastfm.username,
                  api_key: config.lastfm.clientID,
                  format: 'json',
                  page: resource,
                },
              }).then(function (streamRes) {
                // console.log('made it to response');
                // console.log(streamRes);
                // console.log(streamRes.data.recenttracks.track);
                processTracksData(streamRes.data.recenttracks.track, idx);

                // only add data to user after the entire series
                if (idx == resources.length - 1) {
                  for (k in processedData) {
                    console.log(processedData[k]);
                  }

                  // pop off first element of array to increase data accuracy
                  processedData.shift();
                  util.addDataToUser(user, 'Tracks Played', 'lastfm', processedData, nextSync);
                } else {
                  nextSync(null, user);
                }
              }).catch(function (err) {
                if (err.status == 401) {
                  console.log('access token expired, redirecting to OAuth...');
                  nextSync('redirect', null);
                } else {
                  nextSync(err.data.errors, null);
                }
              });
            }
          });
        }
      );
    });

    async.series(series, function (err, results) {
      if (err === 'redirect') {
        console.log('redirect');
        endSync(null, null, true);
      } else if (err) {
        console.log('2 axios error');
        endSync(err, null, null);
      } else {
        // second argument is last results.lastSeriesCallName is the user object
        console.log(results);
        endSync(null, results[results.length - 1], null);
      }
    });
  },

};

module.exports = lastfmAPI;
