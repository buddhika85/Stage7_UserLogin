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
        vm = readRememberMeCookie(vm);                      // assign remember me values to username and password
        vm.error = '';
        return vm;
    }

    function prepareInitialUI(vm)
    {        
        DisableTopNavigationBar();    // disable the top navigation bar - before login
        vm.title = "BCMY Stock Management";
        vm.rememberMe = false;

        // for testing
        vm.username = 'buddhika@bcmy.co.uk';
        vm.password = 'Test123$';
        return vm;
    }

    function wireCommands(vm, $http)
    {
        vm.login = function () {
            loginUser(vm, $http);
        };

        vm.fogotPassword = function ()
        {
            fogotPassword(vm, $http);
        }

        return vm;
    }

    // manage user login
    function loginUser(vm, $http)
    {
        alert("Login user : " + vm.username + " | " + vm.password);

        vm.error = '';
        var isValid = validateInputs(vm);           
        if (isValid) {
            var tokenUrl = "https://localhost:44302" + "/Token";
            var messageHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            // valid 
            //var dataForBody = "grant_type=password&" +
            //        "username=" + 'buddhika@bcmy.co.uk' + "&" +
            //        "Password=" + 'Test123$';
            // inavlid
            //var dataForBody = "grant_type=password&" +
            //        "username=" + 'buddhika@bcmy.co.uk' + "&" +
            //        "Password=" + 'test123$';

            // Commented for testing
            var dataForBody = "grant_type=password&" +
                    "username=" + vm.username + "&" +
                    "Password=" + vm.password;
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

                // if login success - show top navigation bar        
                vm.showTopNavigationBar = true;

                // write credential cookie
                if (vm.rememberMe)
                {
                    writeRememberMeCookie(vm);
                }
                alert(data.access_token);

                // navigate to dashboard view
                window.location = window.location.protocol + "//" + window.location.host + "/#/dashboard";
                
                

                //// test with user roles
                //$http({
                //    method: "get",
                //    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage["access_token"] },
                //    url: ('https://localhost:44302/api/roleTest')
                //})
                //.success(function (data) {
                //    debugger;
                //    alert(data);
                //}).error(function (data) {
                //    debugger;
                //    alert('Error - ' + data.message);    // Authorization has been denied for this request.
                //});

            }).error(function (data) {                
                // data.error="invalid_grant"            
                vm.error = 'Error - ' + data.error_description;  // Error - The username or password is incorrect.
            });            
        }
        else {
            // invalid username or password - client side validation fails
            vm.error = 'Error - The username or password is incorrect.';
        }
        return vm;
    }

    // verifies the format of the username and password
    function validateInputs(vm)
    {
        var isValid = false;

        // username - validate for an email
        if (validateEmail(vm.username))
        {
            // valid username
            if (vm.password.length >= 6)
            {
                // password - min length = 6, non letter or digit, must have a digit, must have both upper and lower case chars
                // TO DO - write rest of the validations
                isValid = true;
            }
        }
        return isValid;
    }


    // manage fogot password 
    function fogotPassword(vm, $http) {
        alert("fogot password - under construction");
    }

    // manage writing cookie to remember username and password
    function writeRememberMeCookie(vm)
    {
        alert("Remember me option - cookie writing - under construction");
        // https://docs.angularjs.org/api/ngCookies/service/$cookies
        // http://stackoverflow.com/questions/10961963/how-to-access-cookies-in-angularjs
        // https://docs.angularjs.org/api/ngCookies
    }

    // manage reading cookie to remember username and password
    function readRememberMeCookie(vm)
    {
        alert("Remember me option - cookie reading - under construction");
        vm.username = '';
        vm.password = '';
        return vm;
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