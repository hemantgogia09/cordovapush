angular.module('appModule').controller("ContactController", ["$scope","cmService", function ($scope,cmService) {
	$scope.vendorName = cmService.vendorName;
}]);