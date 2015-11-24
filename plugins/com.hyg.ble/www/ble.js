/*global cordova, module*/

module.exports = {

   scanBlue: function (name, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "Ble", "scanBlue", [name]);
    },
    scanGps: function (lat,lng, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "Ble", "scanGps", [lat,lng]);
    },
    supportBle: function (successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "Ble", "supportBle", []);
    },
    getlevel: function (successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "Ble", "getlevel", []);
    },
    exit: function (successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "Ble", "exit", []);
    }
};
