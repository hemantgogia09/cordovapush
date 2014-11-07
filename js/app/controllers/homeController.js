angular.module('appModule').controller("HomeController", ["$scope", "cmService", "$location", "$http", function ($scope, cmService, $location, $http) {
	
	$scope.vendorName = cmService.vendorName;
	
	$scope.gotoLocation = function(){
		$location.path("/location");
	}

	$scope.getVendorDetails = function () {
	    cmService.loaderScope.showLoader(true, "Please wait...");
	    $http.get(cmService.baseURL + "webservices/GetDetialsByShortName/" + cmService.shortName).success(function (data, status, headers, config) {
	        if (data.Result == "OK") {
	            window.localStorage['shortname'] = cmService.shortName;
	            if (data.Data != null) {
	                if (data.Data.VendorDetails != null) {
	                    window.localStorage['vendorID'] = cmService.vendorID = data.Data.VendorDetails.VendorID;
	                    window.localStorage['vendorName'] = $scope.vendorName = cmService.vendorName = data.Data.VendorDetails.BusinessName;
	                    window.localStorage['dateFormat'] = data.Data.DisplayLabels.DateFormat;
	                    window.localStorage['numberFormatOptions'] = JSON.stringify(data.Data.DisplayLabels.NumberFormatOptions);
	                    if (!window.localStorage['dateUpdated'] || window.localStorage['dateUpdated'] == null) {
	                        window.localStorage['dateUpdated'] = data.Data.VendorDetails.DateUpdated;
	                        $scope.getVendorSlides();
	                    }
	                    else {
	                        var dateUpdatedNew = new Date(parseInt(data.Data.VendorDetails.DateUpdated.substr(6)));
	                        var dateUpdatedOld = new Date(parseInt(window.localStorage['dateUpdated'].substr(6)));
	                        if (dateUpdatedNew.getTime() != dateUpdatedOld.getTime()) {
	                            $scope.getVendorSlides();
	                        }
	                        else {
	                            if (!window.localStorage['vendorSlides'] || window.localStorage['vendorSlides'] == null) {
	                                $scope.getVendorSlides();
	                            }
	                            else {
	                                $scope.vendorslides = JSON.parse(window.localStorage['vendorSlides']);
	                                setTimeout(function () {
	                                    // Initializing flexslider
	                                    $('.flexslider').flexslider({
	                                        animation: "slide",
	                                        touch: true
	                                    });
	                                }, 50);
	                                cmService.loaderScope.showLoader(false, null);
	                            }
	                        }
	                    }
	                }
	            }
	        }
	        else {
	            cmService.loaderScope.showLoader(false, null);
	        }
	        cmService.vendorLoaded = true;
	        $scope.registerNotificationHub();
	    })
	    .error(function (error) {
	        cmService.loaderScope.showLoader(false, null);
	    });
	}

	$scope.registerNotificationHub = function () {
	    var mobileClient = new WindowsAzure.MobileServiceClient(cmService.MOBILE_SERVICE_URL, cmService.MOBILE_SERVICE_APP_KEY);

	    // Create the integrated Notification Hub client.
	    var hub = new NotificationHub(mobileClient);

	    var tags = ["VID:" + cmService.vendorID];
	    if (window.localStorage.getItem("LocationID")) {
	        tags.push("LID:" + window.localStorage.getItem("LocationID"));
	    }

	    if (mobileClient && window.localStorage.getItem("pushPlatform") == "gcm") {
	        // Template registration.
	        var template = "{ \"data\" : {\"message\":\"$(message)\",\"title\":\"$(title)\"}}";

	        // Register for notifications.
	        // (gcmRegId, ["tag1","tag2"], templateName, templateBody)
	        hub.gcm.register(window.localStorage.getItem("RegID"), tags, "myTemplate", template).done(function () {
	            console.log("Registered with hub!");
	        }).fail(function (error) {
	            console.log("Failed registering with hub: " + error);
	        });
	    }
	    else if (mobileClient && window.localStorage.getItem("pushPlatform") == "apns") {
	        // This is a template registration.
	        var template = "{\"aps\":{\"alert\":\"$(message)\",\"title\":\"$(title)\"}}";

	        // Register for notifications.
	        // (deviceId, ["tag1","tag2"], templateName, templateBody, expiration)
	        hub.apns.register(window.localStorage.getItem("RegID"), tags, "myTemplate", template, null).done(function () {
	            console.log("Registered with hub!");
	        }).fail(function (error) {
	            console.log("Failed registering with hub: " + error);
	        });
	    }
	    else if (mobileClient && window.localStorage.getItem("pushPlatform") == "mpns") {
	        // This is a template registration.
	        var template = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
                "<wp:Notification xmlns:wp=\"WPNotification\">" +
                    "<wp:Toast>" +
                        "<wp:Text1>$(message)</wp:Text1>" +
                        "<wp:Text2>$(title)</wp:Text2>" +
                    "</wp:Toast>" +
                "</wp:Notification>";

	        // Register for notifications.
	        // (channelUri, ["tag1","tag2"] , templateName, templateBody)
	        hub.mpns.register(window.localStorage.getItem("RegID"), tags, "myTemplate", template).done(function () {
	            console.log("Registered with hub!");
	        }).fail(function (error) {
	            console.log("Failed registering with hub: " + error);
	        });
	    }
	    else {
	        console.log("No push platform found");
	    }
	}

	$scope.vendorslides = [
        "img/slide1.jpg",
        "img/slide2.jpg",
        "img/slide3.jpg"
	];


	$scope.getVendorSlides = function () {
	    cmService.loaderScope.showLoader(true, "Please wait...");
	    $http.get(cmService.baseURL + "book/GetVendorImages").success(function (data, status, headers, config) {
	        if (data.Result == "OK") {
	            $scope.vendorslides = [];
	            angular.forEach(data.Data, function (img, index) {
	                img = "http:" + img;
	                $scope.vendorslides.push(img);
	            });
	            window.localStorage['vendorSlides'] = JSON.stringify($scope.vendorslides);
	        }
	        else {
	        }
	        cmService.loaderScope.showLoader(false, null);
	        setTimeout(function () {
	            // Initializing flexslider
	            $('.flexslider').flexslider({
	                animation: "slide",
	                touch: true
	            });
	        }, 50);
	    })
	    .error(function (error) {
	        cmService.loaderScope.showLoader(false, null);
	    });
	}

	if (!window.localStorage['vendorID'] || window.localStorage['vendorID'] == null || !cmService.vendorLoaded) {
	    $scope.getVendorDetails();
	}
	else {
	    cmService.loaderScope.showLoader(false, null);
	    $scope.vendorslides = JSON.parse(window.localStorage['vendorSlides']);
	    setTimeout(function () {
	        // Initializing flexslider
	        $('.flexslider').flexslider({
	            animation: "slide",
	            touch: true
	        });
	    }, 50);
	}

	$scope.loadOffers = function () {
	    var ref = window.open("http://" + cmService.shortName + ".customermantra.com/bookwidget/offers", '_system');
	}

	$scope.footerURL = "http://az177188.vo.msecnd.net/static/customermantra/images/logo.png?ver=" + new Date().getDate();
}]);