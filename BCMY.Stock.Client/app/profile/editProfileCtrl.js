(function () {

    "use strict";
    var module = angular.module("stockManagement");         // get module
    module.controller("EditProfileCtrl", ["$http", "blockUI", "$scope", "loginValidatorService", editProfileCtrl]);    // attach controller to the module


    function editProfileCtrl($http, blockUI, $scope, loginValidatorService)                   // controller function
    {
        var vm = this;
        vm.scope = $scope;
        if (loginValidatorService.loginValidator()) {
            EnableTopNavigationBar();
            $("#loggedInUserWithTime").text(localStorage["userName"]);            
            vm = defineModel(vm, $http, blockUI);
            prepareInitialUI(vm);
            wireCommands(vm);            
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
        vm.title = "Manage Profile : " + localStorage["userName"];
        vm.httpService = $http;
        vm.blockUI = blockUI;
        vm.errorMessage = '';
        vm.errorMessageChangePassword = '';
        vm.roles = null;
        removeErrorBorders(vm);
        disableUneditableFields(vm);
        
        // for the roles drop down
        vm.httpService({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/role'),
        }).success(function (data) {
            vm.roles = data;
            vm.roles.unshift({ id: '-1', name: '---- Select Role ----' });  // add element on top of the roles list for select data bind            
        }
        ).error(function (data) {
            alert('error - web service access')     // display error message            
        });
        vm = defineUserInfo(vm);
        return vm;
    }

    // used to remove error indicating borders
    function removeErrorBorders(vm)
    {
        vm.firstNameClass = '';
        vm.lastNameClass = '';
        vm.telephoneClass = '';
    }

    // used to disable uneditable fields of the form
    function disableUneditableFields(vm)
    {
        vm.usernameDisabled = true;
        vm.positionDisabled = true;
        vm.rolesDisabled = true;
        vm.lockedDisabled = true;
        vm.empDateDisabled = true;
        vm.regDateDisabled = true;
        vm.loginDtPDisabled = true;
        vm.logoutDtPeDisabled = true;
        vm.invalidLoginAttCountDisabled = true;
        vm.invalidLoginDtPDisabled = true;
    }

    // used to get all the user roles
    function GetAllRoles(vm)
    {
        vm.roles = null;
        // for the roles drop down
        vm.httpService({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/role'),
        }).success(function (data) {
            vm.roles = data;
            vm.roles.unshift({ id: '-1', name: '---- Select Role ----' });  // add element on top of the roles list for select data bind
            return vm;
        }
        ).error(function (data) {
            alert('error - web service access')     // display error message            
        });
    }

    // create initial user infterface components
    function prepareInitialUI(vm)
    {
        $('#telephone').mask('+99 (9) 9999 9999?999');

        // date UI masks - 01/03/2016
        $('#empDate').mask('99/99/9999');
        $('#regDate').mask('99/99/9999');

        setUpDatePickers();
    }

    // used to wire button click commands to functions
    function wireCommands(vm)
    {
        vm.saveUser = function ()
        {
            saveUser(vm);
        };

        vm.resetUser = function ()
        {
            resetUser(vm);
        };

        vm.changePassword = function ()
        {
            changePassword(vm);
        };
    }

    // save a user
    function saveUser(vm) {
        //alert("save user");
        var isValid = validateInputs(vm);
        //alert(isValid);
        if (isValid)
        {            
            var dataForBody = "username=" + vm.username + "&firstname=" + vm.firstname + "&lastname=" + vm.lastname + "&telephone=" + vm.telephone + "&extension=" + vm.extension;
            var serverUrl = ('https://localhost:44302/api/EditProfileAsync?' + dataForBody);
            vm.httpService({
                method: "post",
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage["access_token"] },
                url: serverUrl
            }).success(function (data) {
                if (data.indexOf('Success') > -1) {
                    vm.errorMessage = data;
                    defineUserInfo(vm);
                    toastr.success(data);
                }
                else {
                    vm.errorMessage = data;
                    toastr.warning(data);
                }
            }
            ).error(function (data) {
                vm.errorMessage = data;     // display error message
                toastr.error(data);
            });
        }
    }

    // validating user inputs
    function validateInputs(vm)
    {
        var isValid = false;
        // first name        
        vm.firstname = $.trim(vm.firstname);
        if (isNotEmptyOrSpaces(vm.firstname) && vm.firstname.length > 1) {
            if (isaValidName(vm.firstname)) {
                vm.errorMessage = '';
                vm.firstNameClass = '';
                isValid = true;
            }
            else {
                vm.errorMessage = 'Error - invalid first name - should only have alphabetical characters';
                vm.firstNameClass = 'errorBorder';
                isValid = false;
            }
        }
        else {
            vm.errorMessage = 'Error - invalid first name';
            vm.firstNameClass = 'errorBorder';
            isValid = false;
        }
        

        // last name
        if (isValid) {
            vm.lastname = $.trim(vm.lastname);
            if (isNotEmptyOrSpaces(vm.lastname) && vm.lastname.length > 1) {
                if (isaValidName(vm.lastname)) {
                    vm.errorMessage = '';
                    vm.lastNameClass = '';
                    isValid = true;
                }
                else {
                    vm.errorMessage = 'Error - invalid last name - should only have alphabetical characters';
                    vm.lastNameClass = 'errorBorder';
                    isValid = false;
                }
            }
            else {
                vm.errorMessage = 'Error - invalid last name';
                vm.lastNameClass = 'errorBorder';
                isValid = false;
            }
        }

        // telephone number ui-mask and ext number key press validations
        if (isValid) {
            vm.telephone = $.trim(vm.telephone);
            if (vm.telephone != '-' && isNotEmptyOrSpaces(vm.telephone)) {
                vm.errorMessage = '';
                vm.telephoneClass = '';
                isValid = true;
            }
            else {
                vm.errorMessage = 'Error - invalid telephone number';
                vm.telephoneClass = 'errorBorder';
                isValid = false;
            }
        }
        return isValid;
    }

    // reset user profile edit form
    function resetUser(vm)
    {
        //alert("user info reset");
        //debugger
        vm.errorMessage = '';
        if (vm.userVm == null) {
            defineUserInfo(vm);
        }
        else {
            removeErrorBorders(vm);
            vm.username = vm.userVm.userName;
            vm.position = vm.userVm.position;
            vm.firstname = vm.userVm.firstName;
            vm.lastname = vm.userVm.lastName;
            vm.telephone = vm.userVm.directDial;
            vm.extension = vm.userVm.extension;
            vm.rolesOfUser = GetStringArrayFromDelimitedString(vm.userVm.userRoles, ",");;
            vm.locked = vm.userVm.locked == true ? 'Yes' : 'No';
            vm.employmentDate = vm.userVm.employmentDate;
            vm.registrationDate = vm.userVm.registrationDate;
            vm.loginDateTime = vm.userVm.lastLogInTime;
            vm.logoutDateTime = vm.userVm.lastLogoutTime;
            vm.invalidLoginAttemptCount = vm.userVm.invalidLoginAttemptCount;
            vm.invalidLoginDtP = vm.userVm.lastInvalidLoginAttemptTime;
        }
    }

    // used for the password changes
    function changePassword(vm)
    {
        var isValid = validateChangePasswordInputs(vm);
        //alert(isValid);
        if (isValid)
        {
            var dataForBody = "username=" + vm.username + "&currentPassword=" + vm.currentPassword + "&newPassword=" + vm.newPassword;
            var serverUrl = ('https://localhost:44302/api/ChangePasswordAsync?' + dataForBody);
            vm.httpService({
                method: "post",
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage["access_token"] },
                url: serverUrl
            }).success(function (data) {
                if (data.indexOf('Success') > -1) {
                    vm.currentPassword = '';
                    vm.newPassword = '';
                    vm.confirmNewPassword = '';
                    vm.errorMessageChangePassword = data;
                    defineUserInfo(vm);
                    toastr.success(data);
                }
                else {
                    vm.errorMessageChangePassword = data;
                    toastr.warning(data);
                }
            }
            ).error(function (data) {
                vm.errorMessageChangePassword = data;     // display error message
                toastr.error(data);
            });
        }        
    }

    // used to validate change password form inputs
    function validateChangePasswordInputs(vm)
    {
        var isValid = false;
        // current password     
        vm.currentPassword = $.trim(vm.currentPassword);
        if (isNotEmptyOrSpaces(vm.currentPassword) && vm.currentPassword.length >= 6) {            
            vm.errorMessageChangePassword = '';
            vm.currentPasswordClass = '';
            isValid = true;
        }
        else {
            vm.errorMessageChangePassword = 'Error - invalid password';
            vm.currentPasswordClass = 'errorBorder';
            isValid = false;
        }
             

        // new password
        if (isValid) {
            vm.newPassword = $.trim(vm.newPassword);           
            if (isNotEmptyOrSpaces(vm.newPassword) && vm.newPassword.length >= 6) {
                if (vm.currentPassword != vm.newPassword) {
                    vm.errorMessageChangePassword = '';
                    vm.newPasswordClass = '';
                    isValid = true;
                }
                else {
                    vm.errorMessageChangePassword = 'Error - new password and current password cannot be same';
                    vm.newPasswordClass = 'errorBorder';
                    isValid = false;
                }
            }
            else {
                vm.errorMessageChangePassword = 'Error - invalid new password';
                vm.newPasswordClass = 'errorBorder';
                isValid = false;
            }
        }

        // confirm new password
        if (isValid) {
            vm.confirmNewPassword = $.trim(vm.confirmNewPassword);
            if (vm.confirmNewPassword == vm.newPassword) {
                vm.errorMessageChangePassword = '';
                vm.confirmNewPasswordClass = '';
                isValid = true;
            }
            else {
                vm.errorMessageChangePassword = 'Error - new password and confirmed new password do not match';
                vm.confirmNewPasswordClass = 'errorBorder';
                isValid = false;
            }
        }

        return isValid;
    }

    // used to define user information in the model
    function defineUserInfo(vm)
    {        
        var dataForBody = "username=" + localStorage["userName"];
        var serverUrl = ('https://localhost:44302/api/GetUserByEmail?' + dataForBody);
        var messageHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Bearer ' + localStorage["access_token"]
        };
        vm.httpService({
            method: "post",
            headers: messageHeaders,
            url: serverUrl
        }).success(function (userVm) {
            vm.userVm = userVm;
            if (userVm != null) {
                vm.username = userVm.userName;
                vm.position = userVm.position;
                vm.firstname = userVm.firstName;
                vm.lastname = userVm.lastName;
                vm.telephone = userVm.directDial;
                vm.extension = userVm.extension;
                vm.rolesOfUser = GetStringArrayFromDelimitedString(userVm.userRoles, ",");;
                vm.locked = userVm.locked == true ? 'Yes' : 'No';
                vm.employmentDate = userVm.employmentDate;
                vm.registrationDate = userVm.registrationDate;                
                vm.loginDateTime = userVm.lastLogInTime;
                vm.logoutDateTime = userVm.lastLogoutTime;
                vm.invalidLoginAttemptCount = userVm.invalidLoginAttemptCount;
                vm.invalidLoginDtP = userVm.lastInvalidLoginAttemptTime;
            }
            else {
                debugger
                toastr.warning("Error - user information retrieval unsuccessful, please contact IT");
            }
        }
        ).error(function (data) {
            debugger
            toastr.error("Error - user information retrieval unsuccessful, please contact IT");
        });

        return vm;
    }

    // date pickers
    function setUpDatePickers() {
        $("#empDate").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            },
            onClose: function (selectedDate) {
                $("#regDate").datepicker("option", "minDate", selectedDate);
            }
        });
        $("#regDate").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            },
            onClose: function (selectedDate) {
                $("#empDate").datepicker("option", "maxDate", selectedDate);
            }
        });
        $("#loginDtP").datetimepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            }
        });
        $("#logoutDtP").datetimepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            }
        });
        $("#invalidLoginDtP").datetimepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            }
        });
    }
}());