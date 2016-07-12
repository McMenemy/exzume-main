var Dispatcher = require('../dispatcher/dispatcher');
var DataConstants = require('../constants/dataConstants');
var ApiUtil = require('../util/apiUtil');

module.exports = {
  receivedData: function (lineData) {
    Dispatcher.dispatch({
      actionType: DataConstants.DATA_RECEIVED,
      lineData: lineData,
    });
  },

  retrievedData: function () {
    ApiUtil.fetchData(this.receivedData);
  },

  addSurveyQuestion: function (params, success, err) {
    ApiUtil.addSurveyQuestion(params, success, err);
  },

};
