(function () {

    "use strict";
    var module = angular.module("stockManagement");         // get module
    module.controller("RoleListCtrl", ["$http", "blockUI", roleListCtrl]);    // attach controller to the module


    function roleListCtrl($http, blockUI)                   // controller funcion
    {
        var vm = this;
        vm = defineModel(vm, $http, blockUI);
        prepareInitialUI(vm);
        wireCommands(vm);
    }

    // model object initiaition for the user interface
    function defineModel(vm, $http, blockUI)
    {
        vm.title = "Role Management";
        vm.httpService = $http;
        vm.blockUI = blockUI;
        vm = defineModelForNewRole(vm);

        return vm;
    }

    // used to initiate initial popup attributes of the model object
    function defineModelForNewRole(vm)
    {
        vm.popupTitle = "Insert Role";
        vm.roleName = "";        
        vm.roleDesc = "";        
        vm.userCount = 0;
        vm.userCountDisabled = false;            // number of users for the role
        vm.errorMessage = "";
                
        return vm;
    }

    // used to create the initial ui elements
    function prepareInitialUI(vm)
    {        
        vm.blockUI.start();
        drawRoleGrid(vm);
        vm.blockUI.stop();        
    }

    // used to attach commands to the buttons
    function wireCommands(vm)
    {
        vm.insertRole = function () {
            insertRole(vm);
        };
        vm.saveNewRole = function () {
            saveNewRole(vm);
        };
    }

    // used to insert new roles
    function insertRole(vm)
    {
        //alert("Insert roles");
        vm = defineModelForNewRole(vm);

        $('#myModal').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    }

    // used to save a new role
    function saveNewRole(vm)
    {        
        var isValid = validateInputs(vm);
        //alert(isValid + " save new role " + vm.roleName + " " + vm.roleDesc + vm.userCount);
        if (isValid)
        {
            //vm.httpService({
            //    method: "get",
            //    headers: { 'Content-Type': 'application/json' },
            //    url: ('https://localhost:44302/api/role'),
            //}).success(function (data) {
            //    roles = data;
            //    drawHelper(roles);
            //}
            //).error(function (data) {
            //    alert('error - web service access')     // display error message            
            //});
        }
    }

    // used to get available role info and used to create the roles grid
    function drawRoleGrid(vm)
    {
        var roles = null;
        vm.httpService({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/role'),
        }).success(function (data) {            
            roles = data;            
            drawHelper(roles);
        }
        ).error(function (data) {            
            alert('error - web service access')     // display error message            
        });
    }

    // used to draw roles grid
    function drawHelper(roles)
    {        
        $('#rolesGrid').dataTable({
            "data": roles,
            "aoColumns": [
                    { "mData": "id", "sTitle": "Role GUID", "bVisible": false },
                    { "mData": "name", "sTitle": "Role Name", "bVisible": true },
                    { "mData": "description", "sTitle": "Description", "bVisible": true },

                    {                        
                        "mData": "users", "sTitle": "User count", "sClass": "right", "mRender": function (data, type, row) {                            
                            if (data != null) {                                
                                return data.length;
                            }
                            else {
                                return 0;
                            }
                        },
                            "aTargets": [0]
                    },

                   
                    { "sTitle": "Edit", "defaultContent": "<button class='roleInfo'>Edit</button>" },
                    { "sTitle": "Delete", "defaultContent": "<button class='roleDelete'>Delete</button>" }
            ],
            "bDestroy": true,           
            "aLengthMenu": [[15, 50, 100, 200, 500, 700, 1000, -1], [15, 50, 100, 200, 500, 700, 1000, "All"]],
            "iDisplayLength": -1
        });

        // data table
        var table = $('#rolesGrid').DataTable();

        // on edit button clicks
        $('#rolesGrid tbody').on('click', 'button.roleInfo', function () {
            var data = table.row($(this).parents('tr')).data();
            alert("Edit Role : " + data.name);
        });

        // on delete button clicks
        $('#rolesGrid tbody').on('click', 'button.roleDelete', function () {
            var data = table.row($(this).parents('tr')).data();
            alert("Delete Role : " + data.name);
        });

    }

    // used to validate user inputs
    function validateInputs(vm)
    {
        var isValid = false;
        
        // role name validation
        if (isNotEmptyOrSpaces(vm.roleName)) {
            isValid = true;
            vm.roleNameClass = "";
            vm.errorMessage = "";
        }
        else {
            isValid = false;
            vm.roleNameClass = "errorBorder";
            vm.errorMessage = "Error - Please insert description";
            
        }

        // role description validation
        if (isValid) {
            if (isNotEmptyOrSpaces(vm.roleDesc)) {
                isValid = true;
                vm.roleDescClass = "";
                vm.errorMessage = "";
            }
            else {
                isValid = false;
                vm.roleDescClass = "errorBorder";
                vm.errorMessage = "Error - Please insert description";
            }
        }

        return isValid;
    }

}());