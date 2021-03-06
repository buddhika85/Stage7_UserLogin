﻿// IIFE - to manage add/edit sales orders
(function () {
    "use strict";

    var module = angular.module("stockManagement");

    module.controller("AddEditSalesOrderCtrl",
        ["$http", "contactResource", "blockUI", "customerSupplierResource", "currencyResource", "loginValidatorService", addEditSalesOrderCtrl]);

    // controller
    function addEditSalesOrderCtrl($http, contactResource, blockUI, customerSupplierResource, currencyResource, loginValidatorService)
    {
        var vm = this;
        if (loginValidatorService.loginValidator()) {
            EnableTopNavigationBar();
            $("#loggedInUserWithTime").text(localStorage["userName"]);
            vm.title = "Add Sales Order";
            vm.totalValue = "Total : £ 0.00";
            prepareInitialUI($http, customerSupplierResource, contactResource, currencyResource, vm);        // initial UI

            wireCommands(vm, $http, contactResource, customerSupplierResource);
        }
        else {
            localStorage["userName"] = null;
            window.location = window.location.protocol + "//" + window.location.host + "/#/login";
            window.location.reload();
        }
        
    };

    // used to bind drop down list selection change commands for cascading ddls
    function wireCommands(vm, $http, contactResource, customerSupplierResource)
    {
        // BindDDLSelectionChangeCommands
        // on a company selection        
        $('#selectCustSupp').change(function () {
            onCompanyDDLSelection($http, contactResource, customerSupplierResource);
        });

        // on a contact name selection        
        $('#selectContact').change(function () {
            onContactDDLSelection($http, customerSupplierResource, contactResource);
        });

        // on product category selection change
        $('#selectCategory').change(function () {
            onCategorySelection($http, $('#selectCategory'));
        });

        // on product condition selection change
        $('#selectCondition').change(function () {
            onConditionSelection($http, $('#selectCondition'));
        });

        // on product brand selection change
        $('#selectBrand').change(function () {            
            onBrandSelection($http, $('#selectBrand'));
        });
        
        // on create order button click
        vm.createOrder = function () {            
            var isValid = ValidateCustContactSelections();
            //alert("validate customer and compnay selection then create a new order record in the database : " + isValid);
            if (isValid) {
                CreateAnOrder($http);
            }
        }

        // on search products button click
        vm.searchProducts = function () {
            DestroyTable();
            $('#productsGridDiv').removeClass('is-hidden');
            SearchProducts($http);
        }
        // on reset search button click        
        vm.resetSearch = function () {
            ResetSearchDDLs();
        }

        // collapse product search grid
        $('#productPanelHeading').click(function () {
            $('#productsGridDiv').toggleClass('is-hidden');
        });

        // collapse buyer seller selection panel
        $('#customerHeaderPanel').click(function () {
            $('#customerSection').toggleClass('is-hidden');
        });

        // collapse product search panel
        $('#productSearchPanelHeading').click(function () {
            $('#productSerahcForm').toggleClass('is-hidden');
        });

        // collpase order details panel
        $('#orderDetailsPanelHeading').click(function () {
            $('#orderlinesSection').toggleClass('is-hidden');
        });

        // save a negotiation
        vm.recordNegotiation = function () {
            //alert("record negotation");
            RecordNegotiation($http);
        };

        // insert an orderline
        vm.addOrderline = function () {
            //alert("add orderline");
            InsertOrderLine($http, vm);
        };

        // quantity input change
        $('#quantityInput').change(function () {
            calculateTotalIncome();            
        });

        // on price offered input change
        $('#priceInput').change(function () {
            calculateTotalIncome();
        });

        // on download order report button click
        vm.downloadOrderReport = function () {
            alert("Download order report - under construction");
        }

        // on confirm order button click
        vm.confirmOrder = function () {
            //alert("On confirm order button click -
            //make sure all orderlines are in confirmed status - update order record - reduce stock count");
            confirmOrder($http);
        }

        // reloads the same page with no scope variable data
        vm.ReloadPage = function () {
            ReloadCurrentPage();            // from Util JS file
        };

        // perform default VAT selections on currency selections
        $('#selectCurrency').click(function () {
            PerformDefaultVatSelections();
        });

        // batch orderline confirm
        vm.performBacthOrderlineConfirm = function () {
            performBacthOrderlineConfirm($http, vm);
        };
    }

    // used to perform default VAT selections
    // if GBP --> yes or Else --> no
    function PerformDefaultVatSelections() {
        var currIndex = $('#selectCurrency').val();
        var currText = $('#selectCurrency option:selected').text();        
        if (currIndex === "1" && currText === 'GBP') {
            $('#selectVAT').val('YES');
        }
        else {
            $('#selectVAT').val('NO');
        }
    }

    // used to manage confirmation of batch of orderlines 
    // Ref - uses http://bootboxjs.com/examples.html
    function manageBatchOrderLineConfirm() {
        $('#modalBatchConfirm').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    }

    // performing the batch confirm of all the orderlines in an order
    function performBacthOrderlineConfirm($http, vm) {
        $('#modalBatchConfirm').modal('hide');      // hide alert
        //debugger
        // pick orderId from hidden field
        var orderId = $('#orderId').val();
        //alert("perform the bacth confirm : " + orderId);

        // perform the batch confirm -  confirm the order
        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/OrderLine?orderId=' + orderId)
        })
        .success(function (data) {
            if (data == 'Success - Order confirmation successful - with all orderlines') {
                // refersh the orderline grid
                $http({
                    method: "get",
                    headers: { 'Content-Type': 'application/json' },
                    url: ('https://localhost:44302/api/Orderline?orderIdVal=' + orderId),
                }).success(function (dataOL) {
                    // redraw orderline grid and disable edit orderline and complete order buttons
                    DrawOrderlineGrid(dataOL, $http, vm);
                    DisableUIAfterConfirm();
                    // display message about confirming order
                    DisplayErrorMessage(data, $('#lblErrorOrderLineMessage'));
                }
                ).error(function (dataOL) {
                    // display error message
                    alert('error - web service access')
                })
            }
        }).error(function (data) {
            // display error message
            DisplayErrorMessage('Error - Order confirmation unsuccessful - error accessing web service', $('#lblErrorOrderLineMessage'));
        });
    }

    // used to confirm an order
    function confirmOrder($http) {

        DisplayErrorMessage('', $('#lblErrorOrderLineMessage'));                            // clean errors

        // check for row count in the table - header raw and empty raw makes 2
        if ($('#orderGrid tr:eq(1) > td:eq(0)').text() != 'No data available in table') //if ($('#orderGrid tr').length > 2)
        {
            // check for orderline statuses - if all confimed - pass to server side
            //debugger;
            var allConfimed = ValidateForOrderLineStatus();
            if (!allConfimed) {
                //DisplayErrorMessage('Warning - make sure that all the orderlines are confirmed before confirming the particular order', $('#lblErrorOrderLineMessage'));
                // manage batch confirm
                manageBatchOrderLineConfirm();
            }
            else {
                //alert('pass to server side - confirm');
                var orderId = $('#orderId').val();
                $http({
                    method: "get",
                    headers: { 'Content-Type': 'application/json' },
                    url: ('https://localhost:44302/api/Order?orderId=' + orderId)
                })
                .success(function (data) {
                    if (data == 'Success - Order confirmation successful')
                    {
                        DisableUIAfterConfirm();
                    }
                    DisplayErrorMessage(data, $('#lblErrorOrderLineMessage'));                    
                }).error(function (data) {
                    // display error message
                    DisplayErrorMessage('Error - Order confirmation unsuccessful - error accessing web service', $('#lblErrorOrderLineMessage'));
                });
            }
        }
        else {
            DisplayErrorMessage('Warning - please add atleast one orderline before confirming the order', $('#lblErrorOrderLineMessage'));
        }
    }

    // used to disable UI controls after confirming an order
    function DisableUIAfterConfirm()
    {
        $('#btnConfirmOdr').attr("disabled", true);     // disable confirm oreder button
        DisableEditBtnsInOrderGrid();
        
        // disable product search form sections
        EnableDisableProductSearchForm(true);

        // remove previouse product searches
        DestroyTable();     // clear out search results        
    }       

    // used to disable all the edit buttons in the orderline grid
    function DisableEditBtnsInOrderGrid()
    {
        $(".businessEdit").attr("disabled", true);
    }       
    
    // check for orderline statuses - if all confimed - return true
    function ValidateForOrderLineStatus() {

        var allConfimed = true;

        // get orderline data table
        var table = $('#orderGrid').DataTable();                
        table.column(10).data().each(function (value, index) {       // column 10 is status - o based columns in JS datatable
            //alert('Data in index: ' + index + ' is: ' + value);
            if (value == 'in negotiation') {
                allConfimed = false;
            }
        }); 
        return allConfimed;
    }

    // used to calculate and display the total income on quantity or price offered inputs changed
    function calculateTotalIncome() {
        $('#totalIncomeLbl').html("Total Value (" +
            getCurrencyHtmlEntityValue($('#selectCurrency option:selected').text().toUpperCase()) + ") = ");
        try
        {
            var quantity = $('#quantityInput').val();
            var pricePerItem = RoundUpTo($('#priceInput').val(), 2);
            quantity = parseInt(quantity, 10);
            pricePerItem = parseFloat(pricePerItem);
            var total = quantity * pricePerItem;
            total = RoundUpTo(total, 2);
            if (!isNaN(total))
                $('#totalIncome').text(total);
            else
                throw 'not a number';
        }
        catch(error)
        {
            $('#totalIncome').text('0.0');
        }
    }


    // create order record
    function CreateAnOrder($http) {

        // create the order
        var companyId = $('#selectCustSupp').val();
        var contactFulName = $("#selectContact").val();
        var vat = $('#selectVAT').val();
        var currency = $('#selectCurrency').val();
        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/SalesOrder?companyId=' + companyId + '&contactFulName=' + contactFulName + 
                '&vat=' + vat + '&currency=' + currency)
        })
        .success(function (data) {
            if (data != -999) {                
                // store the returned order Id in the hidden field
                $('#orderId').val(data);
                $('#lblErrorMessageCrtOrdr').removeClass("errorLabel");
                $('#lblErrorMessageCrtOrdr').addClass("successLabel");
                $('#lblErrorMessageCrtOrdr').text("Order creation successful, Please do a product search and add the order lines");

                // display the orderlines grid

                // disable buyer/seller selections, enable product search form
                EnableDisableBuyerSellerFeilds(true);
                EnableDisableProductSearchForm(false);
            }
            else {
                DisplayErrorMessage('Error - Order creation Unsuccessful', $('#lblErrorMessageCrtOrdr'));
            }
        }).error(function (data) {
            // display error message
            DisplayErrorMessage('Error - Order creation Unsuccessful', $('#lblErrorMessageCrtOrdr'));
        });
    }

    // Used to enable/disable buyer/seller form fields
    function EnableDisableBuyerSellerFeilds(isDisabled) {
        $('#selectCustSupp').attr("disabled", isDisabled);
        $('#selectContact').attr("disabled", isDisabled);
        $('#selectVAT').attr("disabled", isDisabled);
        $('#selectCurrency').attr("disabled", isDisabled);

        $('#addContactBtn').attr("disabled", isDisabled);
        $('#createOrdrBtn').attr("disabled", isDisabled);
    }

    // Used to enable/disable negoation related buttons
    function EnableDisableNegotiationButtons(isDisabled) {
        $('#btnAddNegotion').attr("disabled", isDisabled);
        $('#btnAddOrderline').attr("disabled", isDisabled);
        $('#quantityInput').attr("disabled", isDisabled);
        $('#priceInput').attr("disabled", isDisabled);
        $('#statusSelect').attr("disabled", isDisabled);
    }

    // Used to enable/disable product search form fields
    function EnableDisableProductSearchForm(isDisabled) {
        $('#selectCategory').attr("disabled", isDisabled);
        $('#selectCondition').attr("disabled", isDisabled);
        $('#selectBrand').attr("disabled", isDisabled);
        $('#selectModel').attr("disabled", isDisabled);
        $('#btnSearchProducts').attr("disabled", isDisabled);
        $('#resetBtn').attr("disabled", isDisabled);
    }

    // used to validate customer/contact ddl selections
    function ValidateCustContactSelections() {

        var isValid = false;
        var customerDdl = $("#selectCustSupp");

        if (isValidDropDownListSelection(customerDdl)) {

            RemoveOutlineBorders(customerDdl);
            isValid = true;
            var contactDdl = $("#selectContact");

            if (isValidDropDownListSelection(contactDdl)) {
                DisplayErrorMessage('', $('#lblErrorMessageCrtOrdr'));
                RemoveOutlineBorders(contactDdl);
                isValid = true;
            }
            else {
                DisplayErrorMessage('Error : Please select contact person to create an order', $('#lblErrorMessageCrtOrdr'));
                ApplyErrorBorder(contactDdl);
                isValid = false;
            }
        }
        else {
            DisplayErrorMessage('Error : Please select customer company to create an order', $('#lblErrorMessageCrtOrdr'));
            ApplyErrorBorder(customerDdl);
            isValid = false;
        }
        return isValid;
    }

    // Destroy the product data grid
    function DestroyTable() {
        if ($.fn.DataTable.isDataTable('#productsGrid')) {
            $('#productsGrid').DataTable().destroy();
            $('#productsGrid').empty();
        }
    }

    // on product category ddl is changed
    function onCategorySelection($http, ddl)
    {
        //alert('category changed : ' + ddl.val());
        var selectedCategory = ddl.val();
        var listitems = '<option value=-1 selected="selected">---- Select Condition ----</option>';
        if (selectedCategory != -1) {
            // remove errors
            RemoveOutlineBorders($('#selectCategory'));
            DisplayErrorMessage('', $('#lblErrorMessage'));

            // populate dependant DDL - condition
            $http({
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
    function onConditionSelection($http, ddl)
    {
        //alert('condition changed');
        var selectedCondition = ddl.val();
        var selectedCategory = $('#selectCategory').val();
        var listitems = '<option value=-1 selected="selected">---- Select Brand ----</option>';
        var serverUrl = 'https://localhost:44302/api/ProductInfo?categoryId=' + selectedCategory + '&conditionId=' + selectedCondition;
        if (selectedCondition != -1 && selectedCategory != -1) {
            $http({
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
    function onBrandSelection($http, ddl)
    {
        var selectedCategory = $('#selectCategory').val();
        var selectedCondition = $("#selectCondition").val();
        var selectedBrands = ddl.val();
        //alert("brand changed " + selectedBrand);
        var listitems = '<option value=-1 selected="selected">---- Select Model ----</option>';
        var serverUrl = 'https://localhost:44302/api/ProductInfo?categoryId=' + selectedCategory + '&conditionId=' + selectedCondition + '&brandIdsCommaDelimited=' + selectedBrands;
        if (selectedBrands != -1 && selectedCondition != -1 && selectedCategory != -1) {
            $http({
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
    function ResetDDL(ddl, ddlName)
    {        
        var listitems = '<option value=-1 selected="selected">---- Select' + ddlName + '----</option>';
        ddl.find('option').remove();
        ddl.append(listitems);
    }

    // on a company selection - populate contacts DDL by company id
    function onCompanyDDLSelection($http, contactResource, customerSupplierResource)
    {        
        //alert('on company selection - ' + $("#selectCustSupp").val());
        var selectedValue = $("#selectCustSupp").val();
        var selectedFulName = $("#selectContact").val();
        if (selectedValue != -1) {
            // repopulate the contact DDL based on company selection
            $http({
                method: "get",
                headers: { 'Content-Type': 'application/json' },
                url: ('https://localhost:44302/api/Contact?customerSupplierId=' + selectedValue),
            }).success(function (data) {
                var listitems = '<option value=-1 selected="selected">---- Select Contact ----</option>';
                $.each(data, function (index, item) {
                    var firstName = cleanSpaces(item.firstName);
                    var lastName = cleanSpaces(item.lastName);
                    var fulName = (firstName + '_' + lastName);
                    if (selectedFulName == fulName)
                    {
                        listitems += '<option value=' + fulName + ' selected>' + (item.firstName + ' ' + item.lastName) + '</option>';
                    }
                    else
                    {
                        listitems += '<option value=' + fulName + '>' + (item.firstName + ' ' + item.lastName) + '</option>';
                    }                    
                });
                $("#selectContact option").remove();
                $("#selectContact").append(listitems);
            }
            ).error(function (data) {
                // display error message
                alert('error - web service access')
            });
        }
        else {
            populateContactDropDown(contactResource);
            populateCompanyDropDown(customerSupplierResource);
        }
    }

    // on a contact name selection - populate company DDL with contact full name
    function onContactDDLSelection($http, customerSupplierResource, contactResource)
    {        
        //alert('on contact selection - ' + $("#selectContact").val());   
        var selectedCompany = $("#selectCustSupp").val();
        var selectedFulName = $("#selectContact").val();
        if (selectedFulName != -1) {
            // repopulate the contact DDL based on company selection
            $http({
                method: "get",
                headers: { 'Content-Type': 'application/json' },
                url: ('https://localhost:44302/api/customerSupplier?contactFulName=' + selectedFulName),
            }).success(function (data) {                            
                var listitems = '<option value=-1 selected="selected">---- Select Customer ----</option>';
                $.each(data, function (index, item) {                    
                    if (selectedCompany == item.id)
                    {
                        listitems += '<option value=' + item.id + ' selected>' + item.name + '</option>';
                    }
                    else
                    {
                        listitems += '<option value=' + item.id + '>' + item.name + '</option>';
                    }
                });                    
                $("#selectCustSupp option").remove();
                $("#selectCustSupp").append(listitems);                
            }
            ).error(function (data) {
                // display error message
                alert('error - web service access')
            });
        }
        else {
            populateCompanyDropDown(customerSupplierResource);
            populateContactDropDown(contactResource);
        }
    }

    // used to create initial UI
    function prepareInitialUI($http, customerSupplierResource, contactResource, currencyResource, vm)
    {        
        RemoveOutlineBorders($('#selectCategory'));
        DisplayErrorMessage('', $('#lblErrorMessage'));
        DisplayErrorMessage('', $('#lblErrorMessageCrtOrdr'));
        DisplayErrorMessage('', $('#lblErrorOrderLineMessage'));

        populateCompanyDropDown(customerSupplierResource);
        populateContactDropDown(contactResource);
        populateCurrencyDDL(currencyResource);

        populateCategoryDropDown($http);
        populateStatusDropDown($http);
       
        // disable product search form sections
        EnableDisableProductSearchForm(true);

        // hide order details panels buttons
        HideOrderDetailsBtns(true);
    }

    // used to hide order details panels buttons
    function HideOrderDetailsBtns(hideMe) {
        if (hideMe)
        {
            $('#btnConfirmOdr').hide();
            $('#btnDwnldOrdRprt').hide();
        }
        else {
            $('#btnConfirmOdr').show();
            $('#btnDwnldOrdRprt').show();
        }
    }

    // used to create the product search result data grid
    function DrawGrid(searchResult, $http)
    {         
        if (searchResult != null) {
            //alert("Grid creation : " + searchResult.length);
            // basic grid creation, data population
            $('#productsGrid').dataTable({
                "data": searchResult,
                "aoColumns": [
                        { "mData": "productlistId", "sTitle": "Product list Id", "bVisible": false },
                        { "mData": "productcategory", "sTitle": "Category ID", "bVisible": false },
                        { "mData": "productCatergoryName", "sTitle": "Category" },
                        { "mData": "productcondition", "sTitle": "Condition ID", "bVisible": false },
                        { "mData": "conditionName", "sTitle": "Condition" },
                        { "mData": "productbrandid", "sTitle": "Brand ID", "bVisible": false },
                        { "mData": "productbrandname", "sTitle": "Brand" },
                        { "mData": "model", "sTitle": "Model" },
                        { "mData": "marketvalueGBP", "sTitle": "Market value &#163", "bVisible": false },
                        { "mData": "stockCount", "sTitle": "Stock count" },
                        { "sTitle": "View More", "defaultContent": "<button class='productInfo'>Negotiate</button>" }
                ],
                "bDestroy": true,
                "aLengthMenu": [[50, 100, 200, -1], [50, 100, 200, "All"]],
                "iDisplayLength": 50
            });

            // data table
            var table = $('#productsGrid').DataTable();

            // on info button clicks
            $('#productsGrid tbody').on('click', 'button.productInfo', function () {
                var data = table.row($(this).parents('tr')).data();                
                //alert("View Info : " + data.productlistId + " - " + data.model);
                OnProductInfoBtnClick(data, $http);
            });
        }
        else {
            DisplayErrorMessage('Error : No products in the specified search criteria', $('#lblErrorMessage'));
            alert('Error : No products in the specified search criteria');
        }
        
    }

    // on product information button click on the grid rows
    function OnProductInfoBtnClick(prodFrmGrid, $http)
    {
        // clean error messages
        RemoveOutlineBordersNegForm();

        // get product/negotiation info
        var productListId = prodFrmGrid.productlistId;
        var category = prodFrmGrid.productCatergoryName;
        var condition = prodFrmGrid.conditionName;
        var brand = prodFrmGrid.productbrandname;
        var model = prodFrmGrid.model;
        var marketValueGBP = '';
        var marketValueSpecificCurr = '';
        var stockCount = '';
        var selectedCurrency = $('#selectCurrency option:selected').text().toUpperCase();
        var stockAmended = '';
        var lastAmendedDateValue = '';
                
        // get market value and stock count     
        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/ProductInfo?productlistId=' + productListId),
        }).success(function (data) {
            if (data != null) {
                marketValueGBP = data.marketvalueGBP;
                marketValueSpecificCurr = GetMarketValueFromSpecificCurrency(selectedCurrency, data);
                stockCount = data.stockCount;
                stockAmended = data.stockAmended;
                lastAmendedDateValue = data.lastAmendedDateValue;

                DisplayNegotiationPopup($http, productListId, category, condition, brand, model, marketValueGBP, marketValueSpecificCurr, stockCount, selectedCurrency, stockAmended, lastAmendedDateValue);
            }
            else {
                alert('error - web service access - cound not find a product with Id - ' + productListId + ' - please contact IT helpdesk');
            }
        }
        ).error(function (data) {
            // display error message
            alert('error - web service access - product retreival by product Id - please contact IT helpdesk');            
        });
    }

    // function used to return market value with order specific currency
    function GetMarketValueFromSpecificCurrency(selectedCurrency, data) {
        var marketValueSpecificCurr = "";
        // switch to select market value in order specific currency        
        switch (selectedCurrency) {
            case "GBP":
                {
                    marketValueSpecificCurr = data.marketvalueGBP;
                    break;
                }
            case "USD":
                {
                    marketValueSpecificCurr = data.marketvalueUSD;
                    break;
                }
            case "EURO":
                {
                    marketValueSpecificCurr = data.marketvalueEuro;
                    break;
                }
        }
        return marketValueSpecificCurr;
    }

    // used to display the product negotiation popup
    function DisplayNegotiationPopup($http, productListId, category, condition, brand, model, marketValueGBP, marketValueSpecificCurr, stockCount, selectedCurrency, stockAmended, lastAmendedDateValue)
    {        
        // populate the popup
        $('#productListId').val(productListId);
        $('#lblCetegory').text(category);
        $('#lblCondition').text(condition);
        $('#lblBrand').text(brand);
        $('#lblModel').text(model);
        if (selectedCurrency == 'GBP')
            $('#lblMktVal').html('£ ' + RoundUpTo(marketValueGBP, 2));
        else
            $('#lblMktVal').html('£ ' + RoundUpTo(marketValueGBP, 2) + ' | ' + getCurrencyHtmlEntityValue(selectedCurrency) + ' ' + RoundUpTo(marketValueSpecificCurr, 2));

        $('#lblStockCount').text(stockCount);

        // clean negotiation form
        $('#quantityInput').val('');
        $('#priceInput').val('');
        $('#statusSelect').val(-1);
        $('#totalIncomeLbl').html("Total Value (" +
            getCurrencyHtmlEntityValue($('#selectCurrency option:selected').text().toUpperCase()) + ") = ");
        $('#totalIncome').text(0.0);

        $('#lblStockCounted').text(stockAmended);
        $('#lblStockCountedDate').text(lastAmendedDateValue);

        DisplayErrorMessage('', $('#lblErrorManageNegotiation'));
        
        //debugger
        var newOrderId  = $('#orderId').val();
        if (newOrderId != -1) {
            GetPreiouseSuccessfullNegotiaions($http, newOrderId, productListId);
            RefreshProductNegotiations($http, newOrderId, productListId);
        }
        else {
            GetPreiouseSuccessfullNegotiaions($http, newOrderId, productListId)
            DrawSuccessNegotiationsGrid(null, null);
            DrawNegotiationsGrid(null);                                 // negotiations of the current product in the order
        }

        // show the popup with populated data        
        $('#modelNegotiation').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    }
	
	// select status on edit orderline popup
    function FindStatus($http, status)
    {        
        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/status'),
        }).success(function (data) {
            var listitems = '';
            $.each(data, function (index, item) {                
                if (item.statusStr == status)
                    $('#statusSelect').val(item.id);
            });
        }
        ).error(function (data) {
            // display error message
            alert('error - web service access')
        });
    }

    // Used to edit an existing orderline
    // marketValueGBP, marketValueSpecificCurr, stockCount, selectedCurrency)
    function DisplayEditOrderLinePopup($http, productListId, category, condition, brand, model, marketValueGBP, stockCount, quantityAsked, negotiatedPricePerItem, totalAsked, status, selectedCurrency, marketValueSpecificCurr, stockAmended, lastAmendedDateValue)
    {        
		// get status numeric value for selection 
        FindStatus($http, status);
		
        // populate the popup
        $('#productListId').val(productListId);
        $('#lblCetegory').text(category);
        $('#lblCondition').text(condition);
        $('#lblBrand').text(brand);
        $('#lblModel').text(model);
        //$('#lblMktVal').text('£ ' + marketValue);
        if (selectedCurrency == 'GBP')
            $('#lblMktVal').html('£ ' + RoundUpTo(marketValueGBP, 2));
        else
            $('#lblMktVal').html('£ ' + RoundUpTo(marketValueGBP, 2) + ' | ' + getCurrencyHtmlEntityValue(selectedCurrency) + ' ' + RoundUpTo(marketValueSpecificCurr, 2));

        $('#lblStockCount').text(stockCount);

        // clean negotiation form
        $('#quantityInput').val(quantityAsked);
        $('#priceInput').val(RoundUpTo(negotiatedPricePerItem, 2));
        //$('#statusSelect').val(-1);
        $('#totalIncome').text(RoundUpTo(totalAsked, 2));

        $('#lblStockCounted').text(stockAmended);
        $('#lblStockCountedDate').text(lastAmendedDateValue);

        DisplayErrorMessage('', $('#lblErrorManageNegotiation'));


        var newOrderId = $('#orderId').val();
        if (newOrderId != -1) {
            GetPreiouseSuccessfullNegotiaions($http, newOrderId, productListId);
            RefreshProductNegotiations($http, newOrderId, productListId);
        }
        else {
            DrawSuccessNegotiationsGrid(null, null);
            DrawNegotiationsGrid(null);                                 // negotiations of the current product in the order
        }

        // show the popup with populated data        
        $('#modelNegotiation').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    }

    // get previouse successful negotions for the same product but different order
    function GetPreiouseSuccessfullNegotiaions($http, newOrderId, productListId)
    {
        var selectedCurrency = $('#selectCurrency option:selected').text().toUpperCase();
        var currentCompany = $('#selectCustSupp').find(":selected").text();
        var serverUrl = 'https://localhost:44302/api/Negotiation?orderId=' + newOrderId + '&productListId=' + productListId + '&confirmed=true' + '&custSupName=' + currentCompany + '&count=3&selectedCurrency=' + selectedCurrency;
        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: serverUrl
        }).success(function (data) {            
            DrawSuccessNegotiationsGrid(data, currentCompany);                              // previouse successful negotiations in other orders            
        }
        ).error(function (data) {
            // display error message                
            DisplayErrorMessage('error - web service access - get negotiations by product, order Ids - please contact IT helpdesk', $('#lblErrorManageNegotiation'));
            //alert('error - web service access - record negotiation - please contact IT helpdesk');
        });
    }

    // display successful negotiations table
    function DrawSuccessNegotiationsGrid(successNegos, compnayName) {
        var htmlTable = "<div style='height:225px; overflow-y:scroll;'><table class='table table-condensed table-striped table-bordered'><tr style='background-color: #4CAF50'><th>Company</th><th>Contact</th><th>Date</th><th>Qty</th><th>PPI (" +
            getCurrencyHtmlEntityValue($('#selectCurrency option:selected').text().toUpperCase()) + ")</th><th>OL Total (" +
            getCurrencyHtmlEntityValue($('#selectCurrency option:selected').text().toUpperCase()) + ")</th><th>% Ord Total</th></tr>";
        if (successNegos != null && successNegos.length > 0) {

            successNegos = AppendDecimalZeros(successNegos);
            $.each(successNegos, function (index, item) {
                // highlight same company success negotations 
                if (compnayName == item.cusomerSupplierName) {

                    htmlTable += "<tr>" + "<td>" + item.cusomerSupplierName + "</td>" + "<td>" + item.contactName + "</td>" + "<td>" + item.date + "</td>" +
                    "<td class='alignTxtRight'>" + item.quantity + "</td>" + "<td>" + item.negotiatedPricePerItem + "</td>" +
                    "<td>" + item.totalAmount + "</td>" + "<td>" + item.orderlineTotalPercentage + " %</td>" + "</tr>";
                }
                else {
                    htmlTable += "<tr>" + "<td>" + item.cusomerSupplierName + "</td>" + "<td>" + item.contactName + "</td>" + "<td>" + item.date + "</td>" +
                    "<td class='alignTxtRight'>" + item.quantity + "</td>" + "<td class='alignTxtRight'>" + item.negotiatedPricePerItem + "</td>" +
                    "<td class='alignTxtRight'>" + item.totalAmount + "</td>" + "<td class='alignTxtRight'>" + item.orderlineTotalPercentage + "%</td>" + "</tr>";
                }
            });
        }
        else if (successNegos == null || successNegos.length == 0) {
            htmlTable += "<tr>" + "<td>" + "-" + "</td>" + "<td>" + "-" + "</td>" + "<td>" + "-" + "</td>" + "<td>" + "-" + "</td>" +
                    "<td>" + "-" + "</td>" + "<td>" + "-" + "</td>" + "<td>" + "-" + "</td>" + "</tr>";
        }
        htmlTable += "</table></div>";
        $('#successNegotiationsGridDiv').empty();
        $('#successNegotiationsGridDiv').html(htmlTable);
    }

    // appends decimal places - zeros if necessary
    function AppendDecimalZeros(successNegos) {
        $.each(successNegos, function (index, item) {

            item.negotiatedPricePerItem = RoundUpTo(item.negotiatedPricePerItem, 2);
            item.totalAmount = RoundUpTo(item.totalAmount, 2);
            item.orderlineTotalPercentage = RoundUpTo(item.orderlineTotalPercentage, 2);
            item.orderTotal = RoundUpTo(item.orderTotal, 2);
        });
        return successNegos;
    }


    // used to record a negotation
    function RecordNegotiation($http) {
        var isValid = ValidateNegotiation();
        if (isValid)
        {
            // disable negotiation form fields
            EnableDisableNegotiationButtons(true);

            // inputs
            var productListId = $('#productListId').val();
            var quantityVal = $('#quantityInput').val();
            var pricePerItem = RoundUpTo($('#priceInput').val(), 2);
            var status = $('#statusSelect').val();
            var totalAmountVal = $('#totalIncome').text();
            var orderId = $('#orderId').val();

            var serverUrl = 'https://localhost:44302/api/Negotiation?productListId=' + productListId + '&quantityVal=' + quantityVal + '&pricePerItem=' + pricePerItem
                + '&totalAmountVal=' + totalAmountVal + '&status=' + status + '&orderIdVal=' + orderId;
            $http({
                method: "get",
                headers: { 'Content-Type': 'application/json' },
                url: serverUrl
            }).success(function (data) {
                if (data == 'success')
                {
                    // display success message
                    $('#lblErrorManageNegotiation').removeClass("errorLabel");
                    $('#lblErrorManageNegotiation').addClass("successLabel");
                    $('#lblErrorManageNegotiation').text("Negotiation Recorded");

                    // clean form
                    CleanNegotiationForm();

                    // Refresh negotiations table
                    RefreshProductNegotiations($http, orderId, productListId);
                }
                else
                {                    
                    DisplayErrorMessage('error - saving data - record negotiation - please contact IT helpdesk', $('#lblErrorManageNegotiation'));
                    //alert('error - saving data - record negotiation - please contact IT helpdesk');
                }
            }
            ).error(function (data) {
                // display error message                
                DisplayErrorMessage('error - web service access - record negotiation - please contact IT helpdesk', $('#lblErrorManageNegotiation'));
                //alert('error - web service access - record negotiation - please contact IT helpdesk');
            });

            // enable form fields
            EnableDisableNegotiationButtons(false);
        }
    }

    // Refreshing the negotiations 
    function RefreshProductNegotiations($http, orderId, productListId) {

        var serverUrl = 'https://localhost:44302/api/Negotiation?orderId=' + orderId + '&productListId=' + productListId;
        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: serverUrl
        }).success(function (data) {
            if (data != null && data.length > 0) {
                // Populate negotiations grid
                //alert('Negotiations count : ' + data.length);
                DrawNegotiationsGrid(data);
            }
            else if (data == null || data.length == 0) {
                DrawNegotiationsGrid(null);
                //DisplayErrorMessage('No negotiations for this product on this order', $('#lblErrorManageNegotiation'));
                //alert('error - saving data - record negotiation - please contact IT helpdesk');
            }
        }
        ).error(function (data) {
            // display error message                
            DisplayErrorMessage('error - web service access - get negotiations by product, order Ids - please contact IT helpdesk', $('#lblErrorManageNegotiation'));
            //alert('error - web service access - record negotiation - please contact IT helpdesk');
        });
    }

    // Used to draw the negotiation grid
    function DrawNegotiationsGrid(negotiations) {
        var htmlTable = "<div style='height:100px; overflow-y:scroll;'><table class='table table-condensed table-bordered'><tr style='background-color: #4CAF50'><th>Date</th><th>Time</th><th>Qty</th><th>PPI (" +
            getCurrencyHtmlEntityValue($('#selectCurrency option:selected').text().toUpperCase()) + ")</th><th>Total (" +
            getCurrencyHtmlEntityValue($('#selectCurrency option:selected').text().toUpperCase()) + ")</th><th>Status</th></tr>";
        if (negotiations != null && negotiations.length > 0) {

            $.each(negotiations, function (index, item) {
                htmlTable += "<tr>" + "<td>" + item.date + "</td>" + "<td>" + item.time + "</td>" +
                    "<td class='alignTxtRight'>" + item.quantity + "</td>" + "<td class='alignTxtRight'>" + item.negotiatedPricePerItem + "</td>" +
                    "<td class='alignTxtRight'>" + item.totalAmount + "</td>" + "<td>" + item.status + "</td>" + "</tr>";
            });
        }
        else if (negotiations == null || negotiations.length == 0) {
            htmlTable += "<tr>" + "<td>" + "-" + "</td>" + "<td>" + "-" + "</td>" + "<td>" + "-" + "</td>" + "<td>" + "-" + "</td>" +
                    "<td>" + "-" + "</td>" + "<td>" + "-" + "</td>" + "</tr>";
        }
        htmlTable += "</table></div>";
        $('#orderNegotiationsGridDiv').empty();
        $('#orderNegotiationsGridDiv').html(htmlTable);
    }

    // removes the negotiation inputs
    function CleanNegotiationForm() {        
        $('#quantityInput').val('');
        $('#priceInput').val('');
        $('#statusSelect').val(-1);
        $('#totalIncome').text(0.0);        
    }

    // used to insert an order line
    function InsertOrderLine($http, vm) {
        var isValid = ValidateNegotiation();
        if (isValid) {
            // disable negotiation form fields
            EnableDisableNegotiationButtons(true);

            // inputs
            var productListId = $('#productListId').val();
            var quantityVal = $('#quantityInput').val();
            var pricePerItem = RoundUpTo($('#priceInput').val(), 2);
            var status = $('#statusSelect').val();
            var totalAmountVal = $('#totalIncome').text();
            var orderId = $('#orderId').val();

            var serverUrl = 'https://localhost:44302/api/Orderline?productListId=' + productListId + '&quantityVal=' + quantityVal + '&pricePerItem=' + pricePerItem
                + '&totalAmountVal=' + totalAmountVal + '&statusVal=' + status + '&orderIdVal=' + orderId;
            $http({
                method: "get",
                headers: { 'Content-Type': 'application/json' },
                url: serverUrl
            }).success(function (data) {
                if (data != null) {                    
                    //alert(data.length);
                    // Refresh orderlines grid
                    DrawOrderlineGrid(data, $http, vm);
                    // Navigate to the main add/edit order form
                    $('#modelNegotiation').modal('hide');
                }
                else {
                    DisplayErrorMessage('error - saving data - record negotiation - please contact IT helpdesk', $('#lblErrorManageNegotiation'));
                    //alert('error - saving data - record negotiation - please contact IT helpdesk');
                }
            }
            ).error(function (data) {
                // display error message                
                DisplayErrorMessage('error - web service access - record negotiation - please contact IT helpdesk', $('#lblErrorManageNegotiation'));
                //alert('error - web service access - record negotiation - please contact IT helpdesk');
            });

            // enable form fields
            EnableDisableNegotiationButtons(false);
        }
    }

    // get total income of the order
    function GetTotal(orderlines)
    {
        var totalIncome = 0.00;
        $.each(orderlines, function (key, value) {
            totalIncome += value.totalAmount;
        });        
        return RoundUpTo(totalIncome, 2);
    }

    // used to create the orderline data grid
    function DrawOrderlineGrid(orderlines, $http, vm) {
        //DestroyTable();     // clear out search results
        // setting total income on the order
        var selectedCurrency = $('#selectCurrency option:selected').text().toUpperCase();
        //vm.totalValue = "Total : " + getCurrencyHtmlEntityValue(selectedCurrency) + GetTotal(orderlines);
        $('#totalOrdlines').html("Total : " + getCurrencyHtmlEntityValue(selectedCurrency) + ' ' + GetTotal(orderlines));

        DisplayErrorMessage('', $('#lblErrorOrderLineMessage'));
        $('#orderGrid').empty();
        
        HideOrderDetailsBtns(false);     // hide order details panels buttons

        if (orderlines != null) {
            //alert("Grid creation : " + searchResult.length);
            // basic grid creation, data population
            $('#orderGrid').dataTable({
                "data": orderlines,
                "aoColumns": [
                        { "mData": "id", "sTitle": "Orderline Id", "bVisible": false },
                        { "mData": "productId", "sTitle": "Product ID", "bVisible": false },
                        { "mData": "conditionId", "sTitle": "conditionId", "bVisible": false },
                        { "mData": "condition", "sTitle": "Condition" },
                        { "mData": "brandId", "sTitle": "brandId", "bVisible": false },
                        { "mData": "brand", "sTitle": "Brand" },
                        { "mData": "model", "sTitle": "Model" },
                        { "mData": "quantity", "sTitle": "Quantity" },
                        {
                            "mData": "negotiatedPricePerItem", "sTitle": ("PPI (" + getCurrencyHtmlEntityValue($('#selectCurrency option:selected').text().toUpperCase()) + ")"), "mRender": function (data, type, row) {
                                if (data != null) {
                                    return RoundUpTo(data, 2);
                                }
                                else {
                                    return 0.00;
                                }
                            },
                            "aTargets": [0]
                        },
                        {
                            "mData": "totalAmount", "sTitle": ("Total (" + getCurrencyHtmlEntityValue($('#selectCurrency option:selected').text().toUpperCase()) + ")"), "mRender": function (data, type, row) {
                                if (data != null) {
                                    return RoundUpTo(data, 2);
                                }
                                else {
                                    return 0.00;
                                }
                            },
                            "aTargets": [0]
                        },
                        { "mData": "status", "sTitle": "Status" },
                        { "mData": "orderLineQuantityStatus", "sTitle": "Orderline with stock", "bVisible": false },
                        { "mData": "date", "sTitle": "Date", "bVisible": false },
                        { "mData": "time", "sTitle": "Time", "bVisible": false },
                        { "mData": "orderId", "sTitle": "Order Id", "bVisible": false },

                        { "sTitle": "Edit Info", "defaultContent": "<button class='businessEdit'><span class='glyphicon glyphicon-edit'/></button>" },
                        { "sTitle": "Reject", "defaultContent": "<button class='businessReject'><span class='glyphicon glyphicon-ban-circle'/></button>" },
                        { "sTitle": "Delete", "defaultContent": "<button class='businessDelete'><span class='glyphicon glyphicon-remove'/></button>" },
                ],
                "bDestroy": true,
                "aLengthMenu": [[25, 50, 100, 200, -1],[25, 50, 100, 200, "All"]],
                "iDisplayLength": -1
            });

            // data table
            var table = $('#orderGrid').DataTable();

            // on info button clicks
            $('#orderGrid tbody').on('click', 'button.businessEdit', function () {                
                var dataRow = table.row($(this).parents('tr')).data();
                //alert("View Info : " + data.productlistId + " - " + data.model);
                OnOrderLineEditBtnClick(dataRow, $http);
            });
            // on reject button clicks
            $('#orderGrid tbody').on('click', 'button.businessReject', function () {
                var row = $(this).parents('tr');
                var dataRow = table.row($(this).parents('tr')).data();
                //alert("View Info : " + data.productlistId + " - " + data.model);
                OnOrderLineRejectBtnClick(row, dataRow, $http);
            });
            // on delete button clicks
            $('#orderGrid tbody').on('click', 'button.businessDelete', function () {
                var row = $(this).parents('tr');
                var dataRow = table.row($(this).parents('tr')).data();
                //alert("View Info : " + data.productlistId + " - " + data.model);
                OnOrderLineDeleteBtnClick(row, dataRow, $http);
            });
        }
        //else {
        //    DisplayErrorMessage('Error : No products in the specified search criteria', $('#lblErrorOrderLineMessage'));
        //    alert('Error : No products in the specified search criteria');
        //}
    }

    // reject orderline
    function OnOrderLineRejectBtnClick(row, dataRow, $http) {
        bootbox.dialog({
            message: "Are you sure that you want to reject orderline " + dataRow.id + " of " + dataRow.orderId + " ?",
            title: "Confirm Order Deletion",
            buttons: {
                danger: {
                    label: "No",
                    className: "btn-danger",
                    callback: function () {
                        toastr.warning("Orderline not rejected");
                    }
                },
                main: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function () {
                        DeleteRejectOrderline($http, 'rej', dataRow.id, dataRow.orderId, row);
                    }
                }
            }
        });        
    }

    // delete orderline
    function OnOrderLineDeleteBtnClick(row, dataRow, $http) {
        bootbox.dialog({
            message: "Are you sure that you want to delete orderline " + dataRow.id + " of " + dataRow.orderId + " ?",
            title: "Confirm Order Deletion",
            buttons: {
                danger: {
                    label: "No",
                    className: "btn-danger",
                    callback: function () {
                        toastr.warning("Orderline not deleted");
                    }
                },
                main: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function () {
                        DeleteRejectOrderline($http, 'del', dataRow.id, dataRow.orderId, row);
                    }
                }
            }
        });        
    }

    // used to make server call to delete or reject an orderline
    function DeleteRejectOrderline($http, deleteOrReject, orderlineId, orderId, row) {
        var serverUrl = 'https://localhost:44302/api/orderline?orderId=' + orderId + '&orderlineId=' + orderlineId + '&deleteOrReject=' + deleteOrReject;
        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: serverUrl
        }).success(function (data) {
            debugger;
            if (data.indexOf('success') > -1) {
                // remove orderline from the grid
                RemoveOrderlineFromGrid(row);
                bootbox.dialog({
                    title: "Success",
                    message: 'Orderline ' + orderlineId + ' of order ' + orderId + (deleteOrReject == 'del' ? ' deleted' : ' rejected') + ' successfuly',
                    buttons: {
                        main: {
                            label: "Ok",
                            className: "btn-primary",
                            callback: function () {
                                toastr.success('orderline ' + orderlineId + (deleteOrReject == 'del' ? ' deleted' : ' rejected'));
                            }
                        }
                    }
                });
            }
            else {
                bootbox.dialog({
                    title: "Error",
                    message: 'Orderline ' + orderlineId + ' of order ' + orderId + (deleteOrReject == 'del' ? ' deletion' : ' rejection') + ' unsuccessful',
                    buttons: {
                        main: {
                            label: "Ok",
                            className: "btn-primary",
                            callback: function () {
                                toastr.error('orderline ' + orderlineId + ' not ' + (deleteOrReject == 'del' ? ' deleted' : ' rejected'));
                            }
                        }
                    }
                });
            }
        }
        ).error(function (data) {
            // display error message
            alert('error - web service access - please contact IT helpdesk');
        });
    }

    // remove orderline from the grid
    function RemoveOrderlineFromGrid(row) {
        row.remove();
    }

    // edit orderline
    function OnOrderLineEditBtnClick(dataRow, $http)
    {
        //alert('Edit order line id : ' + dataRow.id);
        var selectedCurrency = $('#selectCurrency option:selected').text().toUpperCase();
        var serverUrl = 'https://localhost:44302/api/Orderline?orderlineId=' + dataRow.id + '&orderCurrency=' + selectedCurrency;
        DisplayErrorMessage('', $('#lblErrorOrderLineMessage'));
        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: serverUrl
        }).success(function (data) {           
            
            DisplayEditOrderLinePopup($http, data.productId, data.category, data.condition, data.brand, data.model, data.marketvalueGBP, data.stockCount,
                dataRow.quantity, dataRow.negotiatedPricePerItem, dataRow.totalAmount, data.status, selectedCurrency, data.marketValueSpecificCurr,
                data.stockAmended, data.lastAmendedDateValue);
        }
        ).error(function (data) {
            // display error message
            alert('error - web service access - get orerline info - please contact IT helpdesk');
            DisplayErrorMessage('error - web service access - get orerline info - please contact IT helpdesk', $('#lblErrorOrderLineMessage'));
        });        
    }

    // used to validate the negotiation information
    function ValidateNegotiation()
    {
        var isValid = true;
        RemoveOutlineBordersNegForm();                         // remove previouse error indications if any
        DisplayErrorMessage('', $('#lblErrorManageNegotiation'));
        
        var quantityEle = $('#quantityInput');
        if (isNullOrEmpty(quantityEle) || (!IsAWholeNumber(quantityEle.val()))) {
            isValid = false;
            ApplyErrorBorder(quantityEle);
            DisplayErrorMessage('Error - Please input a valid quantity value - a whole number', $('#lblErrorManageNegotiation'));
        }
        
        var priceEle = $('#priceInput');
        if (isValid && (isNullOrEmpty(priceEle) || (!IsANumber(priceEle.val())))) {
            isValid = false;
            ApplyErrorBorder(priceEle);
            DisplayErrorMessage('Error - Please input a valid price value - a whole/decimal number', $('#lblErrorManageNegotiation'));
        }
        
        if (isValid && (!isValidDropDownListSelection($('#statusSelect')))) {
            ApplyErrorBorder($('#statusSelect'));                                                                                       // indicate error
            DisplayErrorMessage("Please select a valid status for the negotiation", $('#lblErrorManageNegotiation'));                   // update error message
            isValid = false;
        }
        //else if ($.trim($('#statusSelect').val()) == '1') {     // if confirmed only
            // perform stock count adjustment considering last negotiation, orderline
            var stockCountEle = $('#lblStockCount');
            var stockCount = parseInt(stockCountEle.text(), 10);
            var quantity = parseInt(quantityEle.val(), 10);            
            var currentAllocation = $('#orderNegotiationsGridDiv tr:eq(1) td:eq(2)').text();    // read last quantity allocation
            if (currentAllocation != '-' && $('#orderNegotiationsGridDiv tr:eq(1) td:eq(5)').text() != 'rejected')
            {
                stockCount = stockCount + parseInt(currentAllocation, 10);
            }
            if (quantity > stockCount)
            {
                //ApplyErrorBorder($('#statusSelect'));                                                                                       // indicate error
                ApplyErrorBorder(quantityEle);
                DisplayErrorMessage("Warning - Stock count is not sufficient to fulfill the quantity requirement", $('#lblErrorManageNegotiation'));     // update error message
                isValid = false;
            }
        //}
        
        return isValid;
    }

    // remove previouse error indications
    function RemoveOutlineBordersNegForm()
    {
        RemoveOutlineBorders($('#quantityInput'));
        RemoveOutlineBorders($('#priceInput'));
        RemoveOutlineBorders($('#statusSelect'));
    }

    // searching product info
    function SearchProducts($http)
    {  
        // get search criterias
        var categoryDdl = $('#selectCategory');
        var searchResult = null;
        var categoryId = categoryDdl.val();
        var conditionId = 'nothing';
        var brandIds = 'nothing';
        var modelIds = 'nothing';
        
        if (isValidDropDownListSelection(categoryDdl))
        {
            RemoveOutlineBorders(categoryDdl);
            conditionId = $('#selectCondition').val();
            brandIds = $('#selectBrand').val();
            modelIds = $('#selectModel').val();
            
            // search and display
            RetriveSearchProductsDrawGrid($http, categoryId, conditionId, brandIds, modelIds);            
        }
        else
        {
            DisplayErrorMessage('Error : You should atleast select a category perform a product search', $('#lblErrorMessage'));
            ApplyErrorBorder(categoryDdl);
        }        
    }

    // used to search and return the results in the DB
    function RetriveSearchProductsDrawGrid($http, categoryId, conditionId, brandIds, modelIds)
    {
        //var searchParams = getSearchParamsJsonObject(categoryId, conditionId, brandIds, modelIds);       // creation of the json object
        //var jsonStr = JSON.stringify(searchParams);                                                       // covert to json string to pass to web service
        var searchResult = '';
        var serverUrl = 'https://localhost:44302/api/ProductInfo?categoryId=' + categoryId +
                '&conditionId=' + conditionId + '&brandIds=' + brandIds + '&modelIds=' + modelIds;
        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: serverUrl
        }).success(function (data) {
            //alert('search result length : ' + data.length); 
            DrawGrid(data, $http);
        }
        ).error(function (data) {
            // display error message
            alert('error - web service access - product search - please contact IT helpdesk');
            DisplayErrorMessage('error - web service access - product search - please contact IT helpdesk', $('#lblErrorMessage'))
        });
    }

    //used to get json object consisting of search paramters 
    function getSearchParamsJsonObject(categoryId, conditionId, brandIds, modelIds)
    {
        var searchParamsJson = {
            "categoryId": categoryId,
            "conditionId": conditionId,
            "brandIds": brandIds,
            "modelIds": modelIds
        };

        return searchParamsJson;
    }
    
    // used to populate the product category drop down menu
    function populateCategoryDropDown($http) {
        $http({
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
       

    // used to populate contact persons drop down
    function populateContactDropDown(contactResource) {
        contactResource.query(function (data) {            // REST API call to get all the companies with company names
            var listitems = '<option value=-1 selected="selected">---- Select Contact ----</option>';
            $.each(data, function (index, item) {
                var firstName = cleanSpaces(item.firstName);
                var lastName = cleanSpaces(item.lastName);
                var fulName = (firstName + '_' + lastName);                
                listitems += '<option value=' + fulName + '>' + (item.firstName + ' ' + item.lastName) + '</option>';
            });
            $("#selectContact option").remove();
            $("#selectContact").append(listitems);
        });
    }

    // used to populate company ddl for the popups
    function populateCompanyDropDown(customerSupplierResource) {
        
        customerSupplierResource.query(function (data) {            // REST API call to get all the companies with company names
            var listitems = '<option value=-1 selected="selected">---- Select Customer ----</option>';            
            $.each(data, function (index, item) {
                listitems += '<option value=' + item.id + '>' + item.name + '</option>';
            });
            $("#selectCustSupp option").remove();
            $("#selectCustSupp").append(listitems);
        });
    }

    // used to populate currency DDL
    function populateCurrencyDDL(currencyResource) {
        currencyResource.query(function (data) {            // REST API call to get all the currencies
            var listitems = '';            
            $.each(data, function (index, item) {
                if (item.name == "GBP") {
                    listitems += '<option value=' + item.id + ' selected=true>' + item.name + '</option>';
                }
                else {
                    listitems += '<option value=' + item.id + '>' + item.name + '</option>';
                }                
            });
            $("#selectCurrency option").remove();
            $("#selectCurrency").append(listitems);
        });
    }

    // used to populate status ddl
    function populateStatusDropDown($http) {

        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/status'),
        }).success(function (data) {
            var listitems = '';
            $.each(data, function (index, item) {
                listitems += '<option value=' + item.id + '>' + item.statusStr + '</option>';
            });
            $("#statusSelect option").remove();
            $("#statusSelect").append(listitems);
        }
        ).error(function (data) {
            // display error message
            alert('error - web service access')
        });
    }
}());