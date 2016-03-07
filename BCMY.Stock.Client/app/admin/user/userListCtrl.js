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

        vm.errorMessage = "error";
        vm.errorMessageSearch = "error - s";

        return vm;
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
            debugger
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

                    


                    { "sTitle": "Edit", "defaultContent": "<button class='userInfo'><span class='glyphicon glyphicon-edit'></span></button>" },
                    { "sTitle": "Lock", "defaultContent": "<button class='userLock'><span class='glyphicon glyphicon-lock'></span></button>" },
                    { "sTitle": "Delete", "defaultContent": "<button class='userDelete'><span class='glyphicon glyphicon-remove'></span></button>" }
            ],
            "bDestroy": true,
            "aLengthMenu": [[15, 50, 100, 200, 500, 700, 1000, -1], [15, 50, 100, 200, 500, 700, 1000, "All"]],
            "iDisplayLength": -1
        });

        var table = $('#usersGrid').DataTable();

        // on edit button clicks
        $('#usersGrid tbody').on('click', 'button.userInfo', function () {

            var data = table.row($(this).parents('tr')).data();
            editUser(vm, data);
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

    }

}());