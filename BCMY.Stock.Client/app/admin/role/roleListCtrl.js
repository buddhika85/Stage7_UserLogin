(function () {

    "use strict";
    var module = angular.module("stockManagement");         // get module
    module.controller("RoleListCtrl", ["$http", "blockUI", "$scope", "loginValidatorService", roleListCtrl]);    // attach controller to the module


    function roleListCtrl($http, blockUI, $scope, loginValidatorService)                   // controller funcion
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
        vm.userCountDisabled = true;            // number of users for the role
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
        vm.saveRole = function () {
            saveRole(vm);
        };
    }

    // used to insert new roles
    function insertRole(vm)
    {
        //alert("Insert roles");
        
        vm = defineModelForNewRole(vm);
        vm.scope.$evalAsync(); //$apply();

        $('#myModal').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    }

    // used to save a new role
    function saveRole(vm)
    {        
        var isValid = validateInputs(vm);
        //alert(isValid + " save new role " + vm.roleName + " " + vm.roleDesc + vm.userCount);        
        if (isValid)
        {
            var dataForBody = "roleName=" + vm.roleName + "&desc=" + vm.roleDesc;
            var serverUrl = null;
            // check for insert or update/edit
            if (vm.popupTitle.indexOf('Edit') > -1) {
                serverUrl = ('https://localhost:44302/api/EditRoleAsync?' + dataForBody);
            }
            else {
                serverUrl = ('https://localhost:44302/api/CreateRoleAsync?' + dataForBody);                
            }
            
            // service call
            performInsertEditServiceCall(vm, serverUrl);
        }
    }

    // used to perform either insert, edit or delete service call to the http service
    function performInsertEditServiceCall(vm, serverUrl)
    {
        vm.httpService({
            method: "post",
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage["access_token"] },
            url: serverUrl
        }).success(function (data) {

            if (data.indexOf('Success') > -1) {

                // refersh the grid to display the updated record
                //var table = $('#rolesGrid').DataTable();
                //table.destroy();
                drawRoleGrid(vm);                
                toastr.success(data);
                $('#myModal').modal('hide');
            }
            else {
                vm.errorMessage = data;     // display error message
                toastr.warning(data);
            }
        }
        ).error(function (data) {
            vm.errorMessage = data;     // display error message
            toastr.error(data);
        });
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
            drawHelper(roles, vm);
        }
        ).error(function (data) {            
            alert('error - web service access')     // display error message            
        });
    }

    // used to draw roles grid
    function drawHelper(roles, vm)
    {
        $('#rolesGrid').html("");                           
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

                   
                    { "sTitle": "Edit", "defaultContent": "<button class='roleInfo'><span class='glyphicon glyphicon-edit'></span></button>" },
                    { "sTitle": "Delete", "defaultContent": "<button class='roleDelete'><span class='glyphicon glyphicon-remove'></span></button>" }
            ],
            "bDestroy": true,           
            "aLengthMenu": [[15, 50, 100, 200, 500, 700, 1000, -1], [15, 50, 100, 200, 500, 700, 1000, "All"]],
            "iDisplayLength": -1
        });           

        var table = $('#rolesGrid').DataTable();

        // on edit button clicks
        $('#rolesGrid tbody').on('click', 'button.roleInfo', function () {
            //var table = $('#rolesGrid').DataTable();
            var data = table.row($(this).parents('tr')).data();           
            editRole(vm, data);
        });

        // on delete button clicks
        $('#rolesGrid tbody').on('click', 'button.roleDelete', function () {            
            //var table = $('#rolesGrid').DataTable();
            var data = table.row($(this).parents('tr')).data();
            deleteRole(vm, data);
        });

    }

    // used to edit a role
    function editRole(vm, record)
    {
        //alert("Edit Role : " + record.name);
        
        vm = defineModelForEditRole(vm, record);
        vm.scope.$evalAsync(); //$apply();

        $('#myModal').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    }

    // used to edit a role
    function deleteRole(vm, record)
    {        
        //alert("Delete Role : " + record.name + " " + record.users.length);        
        // check whether the role has existing users
        if (record.users.length == 0) {
            bootbox.dialog({
                message: "Are you sure that you want to delete role " + record.name + " ?",
                title: "Confirm Role Deletion",
                buttons: {                    
                    main: {
                        label: "Yes",
                        className: "btn-primary",
                        callback: function () {
                            var dataForBody = "roleName=" + record.name;
                            var serverUrl = ('https://localhost:44302/api/DeleteRoleAsync?' + dataForBody);
                            vm.httpService({
                                method: "post",
                                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage["access_token"] },
                                url: serverUrl
                            }).success(function (data) {

                                if (data.indexOf('Success') > -1) {

                                    // refersh the grid to display the updated record
                                    //var table = $('#rolesGrid').DataTable();
                                    //table.destroy();
                                    drawRoleGrid(vm);                                    
                                    toastr.success(data);
                                }
                                else {
                                    vm.errorMessage = data;     // display error message
                                    toastr.warning(data);
                                }
                            }
                            ).error(function (data) {
                                vm.errorMessage = data;     // display error message
                                toastr.error(data);
                            });
                        }
                    },
                    danger: {
                        label: "No",
                        className: "btn-danger",
                        callback: function () {
                            toastr.warning("Role not deleted");
                        }
                    }
                }
            });
        }
        else {
            bootbox.dialog({
                message: "Role not deleted as the role is assigned to " + record.users.length + " users",
                title: "Role cannot be deleted",
                buttons: {
                    main: {
                        label: "OK",
                        className: "btn-primary",
                        callback: function () {
                            toastr.warning("Role not deleted as the role is assigned to " + record.users.length + " users");
                        }
                    }
                }
            });
        }
    }

    // used to initiate initial popup attributes of the model object
    function defineModelForEditRole(vm, record) {
        vm.popupTitle = "Edit Role - " + record.name;
        vm.roleName = record.name;
        vm.roleDesc = record.description;
        vm.userCount = record.users.length;
        vm.userCountDisabled = true;            // number of users for the role
        vm.errorMessage = "";

        return vm;
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
            vm.errorMessage = "Error - Please insert unique role name";
            
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