(function () {

    "use strict";

    var module = angular.module("stockManagement");

    module.controller("FogotPasswordCtrl", ["$http", "blockUI", "$location", "$rootScope", "$timeout", "$window", fogotPasswordCtrl]);    // attach controller to the module


    function fogotPasswordCtrl($http, blockUI, $location, $rootScope, $timeout, $window)                   // controller funcion
    {
        //$('#topNavigationBar').hide();

        var vm = this;
        blockUI.start();
        DisableTopNavigationBar();
        //vm.showTopNavigationBar = true;
        
        vm = defineModel(vm, $http, blockUI);
        vm = prepareInitialUI(vm);
        vm = wireCommands(vm, $http, $location, $rootScope, $timeout, $window);
        blockUI.stop();
    }


    function defineModel(vm, $http, blockUI)
    {        
        vm.httpService = $http;
        vm.error = '';
        return vm;
    }

    function prepareInitialUI(vm)
    {        
        DisableTopNavigationBar();                          // disable the top navigation bar - before login
        vm.title = "BCMY Stock Management - Fogot Password";
       
        return vm;
    }

    function wireCommands(vm, $http, $location, $rootScope, $timeout, $window)
    {        
        vm.resetPassword = function ()
        {
            resetPassword(vm);
        }
        return vm;
    }

    function resetPassword(vm)
    {
        debugger        
        var isValid = validateUsername(vm);
        if (isValid)
        {
            isValid = validateRecapcha(vm);
        }        
        if (isValid)
        { 
            var dataForBody = "username=" + vm.username;
            var serverUrl = ('https://localhost:44302/api/ResetPasswordAsync?' + dataForBody);
            vm.httpService({
                method: "post",
                headers: { 'Content-Type': 'application/json'},
                url: serverUrl
            }).success(function (data) {
                if (data.indexOf('Success') > -1) {
                    vm.username = '';
                    vm.error = data;
                    toastr.success(data);
                }
                else {
                    vm.error = data;
                    toastr.warning(data);
                }
            }
            ).error(function (data) {
                vm.error = data;     // display error message
                toastr.error(data);
            });
        }        
    }

    // used to disable the top navigation bar - before login
    // Ref - http://stackoverflow.com/questions/6961678/disable-enable-all-elements-in-div
    function DisableTopNavigationBar() {
        $('#topNavigationBar').find('a').prop('disabled', true);
        $('#topNavigationBar a').click(function (e) {
            e.preventDefault();
        });
        $('#topNavigationBar').css("visibility", "hidden");
    }

    // verifies the format of the username and password
    function validateUsername(vm) {
        var isValid = false;
        // username - validate for an email
        if (validateEmail(vm.username)) {
            isValid = true;           
        }
        else {
            // invalid username or password - client side validation fails
            vm.error = 'Error - The username is incorrect.';
        }
        return isValid;
    }

    // verifies the recapcha inputs of the user
    function validateRecapcha(vm)
    {
        var isValid = false;
        var v = grecaptcha.getResponse();
        if (v.length == 0) {
            vm.error = "You can't leave Captcha Code empty";
            isValid = false;
        }
        if (v.length != 0) {
            
            isValid = true;
        }
        return isValid;
    }

}());