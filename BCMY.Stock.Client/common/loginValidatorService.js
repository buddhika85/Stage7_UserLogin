(function () {
    "use strict";
    var module = angular.module("stockManagement");         // get module

    module.factory('loginValidatorService', function () {
        return {
            loginValidator: function () {
                debugger
                if (localStorage["userName"] != null && localStorage["userName"] != '') {
                    alert("login validator service called " + localStorage["userName"]);
                    return true;
                }
                else {
                    alert("Login validator service - You are not logged in");
                    return false;
                }                
            }
        };
    });

}());