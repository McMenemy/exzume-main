Feature = require('../../models/feature');

// exported util functions
util = {
  // function to add current data as object to user.datastreams.features array
  addDataToUser: function (user, featureName, streamName, newData, nextSync) {
    var currentStream = user.datastreams[streamName];

    // console.log(currentStream);
    // console.log(featureName);
    // for (k in newData) {
    //   console.log(newData[k]);
    // }

    // find proper feature index within users datastream object
    var thisFeatureIndex;
    for (var i = 0; i < currentStream.features.length; i++) {
      if (currentStream.features[i].name == featureName) {
        thisFeatureIndex = i;
      }
    };

    // re-update overlap data
    var thisFeature = currentStream.features[thisFeatureIndex];
    var j = 0;
    for (var i = 0; i < thisFeature.data.length && j < newData.length; i++) {
      console.log('oldDate');
      console.log(thisFeature.data[i].dateTime);
      console.log('newDate');
      console.log(newData[j].dateTime);
      if (thisFeature.data[i].dateTime === newData[j].dateTime) {
        console.log('overwriting data');
        console.log('old data');
        console.log(thisFeature.data[i]);
        console.log('new data');
        console.log(newData[j]);
        thisFeature.data[i] = newData[j];
        j++;
      }
    }

    // push remaining data
    for (; j < newData.length; j++) {
      thisFeature.data.push(newData[j]);
    };

    // update lastSyncTime
    currentStream.lastSyncTime = Date.now();

    user.save(function (err, user) {
      if (err) {
        nextSync(err, null);
      } else if (user) {
        nextSync(null, user);
      }
    });
  },

  // same as function above but takes in array for when you want to get multiple
  // features from same route
  addMuchDataToUser: function (user, featureNameArray, streamName, newDataArray, nextSync) {
    var currentStream = user.datastreams[streamName];
    console.log('add much data to user');

    for (idx in featureNameArray) {
      var featureName = featureNameArray[idx];
      var newData = newDataArray[idx];
      console.log(featureName);

      // find proper feature index within users datastream object
      var thisFeatureIndex;
      for (var i = 0; i < currentStream.features.length; i++) {
        if (currentStream.features[i].name == featureName) {
          thisFeatureIndex = i;
        }
      };

      // re-update overlap data
      var thisFeature = currentStream.features[thisFeatureIndex];
      console.log(thisFeature);
      var j = 0;
      for (var i = 0; i < thisFeature.data.length && j < newData.length; i++) {
        if (thisFeature.data[i].dateTime === newData[j].dateTime) {
          thisFeature.data[i] = newData[j];
          j++;
        }
      }

      // push remaining data
      for (; j < newData.length; j++) {
        thisFeature.data.push(newData[j]);
      };
    }

    // update lastSyncTime
    currentStream.lastSyncTime = Date.now();

    console.log('made it to add much data user save');

    user.save(function (err, user) {
      if (err) {
        nextSync(err, null);
      } else if (user) {
        nextSync(null, user);
      }
    });
  },
};

module.exports = util;

