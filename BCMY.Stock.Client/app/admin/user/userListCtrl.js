(function () {

    "use strict";
    var module = angular.module("stockManagement");         // get module
    module.controller("UserListCtrl", ["$http", "blockUI", "$scope", userListCtrl]);    // attach controller to the module


    function userListCtrl($http, blockUI, $scope)                   // controller funcion
    {
        var vm = this;
        vm = defineModel(vm, $http, $scope, blockUI);
        prepareInitialUI(vm);
        wireCommands(vm);
    }

    function defineModel(vm, $http, $scope, blockUI)
    {
        vm.title = "User Management";
        vm.httpService = $http;
        vm.scope = $scope;
        vm.blockUI = blockUI;

        vm.errorMessage = "sample error";
        vm.errorMessageSearch = "sample error search";

        definePopupModelAttributes(vm);

        return vm;
    }

    function definePopupModelAttributes(vm)
    {
        vm.popupTitle = "title";
        vm.username = "username";
        vm.position = "position";
        vm.firstname = "first name";
        vm.lastname = "last name";
        vm.telephone = "telephone";
        vm.extension = "extension";
        vm.roles = -1; // default selection
        vm.employmentDate = "emp date";
        vm.registrationDate = "reg date";
        vm.loginDateTime = "last login DT";
        vm.logoutDateTime = "last logout DT";
        vm.invalidLoginAttemptCount = 0;
        vm.invalidLoginDtP = "last invalid DT";
        vm.locked = "not locked";

        vm.usernameDisabled = false;
        vm.positionDisabled = false;
        vm.firstNameDisabled = false;
        vm.lastNameDisabled = false;
        vm.telephoneDisabled = false;
        vm.extensionDisabled = false;
        vm.rolesDisabled = false;
        vm.regDateDisabled = false;
        vm.empDateDisabled = false;
        vm.loginDtPDisabled = false;
        vm.logoutDtPeDisabled = false;
        vm.invalidLoginAttCountDisabled = false;
        vm.invalidLoginDtPDisabled = false;
        vm.lockedDisabled = false;
    }
        
    function prepareInitialUI(vm)
    {
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
                    { "mData": "position", "sTitle": "Position", "bVisible": true },
                    { "mData": "employmentDate", "sTitle": "Employment Date", "bVisible": true },
                    { "mData": "registrationDate", "sTitle": "Registration Date", "bVisible": true },
                    { "mData": "lastLogInTime", "sTitle": "Last LogIn Time", "bVisible": true },
                    { "mData": "lastLogoutTime", "sTitle": "lastLogoutTime", "bVisible": true },
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
                    { "mData": "invalidLoginAttemptCount", "sTitle": "invalidLoginAttemptCount", "bVisible": true },
                    { "mData": "lastInvalidLoginAttemptTime", "sTitle": "lastInvalidLoginAttemptTime", "bVisible": true },
                    {
                        "mData": "locked", "sTitle": "Locked?", "sClass": "right", "mRender": function (data, type, row) {
                            if (data == false) {
                                return '<div style="background-color:lightblue; text-align:center">NO</div> ';
                            }
                            else {
                                return '<div style="background-color:red; text-align:center">LOCKED</div> ';
                            }
                        },
                        "aTargets": [0]
                    },

                    { "sTitle": "More info", "defaultContent": "<button class='userInfo'><span class='glyphicon glyphicon-search'></span></button>" },
                    { "sTitle": "Edit", "defaultContent": "<button class='editUser'><span class='glyphicon glyphicon-edit'></span></button>" },
                    { "sTitle": "Lock/Unlock", "defaultContent": "<button class='userLock'><span class='glyphicon glyphicon-lock'></span></button>" },
                    { "sTitle": "Delete", "defaultContent": "<button class='userDelete'><span class='glyphicon glyphicon-remove'></span></button>" }
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

        // on delete button clicks
        $('#usersGrid tbody').on('click', 'button.userDelete', function () {
            
            var data = table.row($(this).parents('tr')).data();
            deleteUser(vm, data);
        });

    }

    function editUser(vm, record)
    {
        alert("edit username : " + record.userName);
    }

    function userInformation(vm, record)
    {
        alert("info on username : " + record.userName);
        //vm = defineModelForInfoPopup(vm, record);
        //vm.scope.$evalAsync(); //$apply();

        $('#myModal').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    }
    
    function lockUser(vm, record)
    {
        alert("lock : " + record.userName);
    }

    function deleteUser(vm, record)
    {
        alert("delete : " + record.userName);
    }

    function createUser(vm)
    {
        alert("create a new user");
    }

    function resetCreateForm(vm)
    {
        alert("reset create form");
    }

    function searchUsers(vm)
    {
        alert("search users");
    }

    function resetSearchForm(vm)
    {
        alert("reset search users");
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
        $("#regDateP").datepicker({
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

}());