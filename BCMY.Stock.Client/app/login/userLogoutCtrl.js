(function () {

    "use strict";

    var module = angular.module("stockManagement");

    module.controller("UserLogoutCtrl", ["$http", "blockUI", "$location", "$scope", "$timeout", "$window", userLogoutCtrl]);    // attach controller to the module


    function userLogoutCtrl($http, blockUI, $location, $scope, $timeout, $window)                   // controller funcion
    {
        
        var vm = this;
        vm = defineModel(vm, $http, $scope, blockUI);        
        Logout(vm);
        //DisableTopNavigationBar();
        

        
        //vm = prepareInitialUI(vm);
        //vm = wireCommands(vm, $http, $location, $rootScope, $timeout, $window);
    }

    // user logout
    function Logout(vm)
    {        
        var dataForBody = "userName=" + localStorage["userName"];
        var serverUrl = ('https://localhost:44302/api/Account/Logout?' + dataForBody);
        vm.httpService({
            method: "post",
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage["access_token"] },
            url: serverUrl
        }).success(function (data) {
            //debugger
            if (data.indexOf('Success') > -1) {
                DisableTopNavigationBar();
                $("#loggedInUserWithTime").text('');
                localStorage["access_token"] = '';
                localStorage["userName"] = '';
                localStorage["token_type"] = '';
                localStorage["access_token"] = '';
                localStorage["expires_in"] = '';                
                toastr.success(data);
                window.location = window.location.protocol + "//" + window.location.host + "/#/login";
                //window.location.reload();
            }
            else {                
                toastr.warning(data);
                window.location = window.location.protocol + "//" + window.location.host + "/#/login";
                //window.location.reload();
            }
        }
        ).error(function (data) {            
            toastr.error(data);
            window.location = window.location.protocol + "//" + window.location.host + "/#/login";
            //window.location.reload();
        });
    }


    // used to disable the top navigation bar - when logging out
    // Ref - http://stackoverflow.com/questions/6961678/disable-enable-all-elements-in-div
    function DisableTopNavigationBar() {
        $('#topNavigationBar').find('a').prop('disabled', true);
        $('#topNavigationBar a').click(function (e) {
            e.preventDefault();
        });
        $('#topNavigationBar').css("visibility", "hidden");
    }


    function defineModel(vm, $http, $scope, blockUI) {
        vm.httpService = $http;
        vm.scope = $scope;
        vm.blockUI = blockUI;
        return vm;
    }


}());