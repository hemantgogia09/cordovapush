angular.module('appModule').controller("MyinfoController", ["$scope", "cmService", "$http", "$location", function ($scope, cmService, $http, $location) {
    $scope.userDetails = null;
    $scope.logoutUser = function () {
        facebookConnectPlugin.logout(
            function (successResponse) {
                //window.localStorage['auth'] = "NO";
            },
            function (errorResponse) {
                //alert("Error while loging out of your facebook, please try again");
            });
        window.localStorage['auth'] = "NO";
        cmService.isPreviousPageVisited = false;
        alert("You have been successfully logged out");
        window.history.back();

    }

    $scope.gotoEditInfo = function () {
        cmService.userInfo = $scope.userDetails;
        $location.path("/editinfo");
    }

    $scope.gotoMyVisits = function () {
        cmService.userInfo = $scope.userDetails;
        $location.path("/myvisits");
    }

    $scope.getUserDetails = function () {
        cmService.loaderScope.showLoader(true, "Loading your information...");
        $http.get(cmService.baseURL + "book/Details").success(function (result) {
            if (result.Result == "OK") {
                result.Data.TotalPaid = cmService.formatMoney(result.Data.TotalPaid);
                result.Data.PendingAmount = cmService.formatMoney(result.Data.PendingAmount);
                result.Data.userDP = cmService.getUserDP(result.Data.CustomerDetailsID);
				result.Data.ValueCardBalance = cmService.formatMoney(result.Data.ValueCardBalance);
                $scope.userDetails = result.Data;
            }
            else if (result.Result == "UN") { //If user is admin
                alert("you are logged in with admin account");
                window.localStorage['auth'] = 'NO';
                //$location.path("/login");
            }
            else {
                //something happened ask user to relogin
                $location.path("/login");
                //window.history.back();
            }
            cmService.loaderScope.showLoader(false, null);
        }).
        error(function (data) {
            cmService.loaderScope.showLoader(false, null);
        });
    }
    if (!window.localStorage['auth'] || window.localStorage['auth'] != 'YES') {
        if (!cmService.isPreviousPageVisited) {
            $location.path("/login");
            cmService.isPreviousPageVisited = true;
        }
        else {
            $location.path("/home");
            cmService.isPreviousPageVisited = false;
        }
    }
    else {
        $scope.getUserDetails();
    }
}]);