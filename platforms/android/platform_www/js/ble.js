/*global cordova, module*/

module.exports = {

  scanBlue: function (name, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "Ble", "scanBlue", [name]);
    }
};
