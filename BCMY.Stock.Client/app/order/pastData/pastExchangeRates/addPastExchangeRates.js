(function () {
    "use strict";
    var module = angular.module("stockManagement");         // get module
    module.controller("AddPastExchangeRatesCtrl", ["$http", "blockUI", "loginValidatorService", addPastExchangeRatesCtrl]);    // attach controller to the module

    // controller function
    function addPastExchangeRatesCtrl($http, blockUI, loginValidatorService)
    {        
        var vm = this;
        if (loginValidatorService.loginValidator()) {
            EnableTopNavigationBar();
            blockUI.start();
            $("#loggedInUserWithTime").text(localStorage["userName"]);
            vm = defineModel(vm, $http);
            prepareInitialUI(vm);
            wireCommands(vm);
            blockUI.stop();
        }
        else {
            localStorage["userName"] = null;
            window.location = window.location.protocol + "//" + window.location.host + "/#/login";
            window.location.reload();
        }        
    };

    // used to define and assign initial values to the model properties
    function defineModel(vm, httpService)
    {
        vm.title = "Past Exchange Rates";
        vm.httpService = httpService;                 // http service
        vm.dateInput = '';
        vm.euroInput = '';
        vm.usdInput = '';
        vm.errorMsg = '';
        return vm;
    }

    // used to initialise the UI at the intial view load
    function prepareInitialUI(vm)
    {
        // set up the date picker
        $("#datePicker").datepicker({
            defaultDate: new Date(2015, 7, 31),         // 2015 Aug 31
            maxDate: new Date(2015, 7, 31),
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1,
            
            dateFormat: "dd/mm/yy",
            beforeShow: function () {
                $(".ui-datepicker").css('font-size', 12)
            },
            onClose: function (selectedDate) {
                $("#toDatePicker").datepicker("option", "minDate", selectedDate);
            }
        });

        drawExchangeRatesGrid(vm);
    }

    // binding commands to buttons
    function wireCommands(vm)
    {
        vm.saveExchangeRates = function (vm) {
            saveExchangeRates(vm);
        };

        vm.reset = function (vm) {
            resetInputFields(vm);
        };
    }

    // saving ERs
    function saveExchangeRates(vm)
    {        
        validateInputs(vm);
        if (vm.errorMsg == '')
        {
            // send data to serverside for saving
            vm.httpService({
                method: "get",
                headers: { 'Content-Type': 'application/json' },
                url: ('https://localhost:44302/api/exchangerate?date=' + vm.dateInput +'&euro=' + vm.euroInput + '&usd=' + vm.usdInput),
            }).success(function (data) {
                if (data.indexOf('Exchange rates updated for') != -1)       // if true -- insert success
                {
                    vm.dateInput = '';
                    vm.euroInput = '';
                    vm.usdInput = '';
                    drawExchangeRatesGrid(vm);                              // redraw ER grid
                }
                vm.errorMsg = data;
            }
            ).error(function (data) {
                // display error message
                alert('error - web service access')
            });
        }
    }

    // reset the input form fields
    function resetInputFields(vm)
    {        
        vm.dateInput = "";
        vm.euroInput = "";
        vm.usdInput = "";
        vm.errorMsg = "";
    }

    // used to validate user inputs
    function validateInputs(vm)
    {
        vm.errorMsg = '';
        // date validation
        try
        {
            if (vm.dateInput == '') {
                throw "no date selected";
            }
            else {
                new Date(vm.dateInput);
                vm.errorMsg = '';
            }
        }
        catch(error)
        {
            vm.errorMsg = "Error - Invalid Date input";
        }
        
        // euro validation
        if (vm.errorMsg == '')
        {
            if (vm.euroInput == '' || isNaN(vm.euroInput))
            {
                vm.errorMsg = "Error - Invalid Euro input";
            }
        }

        // usd validation
        if (vm.errorMsg == '') {
            if (vm.usdInput == '' || isNaN(vm.usdInput)) {
                vm.errorMsg = "Error - Invalid Usd input";
            }
        }
    }

    // used to draw exchange rate table for display purposes
    function drawExchangeRatesGrid(vm)
    {
        vm.httpService({
            method: "get",
            headers: { 'Content-Type': 'application/json' },
            url: ('https://localhost:44302/api/exchangerate'),
        }).success(function (data) {            
            $('#ersGrid').dataTable({
                "data": data,
                "aoColumns": [
                        { "mData": "dateER", "sTitle": "Date", "sClass": "right", "mRender": function (data, type, row) {
                                if (data != null) {
                                    return GetDateStr(data);
                                }
                            },
                            "aTargets": [0]
                        },
                        { "mData": "euroValue", "sTitle": "Euro", "sClass": "right", "mRender": function (data, type, row) {
                                if (data != null) {
                                    return RoundUpTo(data, 2);
                                }
                            },
                            "aTargets": [0]
                        },
                        {
                            "mData": "usdValue", "sTitle": "Usd", "sClass": "right", "mRender": function (data, type, row) {
                                if (data != null) {
                                    return RoundUpTo(data, 2);
                                }
                            },
                            "aTargets": [0]
                        },
                        {
                            "mData": "timeER", "sTitle": "Time", "bVisible": false , "sClass": "right", "mRender": function (data, type, row) {
                                if (data != null) {
                                    return GetTimeStrFromTimeSpan(data);
                                }
                            },
                            "aTargets": [0]
                        },
                        {
                            "mData": "manualInput", "sTitle": "Added manually?", "sClass": "right", "mRender": function (data, type, row) {
                                if (data == null) {
                                    return 'no';
                                }
                                else if (data == 'yes') {                                    
                                    return 'yes';
                                }
                                //alert(data);
                            },
                            "aTargets": [0]
                        },
                ],
                "bDestroy": true,
                "aLengthMenu": [[10, 25, 100, -1], [10, 25, 100, "All"]],
                "iDisplayLength": 10
            });
        }
        ).error(function (data) {
            // display error message
            alert('error - web service access')
        });
    }

    

}());