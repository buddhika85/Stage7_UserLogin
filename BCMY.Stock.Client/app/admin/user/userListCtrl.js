(function () {

    "use strict";
    var module = angular.module("stockManagement");         // get module
    module.controller("UserListCtrl", ["$http", "blockUI", "$scope", "loginValidatorService", userListCtrl]);    // attach controller to the module


    function userListCtrl($http, blockUI, $scope, loginValidatorService)                   // controller funcion
    {
        var vm = this;
        if (loginValidatorService.loginValidator()) {
            EnableTopNavigationBar();
            $("#loggedInUserWithTime").text(localStorage["userName"]);
            vm = defineModel(vm, $http, $scope, blockUI);
            prepareInitialUI(vm);
            wireCommands(vm);
        }
        else {
            localStorage["userName"] = null;
            window.location = window.location.protocol + "//" + window.location.host + "/#/login";
            window.location.reload();
        }        
    }

    function defineModel(vm, $http, $scope, blockUI)
    {
        vm.title = "User Management";
        vm.httpService = $http;
        vm.scope = $scope;
        vm.blockUI = blockUI;
                
        vm.errorMessageSearch = "sample error search";
        vm.roles = null;

        // for the roles drop downs
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
        
        defineCreateFormAttributes(vm);
        definePopupModelAttributes(vm);
        defineSearchFormAttributes(vm);

        return vm;
    }

    // used to bind create form fields
    function defineCreateFormAttributes(vm)
    {
        // re initialise create properties
        vm.usernameCreate = '';
        vm.rolesInCreate = '';
        vm.firstNameCreate = '';
        vm.lastNameCreate = '';
        vm.positionCreate = '';
        vm.telephoneCreate = '';
        vm.extensionCreate = '';
        vm.empDateCreate = '';
        vm.regDateCreate = '';
        vm.errorMessageCreate = '';

        // remove error borders
        vm.usernameCreateClass = '';
        vm.rolesInCreateClass = '';
        vm.firstNameCreateClass = '';
        vm.lastNameCreateClass = '';
        vm.positionCreateClass = '';
        vm.telephoneCreateClass = '';
        vm.empDateCreateClass = '';
        vm.regDateCreateClass = '';
    }

    // used to bind create form fields
    function defineSearchFormAttributes(vm) {
        vm.usernameE = '';
        vm.rolesInSearch = '';
        vm.firstNameE = '';
        vm.lastNameE = '';
        vm.positionE = '';        
        vm.empDateE = '';
        vm.regDateE = '';
        vm.lastLoginDateE = '';
        vm.lastInvalidDateE = '';
        vm.errorMessageSearch = '';
    }

    // used to bind popup fields
    function definePopupModelAttributes(vm)
    {
        emptyPopupFields(vm);
        disablePopupFields(vm, true);
        vm.scope.$evalAsync();
    }
        
    function prepareInitialUI(vm)
    {
        $('#telephoneN').mask('+99 (9) 9999 9999?999');
        $('#telephone').mask('+99 (9) 9999 9999?999');

        // date UI masks - 01/03/2016
        $('#empDate').mask('99/99/9999');
        $('#regDate').mask('99/99/9999');
        
        setUpDatePickers();
        drawUsersGrid(vm);
    }

    function wireCommands(vm) {
        // create
        vm.createUser = function () {
            createUser(vm);
        };
        vm.resetCreateForm = function () {
            resetCreateForm(vm);
        };

        // search
        vm.searchUsers = function () {
            searchUsers(vm);
        };
        vm.resetSearchForm = function () {
            resetSearchForm(vm);
        };

        // update popup
        vm.saveUserEdit = function () {
            saveUserEdit(vm);
        };

        // collapse panels
        $('#newUserHeaderPanel').click(function () {
            $('#newUserInputSection').toggleClass('is-hidden');
        });
        $('#searchHeaderPanel').click(function () {
            $('#searchUserInputSection').toggleClass('is-hidden');
        });
        $('#searchResultHeaderPanel').click(function () {
            $('#searchResultsSection').toggleClass('is-hidden');
        });
    }

    // used to get available role info and used to create the roles grid
    function drawUsersGrid(vm) {        
        var users = null;
        vm.httpService({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/user'),
        }).success(function (data) {
            
            users = data;
            drawHelper(users, vm);
        }
        ).error(function (data) {
            alert('error - web service access')     // display error message            
        });
    }

    // used to draw users grid
    function drawHelper(users, vm) {
        $('#usersGrid').html("");
        $('#usersGrid').dataTable({
            "data": users,
            "aoColumns": [
                    { "mData": "id", "sTitle": "User GUID", "bVisible": false },
                    { "mData": "userName", "sTitle": "Username", "bVisible": true },
                    { "mData": "firstName", "sTitle": "First name", "bVisible": true },
                    { "mData": "lastName", "sTitle": "Last name", "bVisible": true },
                    { "mData": "position", "sTitle": "Position", "bVisible": true },
                    {
                        "mData": "directDial", "sTitle": "Telephone", "bVisible": true
                    },
                    {
                        "mData": "extension", "sTitle": "Ext", "bVisible": true
                    },
                    {
                        "mData": "userRoles", "sTitle": "User roles", "bVisible": true
                    },
                    //{
                    //    "mData": "roles", "sTitle": "User roles", "sClass": "right", "mRender": function (data, type, row) {
                    //        if (data != null) {
                    //            var userRolesCsv = "";
                    //            $.each(data, function (index, value) {                                     
                    //                if (userRolesCsv == "") {
                    //                    userRolesCsv = value.name;
                    //                }
                    //                else {
                    //                    userRolesCsv += (value.name + ", ");
                    //                }                                    
                    //            });
                    //            return userRolesCsv;
                    //        }
                    //        else {
                    //            return "No roles";
                    //        }
                    //    },
                    //    "aTargets": [0]
                    //},
                    { "mData": "employmentDate", "sTitle": "Employment Date", "bVisible": true },
                    { "mData": "registrationDate", "sTitle": "Registration Date", "bVisible": true },
                    { "mData": "lastLogInTime", "sTitle": "Last LogIn", "bVisible": true },
                    { "mData": "lastLogoutTime", "sTitle": "Last Logout", "bVisible": true },
                    {
                        "mData": "isLoggedIn", "sTitle": "Logged in?", "sClass": "right", "mRender": function (data, type, row) {
                            if (data == true) {
                                return '<div style="background-color:darkorange; text-align:center">IN</div> ';
                            }
                            else {
                                return '<div style="background-color:green; text-align:center">OUT</div> ';
                            }
                        },
                        "aTargets": [0]
                    },
                    { "mData": "invalidLoginAttemptCount", "sTitle": "Invalid Login Attempts", "bVisible": true },
                    { "mData": "lastInvalidLoginAttemptTime", "sTitle": "Last Invalid Login Time", "bVisible": true },
                    {
                        "mData": "locked", "sTitle": "Locked?", "sClass": "right", "mRender": function (data, type, row) {
                            if (data == false) {
                                return '<div style="background-color:#668cff; text-align:center">NO</div> ';
                            }
                            else {
                                return '<div style="background-color:#ff4d4d; text-align:center">LOCKED</div> ';
                            }
                        },
                        "aTargets": [0]
                    },

                    { "sTitle": "More info", "defaultContent": "<button class='userInfo'><span class='glyphicon glyphicon-search'></span></button>" },
                    { "sTitle": "Edit", "defaultContent": "<button class='editUser'><span class='glyphicon glyphicon-edit'></span></button>" },
                    //{ "sTitle": "Lock/Unlock", "defaultContent": "<button class='userLock'><span class='glyphicon glyphicon-lock'></span></button>" },
                    {
                        "mData": "locked", "sTitle": "Lock/Unlock", "sClass": "right", "mRender": function (data, type, row) {
                            if (data == false) {
                                return "<button class='userLock' class='btn-sm btn-danger' style='width:75%;background-color: #ff4d4d;'> Lock </button>";
                            }
                            else {
                                return "<button class='userLockUnlock' class='btn-sm btn-info' style='width:75%;background-color: #668cff;'>Unlock</button>";
                            }
                        },
                        "aTargets": [0]
                    }
            ],
            "bDestroy": true,
            "aLengthMenu": [[15, 50, 100, 200, 500, 700, 1000, -1], [15, 50, 100, 200, 500, 700, 1000, "All"]],
            "iDisplayLength": -1
        });

        var table = $('#usersGrid').DataTable();

        // on edit button clicks
        $('#usersGrid tbody').on('click', 'button.editUser', function () {

            var data = table.row($(this).parents('tr')).data();
            editUser(vm, data);
        });

        // on info button clicks
        $('#usersGrid tbody').on('click', 'button.userInfo', function () {

            var data = table.row($(this).parents('tr')).data();
            userInformation(vm, data);
        });

        // on lock button clicks
        $('#usersGrid tbody').on('click', 'button.userLock', function () {

            var data = table.row($(this).parents('tr')).data();
            lockUser(vm, data);
        });

        // on unlock button clicks 
        $('#usersGrid tbody').on('click', 'button.userLockUnlock', function () {

            var data = table.row($(this).parents('tr')).data();
            unlockUser(vm, data);
        });

        // on delete button clicks
        $('#usersGrid tbody').on('click', 'button.userDelete', function () {
            
            var data = table.row($(this).parents('tr')).data();
            deleteUser(vm, data);
        });

    }

    function unlockUser(vm, record)
    {
        //alert("unlock username : " + record.userName);
        bootbox.dialog({
            message: "Are you sure that you want to unlock the user : " + record.userName + " ?",
            title: "Confirm User Unlock",
            buttons: {
                danger: {
                    label: "No",
                    className: "btn-danger",
                    callback: function () {
                        toastr.warning("User not unlocked");
                    }
                },
                main: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function () {
                        lockUnlockUser(vm, record.userName, 'unlock');
                    }
                }
            }
        });              
    }

    function lockUser(vm, record) {
        //alert("lock : " + record.userName);//
        bootbox.dialog({
            message: "Are you sure that you want to lock the user : " + record.userName + " ?",
            title: "Confirm User Unlock",
            buttons: {
                danger: {
                    label: "No",
                    className: "btn-danger",
                    callback: function () {
                        toastr.warning("User not locked");
                    }
                },
                main: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function () {
                        lockUnlockUser(vm, record.userName, 'lock');
                    }
                }
            }
        });        
    }

    function lockUnlockUser(vm, username, lockUnlock)
    {
        //debugger
        var dataForBody = "username=" + username + "&lockUnlock=" + lockUnlock;
        var serverUrl = ('https://localhost:44302/api/LockUnlockUserAsync?' + dataForBody);
        vm.httpService({
            method: "post",
            headers: { 'Content-Type': 'application/json' },
            url: serverUrl,
        }).success(function (data) {
            //alert(data);
            drawUsersGrid(vm);              // refersh the grid to display the updated record
            toastr.success(data);
        }
        ).error(function (data) {
            alert('error - web service access')     // display error message            
        });
    }

    function deleteUser(vm, record) {
        alert("delete : " + record.userName);
    }


    function editUser(vm, record)
    {
        //alert("edit username : " + record.userName);
        //alert("info on username : " + record.userName);         
        defineUserEditPopupAttributes(vm, record);
        vm.scope.$evalAsync();
        $('#myModal').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    }

    // save - insert/update popup
    function saveUserEdit(vm) {
        //alert('save edit - popup ' + vm.username + ' , ' + vm.position + ' , ' + vm.firstname  + ' , ' + vm.lastname  + ' , ' + vm.telephone  + ' , ' + vm.extension  + ' , ' + 
        //    vm.rolesInPopup + ' , ' + vm.employmentDate + ' , ' + vm.registrationDate + ' , ' + vm.locked);
        debugger
        var isValid = validateEditPopup(vm);
        //alert('save edit - popup ' + isValid);
        if (isValid) {
            if (vm.rolesInPopup[0] == '---- Select Role ----') {
                vm.rolesInPopup.shift();   // remove if '---- Select Role ----' is selected as a role
            }
            var dataForBody = "username=" + vm.username + "&rolescsv=" + vm.rolesInPopup + "&firstname=" + vm.firstname +
                "&lastname=" + vm.lastname + "&position=" + vm.position + "&telephone=" + vm.telephone + "&extension=" + vm.extension +
                "&employmentDate=" + vm.employmentDate + "&registrationDate=" + vm.registrationDate + "&locked=" + vm.locked;

            var serverUrl = ('https://localhost:44302/api/UpdateUserAsync?' + dataForBody);

            vm.httpService({
                method: "post",
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage["access_token"] },
                url: serverUrl
            }).success(function (data) {
                if (data.indexOf('Success') > -1) {

                    // user creation success, now assign roles
                    dataForBody = "username=" + vm.username + "&rolescsv=" + vm.rolesInPopup;
                    serverUrl = ('https://localhost:44302/api/AssignRolesAsync?' + dataForBody);
                    vm.httpService({
                        method: "post",
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage["access_token"] },
                        url: serverUrl
                    }).success(function (data) {
                        if (data.indexOf('Success') > -1) {
                            vm.errorMessagePopup = "Success - user update and role assignment successful";
                            drawUsersGrid(vm);              // refersh the grid to display the updated record  
                            disablePopupFields(vm, true);   // disable popup fields
                            toastr.success("Success - user update and role assignment successful");
                        }
                        else {
                            vm.errorMessagePopup = "Error - user with username " + vm.username + " updated, but role assignment unsuccssful, please contact IT support";
                            toastr.warning("Error - user with username " + vm.username + " updated, but role assignment unsuccssful, please contact IT support");
                        }
                    }
                    ).error(function (data) {
                        vm.errorMessagePopup = data;     // display error message
                        toastr.error(data);
                    });
                }
                else {
                    vm.errorMessagePopup = data;     // display error message
                    toastr.warning(data);
                }
            }
            ).error(function (data) {
                vm.errorMessagePopup = data;     // display error message
                toastr.error(data);
            });
        }
    }

    function userInformation(vm, record)
    {
        //alert("info on username : " + record.userName);         
        defineUserInfoPopupAttributes(vm, record);
        vm.scope.$evalAsync();
        $('#myModal').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    }

    function defineUserEditPopupAttributes(vm, record)
    {
        // enable popup fields
        disablePopupFields(vm, false);

        // populate with selected record data
        var popupTitle = "Edit user - " + record.userName;
        populatePopupFields(vm, record, popupTitle);
    }

    function defineUserInfoPopupAttributes(vm, record)
    {
        // disable popup fields
        disablePopupFields(vm, true);

        // populate with selected record data
        var popupTitle = "Info on user - " + record.userName;
        populatePopupFields(vm, record, popupTitle);
    }

    // used to populate popup fields based on available vm
    function populatePopupFields(vm, record, popupTitle)
    {
        emptyPopupFields(vm);
        if (record != null)
        {
            vm.popupTitle = popupTitle;
            vm.username = record.userName;
            vm.position = record.position;
            vm.firstname = record.firstName;
            vm.lastname = record.lastName;
            vm.telephone = record.directDial;
            vm.extension = record.extension;                        
            vm.rolesInPopup = GetStringArrayFromDelimitedString(record.userRoles, ",");//["Executive", "Director"];
            vm.employmentDate = record.employmentDate.replace(' -', '');
            vm.registrationDate = record.registrationDate.replace('- ', '');
            vm.loginDateTime = record.lastLogInTime;
            vm.logoutDateTime = record.lastLogoutTime;
            vm.invalidLoginAttemptCount = record.invalidLoginAttemptCount;
            vm.invalidLoginDtP = record.lastInvalidLoginAttemptTime;
            vm.locked = record.locked == true ? 'Yes' : 'No';
        }        
    }
        

    // remove popup fields data
    function emptyPopupFields(vm)
    {
        // empty input fields
        vm.popupTitle = "";
        vm.username = "";
        vm.position = "";
        vm.firstname = "";
        vm.lastname = "";
        vm.telephone = "";
        vm.rolesInPopup = [];
        vm.extension = "";
        vm.employmentDate = "";
        vm.registrationDate = "";
        vm.loginDateTime = "";
        vm.logoutDateTime = "";
        vm.invalidLoginAttemptCount = "";
        vm.invalidLoginDtP = "";
        vm.locked = "";
        vm.errorMessagePopup = "";

        // remove error borders
        vm.positionClass = '';
        vm.rolesClass = '';
        vm.firstNameClass = '';
        vm.lastNameClass = '';
        vm.telephoneClass = '';
        vm.empDateClass = '';
        vm.regDateClass = '';
    }

    // disable popup fields for user info popup
    function disablePopupFields(vm, isDisabled)
    {
        vm.usernameDisabled = true;
        vm.positionDisabled = isDisabled;
        vm.firstNameDisabled = isDisabled;
        vm.lastNameDisabled = isDisabled;
        vm.telephoneDisabled = isDisabled;
        vm.extensionDisabled = isDisabled;
        vm.rolesDisabled = isDisabled;
        vm.lockedDisabled = isDisabled;
        vm.empDateDisabled = isDisabled;
        vm.regDateDisabled = isDisabled;

        // below are always disabled
        vm.loginDtPDisabled = true;
        vm.logoutDtPeDisabled = true;
        vm.invalidLoginAttCountDisabled = true;
        vm.invalidLoginDtPDisabled = true;
        
        vm.saveBtnPopupDisabled = isDisabled;           // save button
    }

    function createUser(vm)
    {        
        var isValid = validateCreateForm(vm);
        if (isValid)
        {
            if(vm.rolesInCreate[0] == '---- Select Role ----' )
            {
                vm.rolesInCreate.shift();   // remove if '---- Select Role ----' is selected as a role
            }
            var dataForBody = "username=" + vm.usernameCreate + "&rolescsv=" + vm.rolesInCreate + "&firstname=" + vm.firstNameCreate +
                "&lastname=" + vm.lastNameCreate + "&position=" + vm.positionCreate + "&telephone=" + vm.telephoneCreate + "&extension=" + vm.extensionCreate +
                "&employmentDate=" + vm.empDateCreate + "&registrationDate=" + vm.regDateCreate;

            var serverUrl = ('https://localhost:44302/api/CreateUserAsync?' + dataForBody);
            
            vm.httpService({
                method: "post",
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage["access_token"] },
                url: serverUrl
            }).success(function (data) {                
                if (data.indexOf('Success') > -1) {

                    // user creation success, now assign roles
                    dataForBody = "username=" + vm.usernameCreate + "&rolescsv=" + vm.rolesInCreate;
                    serverUrl = ('https://localhost:44302/api/AssignRolesAsync?' + dataForBody);
                    vm.httpService({
                        method: "post",
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage["access_token"] },
                        url: serverUrl
                    }).success(function (data) {
                        if (data.indexOf('Success') > -1) {
                            vm.errorMessageCreate = "Success - user creation and role assignment successful - an email sent to the user notifying temporary password";
                            drawUsersGrid(vm);              // refersh the grid to display the updated record  
                            defineCreateFormAttributes(vm); // clear create form
                            toastr.success("Success - user creation and role assignment successful - an email sent to the user notifying temporary password");
                        }
                        else {
                            vm.errorMessageCreate = "Error - user with username " + vm.usernameCreate + " created, but role assignment unsuccssful, please contact IT support";     
                            toastr.warning("Error - user with username " + vm.usernameCreate + " created, but role assignment unsuccssful, please contact IT support");
                        }
                    }
                    ).error(function (data) {
                        vm.errorMessageCreate = data;     // display error message
                        toastr.error(data);
                    });            
                }
                else {
                    vm.errorMessageCreate = data;     // display error message
                    toastr.warning(data);
                }
            }
            ).error(function (data) {
                vm.errorMessageCreate = data;     // display error message
                toastr.error(data);
            });
        }
    }

    function resetCreateForm(vm)
    {
        //alert("reset create form");
        defineCreateFormAttributes(vm); // clear create form
    }

    function searchUsers(vm)
    {
        // vm.errorMessageSearch
        //alert("search users - " + vm.usernameE + ' , ' + 
        //vm.rolesInSearch + ' , ' + 
        //vm.firstNameE + ' , ' + 
        //vm.lastNameE + ' , ' + 
        //vm.positionE + ' , ' +     
        //vm.empDateE + ' , ' + 
        //vm.regDateE + ' , ' + 
        //vm.lastLoginDateE + ' , ' + 
        //vm.lastInvalidDateE);
        //debugger
        if (vm.rolesInSearch[0] == '---- Select Role ----') {
            vm.rolesInSearch.shift();   // remove if '---- Select Role ----' is selected as a role
        }
        var dataForBody = "username=" + vm.usernameE + "&userRolesCsv=" + vm.rolesInSearch + "&firstname=" + vm.firstNameE +
            "&lastname=" + vm.lastNameE + "&position=" + vm.positionE + "&employmentDate=" + vm.empDateE + "&registrationDate=" + vm.regDateE +
            "&lastLoginDateTime=" + vm.lastLoginDateE + "&lastInvalidLoginDateTime=" + vm.lastInvalidDateE;
        var serverUrl = ('https://localhost:44302/api/SearchUsersSQL?' + dataForBody);
        var users = null;
        vm.httpService({
            method: "post",
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage["access_token"] },
            url: serverUrl
        }).success(function (data) {
            users = data;
            drawHelper(users, vm);
        }
        ).error(function (data) {
            vm.errorMessageSearch = "Error - Please contact IT support - " + data;     // display error message
            toastr.error("Error - Please contact IT support - " + data);
        });
    }

    function resetSearchForm(vm)
    {
        //alert("reset search users");
        defineSearchFormAttributes(vm);
    }

    // used to setup datepickers
    function setUpDatePickers() {

        // create
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

        // search
        $("#empDateE").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            },
            onClose: function (selectedDate) {
                $("#regDateE").datepicker("option", "minDate", selectedDate);
            }
        });
        $("#regDateE").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            },
            onClose: function (selectedDate) {
                $("#empDateE").datepicker("option", "maxDate", selectedDate);
            }
        });
        // search
        $("#lastLoginDateE").datetimepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            }
        });
        $("#lastInvalidDateE").datetimepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            }
        });
        
        // popup
        $("#empDateP").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            },
            onClose: function (selectedDate) {
                $("#regDateP").datepicker("option", "minDate", selectedDate);
            }
        });
        $("#regDateP").datetimepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            },
            onClose: function (selectedDate) {
                $("#empDateP").datepicker("option", "maxDate", selectedDate);
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

    // validate user edit popup inputs
    function validateEditPopup(vm)
    {
        var isValid = false;

        // username validation
        //if (isNotEmptyOrSpaces(vm.username) && validateEmail(vm.username)) {
        //    vm.errorMessagePopup = '';
        //    vm.userNameClass = '';
        //    isValid = true;
        //}
        //else {
        //    vm.errorMessagePopup = 'Error - username should be a valid email address';
        //    vm.userNameClass = 'errorBorder';
        //    isValid = false;
        //}

        // position
        //if (isValid) {
        vm.position = $.trim(vm.position);
        if (isNotEmptyOrSpaces(vm.position) && vm.position.length > 1) {
            vm.errorMessagePopup = '';
            vm.positionClass = '';
            isValid = true;
        }
        else {
            vm.errorMessagePopup = 'Error - invalid position';
            vm.positionClass = 'errorBorder';
            isValid = false;
        }
        //}

        // roles
        if (isValid) {
            if (vm.rolesInPopup != "") {
                if (vm.rolesInPopup.length == 1 && vm.rolesInPopup[0] == '---- Select Role ----') { // if one role selected and selected role is '---- Select Role ----'
                    vm.errorMessagePopup = 'Error - user should have atlease a single role';
                    vm.rolesClass = 'errorBorder';
                    isValid = false;
                }
                else {
                    vm.errorMessagePopup = '';
                    vm.rolesClass = '';
                    isValid = true;
                }
            }
            else {
                vm.errorMessagePopup = 'Error - user should have atlease a single role';
                vm.rolesClass = 'errorBorder';
                isValid = false;
            }
        }



        // first name
        if (isValid) {
            vm.firstname = $.trim(vm.firstname);
            if (isNotEmptyOrSpaces(vm.firstname) && vm.firstname.length > 1) {
                if (isaValidName(vm.firstname)) {
                    vm.errorMessagePopup = '';
                    vm.firstNameClass = '';
                    isValid = true;
                }
                else {
                    vm.errorMessagePopup = 'Error - invalid first name - should only have alphabetical characters';
                    vm.firstNameClass = 'errorBorder';
                    isValid = false;
                }
            }
            else {
                vm.errorMessagePopup = 'Error - invalid first name';
                vm.firstNameClass = 'errorBorder';
                isValid = false;
            }
        }

        // last name
        if (isValid) {
            vm.lastname = $.trim(vm.lastname);
            if (isNotEmptyOrSpaces(vm.lastname) && vm.lastname.length > 1) {
                if (isaValidName(vm.lastname)) {
                    vm.errorMessagePopup = '';
                    vm.lastNameClass = '';
                    isValid = true;
                }
                else {
                    vm.errorMessagePopup = 'Error - invalid last name - should only have alphabetical characters';
                    vm.lastNameClass = 'errorBorder';
                    isValid = false;
                }
            }
            else {
                vm.errorMessagePopup = 'Error - invalid last name';
                vm.lastNameClass = 'errorBorder';
                isValid = false;
            }
        }             
        
        // telephone number ui-mask and ext number key press validations
        if (isValid) {
            vm.telephone = $.trim(vm.telephone);
            if (vm.telephone != '-' && isNotEmptyOrSpaces(vm.telephone)) {
                vm.errorMessagePopup = '';
                vm.telephoneClass = '';
                isValid = true;
            }
            else {
                vm.errorMessagePopup = 'Error - invalid telephone number';
                vm.telephoneClass = 'errorBorder';
                isValid = false;
            }
        }

        // employment date
        if (isValid) {
            vm.employmentDate = $.trim(vm.employmentDate);
            var date = Date.parse(vm.employmentDate);
            if (isNotEmptyOrSpaces(vm.employmentDate)) {
                vm.errorMessagePopup = '';
                vm.empDateClass = '';
                isValid = true;
            }
            else {
                vm.errorMessagePopup = 'Error - invalid employment date';
                vm.empDateClass = 'errorBorder';
                isValid = false;
            }
        }

        // registration date
        if (isValid) {
            vm.registrationDate = $.trim(vm.registrationDate);
            var date = Date.parse(vm.registrationDate);
            if (isNotEmptyOrSpaces(vm.registrationDate)) {
                vm.errorMessagePopup = '';
                vm.regDateClass = '';
                isValid = true;
            }
            else {
                vm.errorMessagePopup = 'Error - invalid registration date';
                vm.regDateClass = 'errorBorder';
                isValid = false;
            }
        }


        return isValid;
    }


    // validate user creation inputs
    function validateCreateForm(vm)
    {
        var isValid = false;

        // username validation
        vm.usernameCreate = $.trim(vm.usernameCreate);
        if (isNotEmptyOrSpaces(vm.usernameCreate) && validateEmail(vm.usernameCreate)) {
            vm.errorMessageCreate = '';
            vm.usernameCreateClass = '';
            isValid = true;
        }
        else {
            vm.errorMessageCreate = 'Error - username should be a valid email address';
            vm.usernameCreateClass = 'errorBorder';
            isValid = false;
        }

        // roles
        //debugger
        if (isValid)
        {            
            if (vm.rolesInCreate != "") {
                if (vm.rolesInCreate.length == 1 && vm.rolesInCreate[0] == '---- Select Role ----') { // if one role selected and selected role is '---- Select Role ----'
                    vm.errorMessageCreate = 'Error - user should have atlease a single role';
                    vm.rolesInCreateClass = 'errorBorder';
                    isValid = false;
                }
                else {
                    vm.errorMessageCreate = '';
                    vm.rolesInCreateClass = '';
                    isValid = true;
                }                
            }
            else {
                vm.errorMessageCreate = 'Error - user should have atlease a single role';
                vm.rolesInCreateClass = 'errorBorder';
                isValid = false;
            }
        }

        // first name
        if (isValid)
        {
            vm.firstNameCreate = $.trim(vm.firstNameCreate);
            if (isNotEmptyOrSpaces(vm.firstNameCreate) && vm.firstNameCreate.length > 1) {
                if (isaValidName(vm.firstNameCreate)) {
                    vm.errorMessageCreate = '';
                    vm.firstNameCreateClass = '';
                    isValid = true;
                }
                else {
                    vm.errorMessageCreate = 'Error - invalid first name - should only have alphabetical characters';
                    vm.firstNameCreateClass = 'errorBorder';
                    isValid = false;
                }
            }
            else {
                vm.errorMessageCreate = 'Error - invalid first name';
                vm.firstNameCreateClass = 'errorBorder';
                isValid = false;
            }
        }

        // last name
        if (isValid) {
            vm.lastNameCreate = $.trim(vm.lastNameCreate);
            if (isNotEmptyOrSpaces(vm.lastNameCreate) && vm.lastNameCreate.length > 1) {
                if (isaValidName(vm.lastNameCreate)) {
                    vm.errorMessageCreate = '';
                    vm.lastNameCreateClass = '';
                    isValid = true;
                }
                else {
                    vm.errorMessageCreate = 'Error - invalid last name - should only have alphabetical characters';
                    vm.lastNameCreateClass = 'errorBorder';
                    isValid = false;
                }
            }
            else {
                vm.errorMessageCreate = 'Error - invalid last name';
                vm.lastNameCreateClass = 'errorBorder';
                isValid = false;
            }
        }

        // position
        if (isValid) {
            vm.positionCreate = $.trim(vm.positionCreate);
            if (isNotEmptyOrSpaces(vm.positionCreate) && vm.positionCreate.length > 1) {                
                    vm.errorMessageCreate = '';
                    vm.positionCreateClass = '';
                    isValid = true;                
            }
            else {
                vm.errorMessageCreate = 'Error - invalid position';
                vm.positionCreateClass = 'errorBorder';
                isValid = false;
            }
        }

        // telephone number ui-mask and ext number key press validations
        if (isValid) {
            vm.telephoneCreate = $.trim(vm.telephoneCreate);
            if (isNotEmptyOrSpaces(vm.telephoneCreate)) {
                vm.errorMessageCreate = '';
                vm.telephoneCreateClass = '';
                isValid = true;
            }
            else {
                vm.errorMessageCreate = 'Error - invalid telephone number';
                vm.telephoneCreateClass = 'errorBorder';
                isValid = false;
            }
        }

        // employment date
        if (isValid)
        {
            vm.empDateCreate = $.trim(vm.empDateCreate);
            var date = Date.parse(vm.empDateCreate);
            if (isNotEmptyOrSpaces(vm.empDateCreate)) {
                vm.errorMessageCreate = '';
                vm.empDateCreateClass = '';
                isValid = true;
            }
            else {
                vm.errorMessageCreate = 'Error - invalid employment date';
                vm.empDateCreateClass = 'errorBorder';
                isValid = false;
            }
        }

        // registration date
        if (isValid)
        {
            vm.regDateCreate = $.trim(vm.regDateCreate);
            var date = Date.parse(vm.regDateCreate);
            if (isNotEmptyOrSpaces(vm.regDateCreate)) {
                vm.errorMessageCreate = '';
                vm.regDateCreateClass = '';
                isValid = true;
            }
            else {
                vm.errorMessageCreate = 'Error - invalid registration date';
                vm.regDateCreateClass = 'errorBorder';
                isValid = false;
            }
        }

        return isValid;
    }

}());