/*global cordova, module*/

module.exports = {
  init: function ( successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "Face", "init", []);
  },
  register: function (userId, password,successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "Face", "register", [userId]);
  },
  verify: function (userId, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "Face", "verify", [userId]);
  },
  search: function (userId, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "Face", "search", [userId]);
  }
};
