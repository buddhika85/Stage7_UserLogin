(function () {

    "use strict";
    var module = angular.module("stockManagement");         // get module
    module.controller("EditProfileCtrl", ["$http", "blockUI", "$scope", "loginValidatorService", editProfileCtrl]);    // attach controller to the module


    function editProfileCtrl($http, blockUI, $scope, loginValidatorService)                   // controller funcion
    {
        var vm = this;
        vm.scope = $scope;
        if (loginValidatorService.loginValidator()) {
            alert("editProfile");
            $("#loggedInUserWithTime").text(localStorage["userName"]);            
            vm = defineModel(vm, $http, blockUI);
            //prepareInitialUI(vm);
            //wireCommands(vm);            
        }
        else {
            localStorage["userName"] = null;
            window.location = window.location.protocol + "//" + window.location.host + "/#/login";
            window.location.reload();
        }        
    }

    // model object initiaition for the user interface
    function defineModel(vm, $http, blockUI)
    {
        vm.title = "Edit Profile : " + localStorage["userName"];
        //vm.httpService = $http;
        //vm.blockUI = blockUI;
        //vm = defineModelForNewRole(vm);

        return vm;
    }

}());