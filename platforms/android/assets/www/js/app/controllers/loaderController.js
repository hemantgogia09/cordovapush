angular.module('appModule').controller("LoaderController", ["$scope", "cmService", function ($scope, cmService) {
    $scope.loaderText = "Loading...";
    $scope.loaderSignal = false;
    $scope.showLoader = function (isShow, message) {
        $scope.loaderText = "Loading...";
        $scope.loaderSignal = isShow;
        if (message) {
            $scope.loaderText = message;
        }
        setTimeout(function () {
            $scope.$apply();
        }, 1000);
    }
    cmService.loaderScope = $scope;

}]);