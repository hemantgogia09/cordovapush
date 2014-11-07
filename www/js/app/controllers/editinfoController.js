angular.module('appModule').controller("EditInfoController", ["$scope", "cmService", "$http", "$location", function ($scope, cmService, $http, $location) {
    $scope.goBack = function () {
        window.history.back();
    }
    $scope.userInfo = cmService.userInfo;
	if($scope.userInfo.Mobile)
		$scope.userInfo.Mobile = Number($scope.userInfo.Mobile);

    $scope.updateUser = function () {
        cmService.loaderScope.showLoader(true, "Updating your information...");
        $http.post(cmService.baseURL + "book/UpdateNew", $scope.userInfo).success(function (result) {
            if (result.Result == "OK") {
                alert("Your information has been updated");
				$scope.goBack();
            }
            else {
                alert("Error while updating information, please try again");
            }
            cmService.loaderScope.showLoader(false, null);
        })
        .error(function (error) {
            cmService.loaderScope.showLoader(false, null);
        });
    }
}]);