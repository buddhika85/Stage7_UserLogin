(function () {

    "use strict";

    var module = angular.module("stockManagement");

    module.controller("UserLoginCtrl", ["$http", "blockUI", userLoginCtrl]);    // attach controller to the module


    function userLoginCtrl($http, blockUI)                   // controller funcion
    {
        //$('#topNavigationBar').hide();

        var vm = this;
        vm.showTopNavigationBar = false;
        
        vm = defineModel(vm, $http, blockUI);
        vm = prepareInitialUI(vm);
        vm = wireCommands(vm, $http);
    }


    function defineModel(vm, $http, blockUI)
    {
        vm.username = '';
        vm.password = '';
        return vm;
    }

    function prepareInitialUI(vm)
    {        
        DisableTopNavigationBar();    // disable the top navigation bar - before login
        vm.title = "BCMY Stock Management";

        return vm;
    }

    function wireCommands(vm, $http)
    {
        vm.login = function () {
            loginUser(vm, $http);
        };

        return vm;
    }

    // manage user login
    function loginUser(vm, $http)
    {
        //alert("Login user : " + vm.username + " | " + vm.password);
        
        var tokenUrl = "https://localhost:44302" + "/Token";
        var messageHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        var dataForBody = "grant_type=password&" +
                "username=" + 'buddhika@bcmy.co.uk' + "&" +
                "Password=" + 'Test123$';

        $http({
            method: 'POST',
            url: tokenUrl,
            headers: messageHeaders,
            data: dataForBody
        }).success(function (data) {
            // set the access token
            debugger
            localStorage["access_token"] = data.access_token;
            localStorage["userName"] = data.userName;
            localStorage["token_type"] = data.token_type;
            //localStorage[".expires"] = data.expires;
            //localStorage[".issued"] = data.issued;
            localStorage["access_token"] = data.access_token;
            localStorage["expires_in"] = data.expires_in;

            alert(data.access_token);
            

        }).error(function (data) {
            alert(data.error);
        });
        
        // if login success - show top navigation bar        
        vm.showTopNavigationBar = true;
        
    }

    
    // used to disable the top navigation bar - before login
    // Ref - http://stackoverflow.com/questions/6961678/disable-enable-all-elements-in-div
    function DisableTopNavigationBar() {        
        //$('#topNavigationBar').find('a').prop('disabled', true);
        //$('#topNavigationBar a').click(function (e) {
        //    e.preventDefault();
        //});
        //$('#topNavigationBar').css("visibility", "hidden");
    }

    // used to enable the top navigation bar - after logged in
    //function EnableTopNavigationBar() {
    //    $('#topNavigationBar').find('a').prop('disabled', false);
    //    $('#topNavigationBar a').unbind("click");
    //    $('#topNavigationBar').css("visibility", "visible");
    //}

}());