(function () {
    "use strict";
    var module = angular.module("stockManagement");         // get module
    module.controller("ExcelUploadCtrl", ["$http", "blockUI", "loginValidatorService", excelUploadCtrl]);    // attach controller to the module


    function excelUploadCtrl($http, blockUI, loginValidatorService)                   // controller funcion
    {
        var vm = this;
        if (loginValidatorService.loginValidator()) {
            EnableTopNavigationBar();
            $("#loggedInUserWithTime").text(localStorage["userName"]);
            alert("Inside excel controller");
            vm = defineModel(vm, $http, blockUI);
            //prepareInitialUI(vm);
            wireCommands(vm);
        }
        else {
            localStorage["userName"] = null;
            window.location = window.location.protocol + "//" + window.location.host + "/#/login";
            window.location.reload();
        }        
    }


    // used to define and assign initial values to the model properties
    function defineModel(vm, httpService, blockUI) {
        vm.title = "Excel uploader - Under construction";
        //vm.httpService = httpService;                 // http service
        //vm.blockUI = blockUI;
        //vm.productId = "";
        //vm.categoryName = "";
        //vm.conditionName = "";
        //vm.brandName = "";
        //vm.modelName = "";
        //vm.counted = "";
        //vm.stockCount = "";
        //vm.tableRecords = null;

        //vm.productListId = null;
        return vm;
    }


    // binding commands to buttons
    function wireCommands(vm) {
        vm.uploadExcel = function () {
            uploadExcel();
        };
    }


    // upload excel files
    // ref - http://stackoverflow.com/questions/18571001/file-upload-using-angularjs
    function uploadExcel() {
        debugger
        var file = document.getElementById('file').files[0],
            r = new FileReader();

        alert(file);

        r.onloadend = function (e) {
            var data = e.target.result;
            //send you binary data via $http or $resource or do anything else with it
        }
        r.readAsBinaryString(file);
    }
}());