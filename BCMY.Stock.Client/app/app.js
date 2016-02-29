// IIFE to manage main module of the Stock application - commited to Git Hub - 18 Aug 2015 - #

(function () {

    "use strict";
    var app = angular.module("stockManagement",
                               ["ui.router", "common.services", "ngFileUpload", "blockUI"]);
  

    app.config(["$stateProvider",
                "$urlRouterProvider",
                "blockUIConfig",
                "$locationProvider",
                function ($stateProvider, $urlRouterProvider, blockUIConfig, $locationProvider) {
                        
                        //$locationProvider.html5Mode(true);
                        //$locationProvider.html5Mode({
                        //    enabled: true,
                        //    requireBase: false
                        //});                                               

                        // user login
                        $stateProvider.state("login", {
                            url: "/login",
                            templateUrl: "app/login/userLogin.html",
                            controller: "UserLoginCtrl as vm"
                        })

                        .state("dashboard", {
                            url: "/dashboard",
                            templateUrl: "app/dashboard/dashboardView.html",
                            controller: "DashboardCtrl as vm"
                        })
                        // customerSuppliers
                        .state("customerSupplierList", {
                            url: "/customerSupplier",
                            templateUrl: "app/customerSupplier/customerSupplierListView.html",
                            controller: "CustomerSupplierListCtrl as vm"
                        })
                        // contact
                        .state("contactList", {
                            url: "/contact",
                            templateUrl: "app/contact/contactListView.html",
                            controller: "ContactListCtrl as vm"
                        })
                        // sales orders
                        .state("searchSalesOrders", {
                            url: "/order/salesOrder/search",
                            templateUrl: "app/order/salesOrder/searchSalesOrdersView.html",
                            controller: "SearchSalesOrdersCtrl as vm"
                        })
                        .state("addEditSalesOrders", {
                            url: "/order/salesOrder/addSalesOrder",
                            templateUrl: "app/order/salesOrder/addEditSalesOrderView.html",
                            controller: "AddEditSalesOrderCtrl as vm"
                        })
                        // edit sales order
                        .state("editSalesOrders", {
                            url: "/order/salesOrder/editSalesOrder",
                            templateUrl: "app/order/salesOrder/editSalesOrderView.html",
                            controller: "EditSalesOrderCtrl as vm"
                        })

                        // Past data - exchange rates
                        .state("addPastExchangeRates", {
                            url: "/order/pastData/pastExchangeRates/addPastExchangeRates",
                            templateUrl: "app/order/pastData/pastExchangeRates/AddPastExchangeRates.html",
                            controller: "AddPastExchangeRatesCtrl as vm"
                        })
                        // Past data - add sales orders
                        .state("addPastSalesOrders", {
                            url: "/order/pastData/pastSalesOrder/addPastSalesOrders",
                            templateUrl: "app/order/pastData/pastSalesOrder/AddPastSalesOrders.html",
                            controller: "AddPastSalesOrdersCtrl as vm"
                        })
                        // Past data - edit sales orders
                        .state("editPastSalesOrder", {
                            url: "/order/pastData/pastSalesOrder/editPastSalesOrder",
                            templateUrl: "app/order/pastData/pastSalesOrder/EditPastSalesOrder.html",
                            controller: "EditPastSalesOrderCtrl as vm"
                        })

                        // Amend stock quantities
                        .state("amendStock", {
                            url: "/product/amendStock",
                            templateUrl: "app/product/AmendStock.html",
                            controller: "AmendStockCtrl as vm"
                        })

                        // upload excel
                        .state("excelUpload", {
                            url: "/excelUpload/excelFiles",
                            templateUrl: "app/excelUpload/ExcelUpload.html",
                            controller: "ExcelUploadCtrl as vm"
                        })

                        // role mangement
                        .state("roleManagement", {
                            url: "/admin/roles",
                            templateUrl: "app/admin/role/roleListView.html",
                            controller: "RoleListCtrl as vm"
                        })

                        // landing page
                        $urlRouterProvider.otherwise("/login");
                    }
                ]
    );
}());