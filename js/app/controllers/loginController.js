angular.module('appModule').controller("LoginController", ["$scope","cmService","$http","$window", function ($scope,cmService,$http,$window) {
    $scope.vendorName = cmService.vendorName;
    $scope.RegisterNew = false;
    $scope.userDetails = {
        userName: "",
        userpass: ""
    }

    $scope.NewCustomerEntity = null;

	$scope.LoginUser = function () {
	    cmService.loaderScope.showLoader(true, "Loging in...");
	    $http.post(cmService.baseURL + "Book/AjaxLogin", $scope.userDetails).success(function (data, status, headers, config) {
	        if (data.Result == "OK") {
	            window.localStorage['username'] = data.Data;
	            window.localStorage['auth'] = "YES";
	            $window.history.back();
	        }
	        else {
	            alert("username or password is wrong");
	        }
	        cmService.loaderScope.showLoader(false, null);
	    })
	    .error(function (data, status, headers, config) {
	        cmService.loaderScope.showLoader(false, null);
	    });
	}

	$scope.openSignUp = function () {
	    $scope.NewCustomerEntity = {
	            AddressLine1: "",
	            AddressLine2: "",
	            City: "",
	            Country: "",
	            FirstName: "",
	            LastName: "",
	            Mobile: "",
	            Phone: "",
	            State: "",
	            Terms: false,
	            custPass: "",
	            email: "",
	            subscription: false,
	            userName: ""
	    }
	    $scope.RegisterNew = true;
	}

	$scope.SignupUser = function () {
	    cmService.loaderScope.showLoader(true, "Signing Up...");
	    $http.post(cmService.baseURL + "Book/registerNewcust", $scope.NewCustomerEntity).success(function (data) {
	        if (data.Result == "OK") {
	            if (data.Data > 0) {
	                alert("Successfully Registered. We have sent you an e-mail with verification details. Please check your mail for details on how to proceed.");
	                $scope.NewCustomerEntity = null;
	                $scope.RegisterNew = false;
	            }
	            else {
	                alert("The requested username is already taken. Please try another username");
	            }
	        }
	        else {
	            alert("Oops!. There seems to be an error in the registration, please try again.");
	        }
	        cmService.loaderScope.showLoader(false, null);
	    })
        .error(function (data) {
            cmService.loaderScope.showLoader(false, null);
        });
	}

	$scope.SignupUserFacebook = function () {
	    cmService.loaderScope.showLoader(true, "Siging Up...");
		$scope.CustomerInfo.UserName = $scope.CustomerInfo.Email;
	    var OauthModel =
        {
            CustomerDetailEntity: $scope.CustomerInfo,
            OauthCredentialInfo: $scope.OauthCustomerInfo
        }
	    $http.post(cmService.baseURL + "Auth/RegisterOauthCustomer/", OauthModel).success(function (result, status, headers, config) {
	        if (result.Result == "OK") {
	            if ((result.Data.Success) && Math.abs(result.Data.StatusCode) == 1) {
	                //done
	                $scope.RegisterNew = false;
	                window.localStorage['auth'] = "YES";
	                $window.history.back();
	            }
	        }
	        else {
	            alert("Error! Unable to register try again ");
	        }
	        cmService.loaderScope.showLoader(false, null);
	    })
	    .error(function (data, status, headers, config) {
	        cmService.loaderScope.showLoader(false, null);
	    });
	}

	$scope.AuthUserFacebook = function (accesToken, userId, user) {
	    cmService.loaderScope.showLoader(true, "Checking login...");
	    var userInfo = {
	        UserName: userId,
	        OAuthAccessToken: accesToken,
	        OAuthUserID: userId,
	        ProviderName: "fb",
	        Email: user.email,
	        FirstName: user.first_name,
	        LastName: user.last_name
	    }

	    $http.post(cmService.baseURL + "Auth/authchecker/",userInfo).success(function (result, status, headers, config) {
	        if (result.Result == "OK") {
	            if ((!result.Data.Success) && Math.abs(result.Data.StatusCode) == 404) {
	                $scope.CustomerInfo = result.Data.CustomerDetails;
	                $scope.OauthCustomerInfo = userInfo;
	                $scope.RegisterNew = true;
	            }
	            else if ((!result.Data.Success) && Math.abs(result.Data.StatusCode) == 405) {
	                alert("Oops!. This user is not yet approved");
	            }
	            else if ((result.Data.Success) && Math.abs(result.Data.StatusCode) == 1) {
	                //done
	                window.localStorage['auth'] = "YES";
	                $window.history.back();
	            } else {
	                alert("Oops!. Error on login. Please try again");
	            }
	        }
	        cmService.loaderScope.showLoader(false, null);
	    })
	    .error(function (data, status, headers, config) {
	        cmService.loaderScope.showLoader(false, null);
	    });
	}

	$scope.facebookLogin = function () {
	    cmService.loaderScope.showLoader(true, "Connecting with facebook...");
	    if (!window.cordova) {
	        var appId = prompt("Enter app id", "311885492205755");
	        facebookConnectPlugin.browserInit(appId);
	    }
	    facebookConnectPlugin.login(["email"],
            function (successResponse) {
                facebookConnectPlugin.api("/me", [],
                    function (userInfo) {
                        window.localStorage['FBAccessToken'] = successResponse.authResponse.accessToken;
                        $scope.AuthUserFacebook(successResponse.authResponse.accessToken, successResponse.authResponse.userID, userInfo);
                    },
                    function (fbError) {
                        alert(JSON.stringify(fbError));
						cmService.loaderScope.showLoader(false, null);
                    });
            },
            function (errorResponse) {
                alert(JSON.stringify(errorResponse));
				cmService.loaderScope.showLoader(false, null);
            });
	}
}]);