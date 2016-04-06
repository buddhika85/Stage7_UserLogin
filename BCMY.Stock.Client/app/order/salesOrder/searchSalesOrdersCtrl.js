// IIFE - to manage search sales orders
(function () {
    "use strict";

    var module = angular.module("stockManagement");

    module.controller("SearchSalesOrdersCtrl", ["$http", "contactResource", "blockUI", "customerSupplierResource", '$location', '$rootScope', "loginValidatorService", searchSalesOrdersCtrl]);

    function searchSalesOrdersCtrl($http, contactResource, blockUI, customerSupplierResource, $location, $rootScope, loginValidatorService) {
        
        var vm = this;
        if (loginValidatorService.loginValidator()) {
            EnableTopNavigationBar();
            $("#loggedInUserWithTime").text(localStorage["userName"]);
            vm.title = "Search sales orders";

            prepareInitialUI($http, customerSupplierResource, contactResource);                                     // initial UI
            wireCommands(vm, $http, contactResource, customerSupplierResource, $location, $rootScope);                  // all the commands are bound here
        }
        else {
            localStorage["userName"] = null;
            window.location = window.location.protocol + "//" + window.location.host + "/#/login";
            window.location.reload();
        }
        
    };


    // used to create initial UI
    function prepareInitialUI($http, customerSupplierResource, contactResource, statusResource) {
       
        populateCompanyDropDown(customerSupplierResource);
        populateContactDropDown(contactResource);
        populateStatusDropDown($http);
        setUpDatePickers();
    }

    // used to bind drop down list selection change commands for cascading ddls
    function wireCommands(vm, $http, contactResource, customerSupplierResource, $location, $rootScope) {

        // collapse buyer seller selection panel
        $('#customerHeaderPanel').click(function () {
            $('#customerSection').toggleClass('is-hidden');
        });

        // collapse order section
        $('#orderSearchHeaderPanel').click(function () {
            $('#orderSection').toggleClass('is-hidden');
        });

        // collapse search result
        $('#searchResultHeaderPanel').click(function () {
            $('#searchResultSection').toggleClass('is-hidden');
        });

        // on a company selection
        $('#selectCustSupp').change(function () {
            onCompanyDDLSelection($http, contactResource, customerSupplierResource);
        });

        // on a contact name selection
        $('#selectContact').change(function () {
            onContactDDLSelection($http, customerSupplierResource, contactResource);
        });

        // to search based on selected criterias
        vm.serachOrders = function () {
            searchOrders($http, $location, $rootScope);
        };

        // to reset the search criterias
        vm.resetSearch = function () {
            resetSearch(contactResource, customerSupplierResource);
        };
    }

    // used to perform the search of the orders
    function searchOrders($http, $location, $rootScope) {
        //alert('search');

        // get user search criteria inputs
        var companyId = $('#selectCustSupp').val();
        var contactFulName = $('#selectContact').val();
        var orderId = $('#inputOrdrId').val() == '' ? '' : $('#inputOrdrId').val();
        var status = $('#statusSelect').val();
        var orderType = $('#statusOrderType').val();
        var creationDateFrom = $('#fromDatePicker').val() == '' ? '' : $('#fromDatePicker').val();
        var creationDateTo = $('#toDatePicker').val() == '' ? '' : $('#toDatePicker').val();
                
        var serverUrl = ('https://localhost:44302/api/order?companyId=' + companyId + '&contactFulName=' + contactFulName + '&orderId=' + orderId + '&status=' + status +
                    '&orderType=' + orderType + '&creationDateFrom=' +  creationDateFrom + '&creationDateTo=' + creationDateTo);

        // repopulate the contact DDL based on company selection
        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: serverUrl,
        }).success(function (data) {
            drawOrderGrid(data, $http, $location, $rootScope);
        }
        ).error(function (data) {
            // display error message
            alert('error - web service access - search orders')
        });
    }

    // used to draw a grid of order search results
    function drawOrderGrid(orders, $http, $location, $rootScope)
    {
        if (orders != null) {
            //alert("Grid creation : " + searchResult.length);
            // basic grid creation, data population
            $('#ordersGrid').dataTable({
                "data": orders,
                "aoColumns": [
                        { "mData": "id", "sTitle": "Id"},
                        { "mData": "type", "sTitle": "Type"},
                        { "mData": "status", "sTitle": "Status" },
                        {
                            "mData": "currency", "sTitle": "Currency", "sClass": "right", "mRender": function (data, type, row) {
                                if (data != null) {
                                    return getCurrencyHtmlEntityValue(data);
                                }
                                else {
                                    return '£';
                                }
                            },
                            "aTargets": [0]
                        },
                        { "mData": "total", "sTitle": "Total", "mRender": function (data, type, row) {
                                if (data != null) {
                                    return RoundUpTo(data, 2);
                                }
                                else {
                                    return 0.00;
                                }
                            },
                            "aTargets": [0]
                        },
                        { "mData": "contactId", "sTitle": "Contact Id", "bVisible": false },
                        { "mData": "creationDateTime", "sTitle": "creationDateTime", "bVisible": false },
                        { "mData": "companyId", "sTitle": "Company Id", "bVisible": false },

                        { "mData": "company", "sTitle": "Customer/Supplier" },
                        { "mData": "contactFulName", "sTitle": "Contact" },
                        { "mData": "orderCreationDate", "sTitle": "Date"},
                        { "mData": "orderCreationTime", "sTitle": "Time" },
                        {
                            "mData": "pastOrder", "sTitle": "Past order", "mRender": function (data, type, row) {
                                if (data != null && data == 'yes') {
                                    return 'yes';
                                }
                                else {
                                    return 'no';
                                }
                            },
                            "aTargets": [0]
                        },

                        { "sTitle": "Edit Order", "defaultContent": "<button class='orderSearchEdit'><span class='glyphicon glyphicon-edit'></span></button>" },
                        { "sTitle": "Delete Order", "defaultContent": "<button class='orderSearchDelete'><span class='glyphicon glyphicon-remove'></span></button>" },
                ],
                "bDestroy": true,
                "aLengthMenu": [[10, 25, 100, -1], [10, 25, 100, "All"]],
                "iDisplayLength": 10
            });

            // data table
            var table = $('#ordersGrid').DataTable();

            // on edit button clicks
            $('#ordersGrid tbody').on('click', 'button.orderSearchEdit', function () {
                var dataRow = table.row($(this).parents('tr')).data();
                //alert("View Info : " + data.productlistId + " - " + data.model);
                onOrderEditBtnClick(dataRow, $http, $location, $rootScope);
            });
            // on delete button clicks
            $('#ordersGrid tbody').on('click', 'button.orderSearchDelete', function () {
                var row = $(this).parents('tr');
                var dataRow = table.row($(this).parents('tr')).data();
                //alert("View Info : " + data.productlistId + " - " + data.model);
                onOrderDeleteBtnClick(dataRow, $http, row);
            });
        }
    }

    // on delete button click
    function onOrderDeleteBtnClick(dataRow, $http, row) {
        
        bootbox.dialog({
            message: "Are you sure that you want to delete order " + dataRow.id + " by " + dataRow.contactFulName + " of " + dataRow.company + " ?",
            title: "Confirm Order Deletion",
            buttons: {
                danger: {
                    label: "No",
                    className: "btn-danger",
                    callback: function () {
                        toastr.warning("Order not deleted");
                    }
                },
                main: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function () {                        
                        var orderId = dataRow.id;
                        $http({
                            method: "get",
                            headers: { 'Content-Type': 'application/json' },
                            url: ('https://localhost:44302/api/Order?deleteOrderId=' + orderId),
                        }).success(function (data) {                           
                            refreshGridAfterDelete(row); // refresh grid if the deletion success                            
                            toastr.success(data);
                        }
                        ).error(function (data) {
                            // display error message
                            alert('error - web service access - contact IT support')
                        });
                    }
                }
            }
        });           
    }

    // used to remove the deleted order row from the grid
    function refreshGridAfterDelete(row)
    {       
        row.remove();
    }

    // on edit button click
    function onOrderEditBtnClick(dataRow, $http, $location, $rootScope)
    {
        var orderId = dataRow.id;

        debugger
        var pastDate = dataRow.orderCreationDate;
        pastDate = pastDate.split("/");
        pastDate = (pastDate[2] + '-' + pastDate[1] + '-' + pastDate[0]); //new Date(pastDate[2], pastDate[1] - 1, pastDate[0]);
               
        if (orderId != null && (dataRow.pastOrder == null || dataRow.pastOrder == 'no')) {
            $rootScope.$apply(function () {
                // pass order Id to edit order page
                $location.path("/order/salesOrder/editSalesOrder").search({ orderId: orderId });
            });
        }
        else if (orderId != null && (dataRow.pastOrder != null || dataRow.pastOrder == 'yes')) {
            //alert(" a past order ");
            $rootScope.$apply(function () {
                // pass order Id to edit order page
                $location.path("/order/pastData/pastSalesOrder/editPastSalesOrder").search({ orderId: orderId, pastDate: pastDate });
            });
        }
        else {
            alert("Please refresh the page again - CTRL + F5");
        }        
    }

    // used to reset search search criterias
    function resetSearch(contactResource, customerSupplierResource) {
        populateCompanyDropDown(customerSupplierResource);
        populateContactDropDown(contactResource);
        $('#inputOrdrId').val('');
        $('#statusSelect').val('0');
        $('#fromDate').val('');
        $('#toDate').val('');
        $('#statusOrderType').val('0');
        destroyTable();
    }

    // Destroy the orders search result data grid
    function destroyTable() {
        if ($.fn.DataTable.isDataTable('#ordersGrid')) {
            $('#ordersGrid').DataTable().destroy();
            $('#ordersGrid').empty();
        }
    }

    // used to setup datepickers
    function setUpDatePickers() {
        
        $("#fromDatePicker").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            //showOn: "button",
            //buttonImage: "Content/images/calendar_blank.ico",
            beforeShow: function(){    
                $(".ui-datepicker").css('font-size', 12) 
            },
            onClose: function (selectedDate) {
                $("#toDatePicker").datepicker("option", "minDate", selectedDate);
            }
        });
        $("#toDatePicker").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            dateFormat: "dd/mm/yy",
            //showOn: "button",
            //buttonImage: "Content/images/calendar_blank.ico",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            },
            onClose: function (selectedDate) {
                $("#fromDatePicker").datepicker("option", "maxDate", selectedDate);
            }
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

    // used to populate company ddl
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

    // on a company selection - populate contacts DDL by company id
    function onCompanyDDLSelection($http, contactResource, customerSupplierResource) {
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
                    if (selectedFulName == fulName) {
                        listitems += '<option value=' + fulName + ' selected>' + (item.firstName + ' ' + item.lastName) + '</option>';
                    }
                    else {
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
    function onContactDDLSelection($http, customerSupplierResource, contactResource) {
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
                    if (selectedCompany == item.id) {
                        listitems += '<option value=' + item.id + ' selected>' + item.name + '</option>';
                    }
                    else {
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

    // used to populate status ddl
    function populateStatusDropDown($http) {

        $http({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/status'),
        }).success(function (data) {
            var listitems = '<option value=0 selected>all</option>';
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