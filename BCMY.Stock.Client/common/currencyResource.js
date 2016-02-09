// IIFE to manage currency entity related DAO
(function () {

    "use strict";

    angular
        .module("common.services")
        .factory("currencyResource",
                ["$resource",
                 "appSettings",
                    currencyResource])

    function currencyResource($resource, appSettings) {
        return $resource(appSettings.serverPath + "/api/currency/:id", null, {
            'update': { method: 'PUT' }
        });
    }

}());