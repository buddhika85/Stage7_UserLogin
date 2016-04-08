(function () {

    "use strict";

    var module = angular.module("stockManagement");

    module.controller("UserLoginCtrl", ["$http", "blockUI", "$location", "$rootScope", "$timeout", "$window", userLoginCtrl]);    // attach controller to the module


    function userLoginCtrl($http, blockUI, $location, $rootScope, $timeout, $window)                   // controller funcion
    {
        //$('#topNavigationBar').hide();

        var vm = this;
        //DisableTopNavigationBar();
        //vm.showTopNavigationBar = true;
        
        vm = defineModel(vm, $http, blockUI);
        vm = prepareInitialUI(vm);
        vm = wireCommands(vm, $http, $location, $rootScope, $timeout, $window, blockUI);
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
        vm.title = "BCMY Stock Management";
        vm = readRememberMeCookie(vm);                      // assign remember me values to username and password
        vm.rememberMe = false;

        // for testing
        //readRememberMeCookie(vm);
        //vm.username = 'buddhika@bcmy.co.uk';
        //vm.password = 'Test123$';
        return vm;
    }

    function wireCommands(vm, $http, $location, $rootScope, $timeout, $window, blockUI)
    {
        vm.login = function () {
            loginUser(vm, $http, $location, $rootScope, $timeout, $window);
        };

        vm.fogotPassword = function ()
        {
            fogotPassword(vm, $http, $rootScope, $window, blockUI);
        }

        return vm;
    }

    // manage user login
    function loginUser(vm, $http, $location, $rootScope, $timeout, $window)
    {       
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
            })
            .success(function (data) {                
                // set the access token                
                localStorage["access_token"] = data.access_token;
                localStorage["userName"] = data.userName;
                localStorage["token_type"] = data.token_type;
                //localStorage[".expires"] = data.expires;
                //localStorage[".issued"] = data.issued;
                localStorage["access_token"] = data.access_token;
                localStorage["expires_in"] = data.expires_in;

                // write credential cookie                
                if (vm.rememberMe) { 
                    var dataForBody = "value=" + vm.password;
                    var serverUrl = ('https://localhost:44302/api/EncryptValue?' + dataForBody);
                    var messageHeadersForEnc = {
                        'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Bearer ' + localStorage["access_token"]
                    };
                    vm.httpService({
                        method: "post",
                        headers: messageHeadersForEnc ,
                        url: serverUrl
                    }).success(function (data) {                        
                        if (data != null) {
                            vm.encryptedPassword = data;
                            writeRememberMeCookie(vm);
                            // navigate to dashboard view               
                            window.location = window.location.protocol + "//" + window.location.host + "/#/dashboard";
                            window.location.reload();
                        }
                        else {
                            debugger
                            toastr.warning("Error - remember me option is not working, please contact IT");
                            // navigate to dashboard view               
                            //window.location = window.location.protocol + "//" + window.location.host + "/#/dashboard";
                            //window.location.reload();
                        }
                    }
                    ).error(function (data) {
                        debugger
                        toastr.error("Error - remember me option is not working, please contact IT");
                        // navigate to dashboard view               
                        //window.location = window.location.protocol + "//" + window.location.host + "/#/dashboard";
                        //window.location.reload();
                    }); 
                }
                else {
                    // navigate to dashboard view               
                    window.location = window.location.protocol + "//" + window.location.host + "/#/dashboard";
                    window.location.reload();
                }

                //alert(data.access_token);
                    
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

            })
            .error(function (data)
            {
                vm.error = 'Error - ' + data.error_description;  // Error - The username or password is incorrect. // data.error="invalid_grant"
            });
        }
        else {
            // invalid username or password - client side validation fails
            vm.error = 'Error - The username or password is incorrect.';
        }
        return vm;
    }
        
    // manage reading cookie to remember username and password
    function readRememberMeCookie(vm)
    {
        //debugger
        var cookiearray = document.cookie.split(';');        
        // cookies as key value pairs
        for (var i = 0; i < cookiearray.length; i++) {
            var key = cookiearray[i].split('=')[0];
            var value = cookiearray[i].split('=')[1];
            if (key != null && key != null && value != '' && value != null)
            { 
                if ($.trim(key) == 'username')
                {                    
                    vm.username = $.trim(value);
                }
                else if ($.trim(key) == 'password')
                {                    
                    var dataForBody = "value=" + value;
                    var serverUrl = ('https://localhost:44302/api/DecryptValue?' + dataForBody);
                    vm.httpService({
                        method: "post",
                        headers: { 'Content-Type': 'application/json' },
                        url: serverUrl
                    }).success(function (data) {
                        if (data != null) {
                            //debugger
                            vm.password = data;                      
                        }
                        else {
                            toastr.warning("Error - remember me option is not working, please contact IT");                            
                        }
                    }
                    ).error(function (data) {
                        toastr.error("Error - remember me option is not working- error data ciphering, please contact IT");                       
                    });
                    
                }
            }
        }

        return vm;
    }

    // manage writing cookie to remember username and password
    function writeRememberMeCookie(vm) {
        //debugger
        var now = new Date();
        var expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1); 
                
        //alert(vm.username + ' , ' + vm.encryptedPassword + ' , ' + now + ' , ' + expiry);
        
        document.cookie = "cookie creation date time=" + now + ";";
        document.cookie = "username=" + vm.username + ";";
        document.cookie = "password=" + vm.encryptedPassword + ";";
        document.cookie = "expires=" + expiry.toUTCString() + ";";        
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
    function fogotPassword(vm, $http, $rootScope, $window, blockUI) {
        //alert("fogot my password");
        blockUI.start();
        window.location = window.location.protocol + "//" + window.location.host + "/#/login/fogotPassword";
        window.location.reload();
        blockUI.stop();
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

    //// used to enable the top navigation bar - after logged in
    //function EnableTopNavigationBar() {
    //    //$('#topNavigationBar').find('a').prop('disabled', false);
    //    //$('#topNavigationBar a').unbind("click");
    //    //$('#topNavigationBar').css("visibility", "visible");
    //    $('#topNavigationBar').css("visibility", "visible");
    //}

}());