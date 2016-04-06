
(function () {
    "use strict";
    var module = angular.module("stockManagement");         // get module
    module.controller("AmendStockCtrl", ["$http", "blockUI", "loginValidatorService", amendStockCtrl]);    // attach controller to the module


    function amendStockCtrl($http, blockUI, loginValidatorService)                   // controller funcion
    {        
        var vm = this;
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

    // used to define and assign initial values to the model properties
    function defineModel(vm, httpService, blockUI)
    {
        vm.title = "Amend product stock counts";
        vm.httpService = httpService;                 // http service
        vm.blockUI = blockUI;
        vm.productId = "";
        vm.categoryName = "";
        vm.conditionName = "";
        vm.brandName = "";
        vm.modelName = "";
        vm.counted = "";
        vm.stockCount = "";
        vm.tableRecords = null;
        
        vm.productListId = null;
        return vm;
    }

    // used to initialise the UI at the intial view load
    function prepareInitialUI(vm)
    {
        vm.blockUI.start();
        RemoveOutlineBorders($('#selectCategory'));
        $('#countedSpan').html('');
        drawProductsGrid(vm);
        populateCategoryDropDown(vm);
        vm.blockUI.stop();
    }

    // used to populate the product category drop down menu
    function populateCategoryDropDown(vm) {
        vm.httpService({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/productinfo/getcategories?getcategories=true'),
        }).success(function (data) {
            var listitems = '<option value=-1 selected="selected">---- Select Category ----</option>';
            $.each(data, function (index, item) {
                listitems += '<option value=' + item.productCategoryID + '>' + item.productCatergoryName + '</option>';
            });
            $("#selectCategory option").remove();
            $("#selectCategory").append(listitems);
        }
        ).error(function (data) {
            // display error message
            alert('error - web service access')
        });
    }

    // binding commands to buttons
    function wireCommands(vm) {

        // on product category selection change
        $('#selectCategory').change(function () {
            onCategorySelection(vm, $('#selectCategory'));
        });

        // on product condition selection change
        $('#selectCondition').change(function () {
            onConditionSelection(vm, $('#selectCondition'));
        });

        // on product brand selection change
        $('#selectBrand').change(function () {
            onBrandSelection(vm, $('#selectBrand'));
        });

        vm.amendStock = function () {
            if (validateSelections()) {
                DisplayErrorMessage('', $('#lblErrorMessage'));
                amendStockCount(vm, null);
            };
        };

        vm.resetSearch = function () {
            ResetSearchDDLs();
        };

        vm.saveStockAmendment = function () {
            vm.blockUI.start();            
            if (vm.stockCount != null && $.trim(vm.stockCount) != '') {
                saveStockAmendment(vm);
            }
            else {
                ApplyErrorBorder($('#stockCount'));
                DisplayErrorMessage('Error : You should provide a stock count', $('#lblErrorMessagePopup')); 
            }
            vm.blockUI.stop();
        }
    }

    // used to save stock amendments
    function saveStockAmendment(vm)
    {        
        //alert('save amended stock : ' + vm.productListId + ' ' + vm.stockCount);
        var serverUrl = 'https://localhost:44302/api/ProductInfo?productId=' + vm.productListId + '&quantity=' + vm.stockCount;
        vm.httpService({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: serverUrl,
        }).success(function (data) {
            //debugger
            if (data == true) {                
                //drawProductsGrid(vm); // refersh grid
                updateRecordInGrid(vm);
                vm.counted = '<span style="background-color:green; text-align:center; padding-left:2%; padding-right: 2%">  Yes  </span>'; // update popup and show
                $('#countedSpan').html(vm.counted);
                DisplayErrorMessage('Stock count update successful', $('#lblErrorMessagePopup'));
            }
            else {
                DisplayErrorMessage('Error - Stock count update failed - contact IT support', $('#lblErrorMessagePopup'));
            }                
        }
        ).error(function (data) {
            // display error message
            DisplayErrorMessage('Error - Stock count update failed - contact IT support', $('#lblErrorMessagePopup'));
        });
    }

    // used to update a single record in grid
    function updateRecordInGrid(vm)
    {
        
        for (var i = 0; i <= vm.tableRecords.length; i++) {            
            if (vm.tableRecords[i] != null)
            {
                if (vm.tableRecords[i].productlistId != null && vm.tableRecords[i].productlistId == vm.productListId) {
                    //alert("update " + vm.productListId + " to " + vm.stockCount);
                    vm.tableRecords[i].stockCount = vm.stockCount;
                    vm.tableRecords[i].stockAmended = 'yes';
                    //debugger;
                    vm.tableRecords[i].lastAmendedTimeValue = new Date().toLocaleString();
                    break;
                }
            }           
        }
        DestroyTable(); // destroy
        drawHelper(vm); // recreate the table
       
    }

    // used to validate product info selections
    function validateSelections()
    {
        var isValid = false;
                        
        isValid = validateDDLsOnProductSearch($('#selectCategory'), 'product category');
        isValid = isValid == true ? validateDDLsOnProductSearch($('#selectCondition'), 'product condition') : isValid;
        isValid = isValid == true ? validateDDLsOnProductSearch($('#selectBrand'), 'brand') : isValid;
        isValid = isValid == true ? validateDDLsOnProductSearch($('#selectModel'), 'model') : isValid;
        
        return isValid;
    }

    // a helper to validate DDLs and display error messages
    function validateDDLsOnProductSearch(ddl, ddlName)
    {
        var isValid = false;
        if (isValidDropDownListSelection(ddl)) {
            RemoveOutlineBorders(ddl);
            isValid = true;
        }
        else {
            isValid = false;
            DisplayErrorMessage(('Error : You should select a ' + ddlName), $('#lblErrorMessage'));
            ApplyErrorBorder(ddl);
        }
        return isValid;
    }

    // used to amend the stock counts
    function amendStockCount(vm, productlistId)
    {       
        var modelId = null;
        // seperate grid click or DDL selection
        if (productlistId == null) {
            modelId = $('#selectModel').val(); // not a grid click, its a DDL selection
        }
        else {
            modelId = productlistId;
        }
            
        var searchResult = null;
        var serverUrl = 'https://localhost:44302/api/ProductInfo?productlistId=' + modelId;
        vm.httpService({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: serverUrl
        }).success(function (data) {
            
            searchResult = data;
            //alert("searched : " + searchResult.model);
            vm.productListId = data.productlistId;
            vm.categoryName = data.productCatergoryName;
            vm.conditionName = data.conditionName;
            vm.brandName = data.productbrandname;
            vm.modelName = data.model;
            //debugger
            vm.counted = data.stockAmended == 'yes' ? '<span style="background-color:green; text-align:center; padding-left:2%; padding-right: 2%">  Yes  </span>' : 
                '<span style="background-color:darkorange; text-align:center; padding-left:2%; padding-right: 2%">  No  </span>';
            //vm.counted = $sce.trustAsHtml(vm.counted);
            $('#countedSpan').html(vm.counted);
            vm.stockCount = data.stockCount;
            RemoveOutlineBorders($('#stockCount'));
            DisplayErrorMessage('', $('#lblErrorMessagePopup'));

            $('#myModal').modal({
                show: true,
                keyboard: true,
                backdrop: true
            });
        }
        ).error(function (data) {
            // display error message
            alert('error - web service access - product search - please contact IT helpdesk');
            DisplayErrorMessage('error - web service access - product search - please contact IT helpdesk', $('#lblErrorMessage'))
        });
    }

    //used to get json object consisting of search paramters 
    function getSearchParamsJsonObject(categoryId, conditionId, brandIds, modelIds) {
        var searchParamsJson = {
            "categoryId": categoryId,
            "conditionId": conditionId,
            "brandIds": brandIds,
            "modelIds": modelIds
        };

        return searchParamsJson;
    }

    // used to draw products grid with the stock count
    function drawProductsGrid(vm) {
        
        vm.httpService({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/productinfo?withAmendData=true'),
        }).success(function (data) {            
            vm.tableRecords = data;
            //debugger
            drawHelper(vm);
        }
        ).error(function (data) {
            // display error message
            alert('error - web service access')
        });
    }

    // a helper method to draw the grid
    function drawHelper(vm) {
        $('#productsGrid').dataTable({
            "data": vm.tableRecords,
            "aoColumns": [
                    { "mData": "productlistId", "sTitle": "Product list Id", "bVisible": true },
                    { "mData": "productcategory", "sTitle": "Category ID", "bVisible": false },
                    { "mData": "productCatergoryName", "sTitle": "Category" },
                    { "mData": "productcondition", "sTitle": "Condition ID", "bVisible": false },
                    { "mData": "conditionName", "sTitle": "Condition" },
                    { "mData": "productbrandid", "sTitle": "Brand ID", "bVisible": false },
                    { "mData": "productbrandname", "sTitle": "Brand" },
                    { "mData": "model", "sTitle": "Model" },
                    { "mData": "marketvalueGBP", "sTitle": "Market value &#163", "bVisible": false },
                    { "mData": "stockCount", "sTitle": "Stock count" },
                    //{ "mData": "lastAmendedDateValue", "sTitle": "Last amended date" },
                    { "mData": "lastAmendedTimeValue", "sTitle": "Last amended time" },
                    //{ "mData": "lastIncrementDateValue", "sTitle": "Last increment date" },
                    { "mData": "lastIncrementTimeValue", "sTitle": "Last increment time" },
                    {
                        "mData": "stockAmended", "sTitle": "Counted?", "sClass": "right", "mRender": function (data, type, row) {
                            if (data == null || data == 'no') {
                                return '<div style="background-color:darkorange; text-align:center">No</div> ';
                            }
                            else {
                                return '<div style="background-color:green; text-align:center">Yes</div> ';
                            }
                        },
                        "aTargets": [0]
                    },
                    { "sTitle": "Amend count", "defaultContent": "<button class='productInfo'>Amend</button>" }
            ],
            "bDestroy": true,
            //"aLengthMenu": [[15, 50, 100, 200, -1], [15, 50, 100, 200, "All"]],
            "aLengthMenu": [[15, 50, 100, 200, 500, 700, 1000, -1], [15, 50, 100, 200, 500, 700, 1000, "All"]],
            "iDisplayLength": 15
        });

        // data table
        var table = $('#productsGrid').DataTable();

        // on info button clicks
        $('#productsGrid tbody').on('click', 'button.productInfo', function () {
            var data = table.row($(this).parents('tr')).data();
            //alert("View Info : " + data.productlistId + " - " + data.model);     
            amendStockCount(vm, data.productlistId);
        });
    }

    // Destroy the product data grid
    function DestroyTable() {
        if ($.fn.DataTable.isDataTable('#productsGrid')) {
            $('#productsGrid').DataTable().destroy();
            $('#productsGrid').empty();
        }
    }

    // on product category ddl is changed
    function onCategorySelection(vm, ddl) {
        //alert('category changed : ' + ddl.val());
        var selectedCategory = ddl.val();
        var listitems = '<option value=-1 selected="selected">---- Select Condition ----</option>';
        if (selectedCategory != -1) {
            // remove errors
            RemoveOutlineBorders($('#selectCategory'));
            DisplayErrorMessage('', $('#lblErrorMessage'));

            // populate dependant DDL - condition
            vm.httpService({
                method: "get",
                headers: { 'Content-Type': 'application/json' },
                url: ('https://localhost:44302/api/productinfo/categoryId?categoryId=' + selectedCategory),
            }).success(function (data) {
                //alert(data.length);
                $.each(data, function (index, item) {
                    listitems += '<option value=' + item.conditionID + '>' + item.conditionName + '</option>';
                });
                $("#selectCondition option").remove();
                $("#selectCondition").append(listitems);
            }
            ).error(function (data) {
                // display error message
                alert('error - web service access - condition DDL population - please contact IT helpdesk');
                $("#selectCondition option").remove();
                $("#selectCondition").append(listitems);
            });
        }
        else {
            // remove prepopulated items in condition, brand and model            
            ResetDDL($("#selectCondition"), "Condition");
        }

        // remove prepopulated items brand and model  
        ResetDDL($("#selectModel"), "Model");
        ResetDDL($("#selectBrand"), "Brand");
    }

    // on product condition ddl is changed
    function onConditionSelection(vm, ddl) {
        //alert('condition changed');
        var selectedCondition = ddl.val();
        var selectedCategory = $('#selectCategory').val();
        var listitems = '<option value=-1 selected="selected">---- Select Brand ----</option>';
        var serverUrl = 'https://localhost:44302/api/ProductInfo?categoryId=' + selectedCategory + '&conditionId=' + selectedCondition;
        if (selectedCondition != -1 && selectedCategory != -1) {
            vm.httpService({
                method: "get",
                headers: { 'Content-Type': 'application/json' },
                url: serverUrl,
            }).success(function (data) {
                //alert(data.length);                
                $.each(data, function (index, item) {
                    listitems += '<option value=' + item.productbrandid + '>' + item.productbrandname + '</option>';
                });
                $("#selectBrand option").remove();
                $("#selectBrand").append(listitems);
            }
            ).error(function (data) {
                // display error message
                alert('error - web service access - brand DDL population - please contact IT helpdesk');
                $("#selectBrand option").remove();
                $("#selectBrand").append(listitems);
            });
        }
        else {
            // remove prepoluated items on model            
            ResetDDL($("#selectBrand"), "Brand");
        }

        // remove prepopulated items model
        ResetDDL($("#selectModel"), "Model");
    }

    // on product brand ddl is changed
    function onBrandSelection(vm, ddl) {
        var selectedCategory = $('#selectCategory').val();
        var selectedCondition = $("#selectCondition").val();
        var selectedBrands = ddl.val();
        //alert("brand changed " + selectedBrand);
        var listitems = '<option value=-1 selected="selected">---- Select Model ----</option>';
        var serverUrl = 'https://localhost:44302/api/ProductInfo?categoryId=' + selectedCategory + '&conditionId=' + selectedCondition + '&brandIdsCommaDelimited=' + selectedBrands;
        if (selectedBrands != -1 && selectedCondition != -1 && selectedCategory != -1) {
            vm.httpService({
                method: "get",
                headers: { 'Content-Type': 'application/json' },
                url: serverUrl,
            }).success(function (data) {
                //alert(data.length);
                $.each(data, function (index, item) {
                    listitems += '<option value=' + item.productListId + '>' + item.model + '</option>';
                });
                $("#selectModel option").remove();
                $("#selectModel").append(listitems);
            }
            ).error(function (data) {
                // display error message
                alert('error - web service access - model DDL population - please contact IT helpdesk');
                $("#selectModel option").remove();
                $("#selectModel").append(listitems);
            });
        }
        else {
            // remove prepoulated models
            ResetDDL($("#selectModel"), "Model");
        }
    }

    // used to reset search ddls
    function ResetSearchDDLs() {
        // reset main ddl
        var categoryDdl = $("#selectCategory");
        categoryDdl.val(-1);
        RemoveOutlineBorders(categoryDdl);
        DisplayErrorMessage('', $('#lblErrorMessage'));

        // reset other dependant ddls
        ResetDDL($("#selectModel"), "Model");
        ResetDDL($("#selectBrand"), "Brand");
        ResetDDL($("#selectCondition"), "Condition");
    }

    // Reset DDLs
    function ResetDDL(ddl, ddlName) {
        var listitems = '<option value=-1 selected="selected">---- Select' + ddlName + '----</option>';
        ddl.find('option').remove();
        ddl.append(listitems);
    }

    // used to remove error indicating outline borders
    function RemoveOutlineBorders(element) {
        element.removeClass("errorBorder");
    }
}());