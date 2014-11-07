angular.module('appModule').controller("LocationsController", ["$scope", "cmService", "$http", "$location", function ($scope, cmService, $http, $location) {
    $(".page-area").height($(window).height() - 104);
    $scope.vendorName = cmService.vendorName;
    $scope.locationTemplate = $("#locationTemplate").html();
    $scope.selectedLocation = null;
    $scope.locations = [];

    $scope.getLocationList = function () {
        cmService.loaderScope.showLoader(true, "Loading Locations...");
        $http.get(cmService.baseURL + "webservices/LoadLocationsPublic/?vendorID=" + cmService.vendorID).success(function (data, status, headers, config) {
            if (data.Result == "OK") {
                angular.forEach(data.Locations, function (loc, index) {
                    loc.Thumbnail = cmService.getLocationThumb(loc.VendorLocationID);
                    loc.distance = "no";
                });
                $scope.locations = data.Locations;
                if (localStorage.getItem('LocationID') != null) {
                    var selectedlocid = parseInt(localStorage.getItem('LocationID'));
                    angular.forEach($scope.locations, function (loc, index) {
                        if (loc.VendorLocationID == selectedlocid) {
                            $scope.selectedLocation = loc;
                            cmService.selctedLocation = $scope.selectedLocation;
                            setTimeout(function () {
                                $("#"+selectedlocid).parent().addClass("listview-selected");
                            }, 1000);
                        }
                    });
                }
                else {
                    $scope.selectedLocation = $scope.locations[0];
                    localStorage.setItem('LocationID', $scope.selectedLocation.VendorLocationID);
                    localStorage.setItem('LocationName', $scope.selectedLocation.LocationName);
                    cmService.selctedLocation = $scope.selectedLocation;
                    setTimeout(function () {
                        $("#loclist li:first-child").addClass("listview-selected");
                    }, 1000);
                }
                cmService.loaderScope.showLoader(false, null);
                //$scope.findCurrentLoc();
            }
        })
        .error(function (data, status, headers, config) {
            cmService.loaderScope.showLoader(false, null);
        });
    }

    $scope.getLocationList();

    $scope.locationClick = function (e) {
        if (e) {
            $(".listview-selected").toggleClass("listview-selected");
            e.item.toggleClass("listview-selected");
            $scope.selectedLocation = e.dataItem;
        }
    }

    $scope.setCurrentLocation = function (e) {
        if ($scope.selectedLocation != null) {
            cmService.selctedLocation = $scope.selectedLocation;
            localStorage.setItem('LocationID', $scope.selectedLocation.VendorLocationID);
            localStorage.setItem('LocationName', $scope.selectedLocation.LocationName);
            window.history.back();
        }
        else {
            alert("Please select location first");
        }
    }

    $scope.showMap = function () {
        var url = 'geo:0,0?q=' + $scope.selectedLocation.Latitude + ',' + $scope.selectedLocation.Longitude + " (" + cmService.vendorName+", " + $scope.selectedLocation.LocationName + ")";
        window.location = url;
    }

    var onGeoSuccess = function (position) {
        $scope.currentLat = position.coords.latitude;
        $scope.currentLong = position.coords.longitude;
        if ($scope.locations) {
            angular.forEach($scope.locations, function (loc, index) {
                loc.distance = getDistanceFromLatLonInKm($scope.currentLat, $scope.currentLong, loc.Latitude, loc.Longitude);
            });
            $scope.locations.sort(function (a, b) { return parseFloat(a.distance) - parseFloat(b.distance) });
            $("#loclist").data("kendoMobileListView").dataSource.read();
            //$("#loclist li:first-child").addClass("listview-selected");
            //$scope.selectedLocation = $scope.locations[0];
            $("#" + $scope.selectedLocation.VendorLocationID).parent().addClass("listview-selected");
            cmService.loaderScope.showLoader(false, null);
        }
    };

    // onError Callback receives a PositionError object
    //
    function onGeoError(error) {
        if (error.code == error.PERMISSION_DENIED) {
            alert("Please enable location services to use this feature");
        }
        else {
            alert("Timeout while getting your location, please check if your location service is enabled");
        }
        //$scope.selectedLocation = $scope.locations[0];
        //$("#loclist li:first-child").addClass("listview-selected");
        //$("#" + $scope.selectedLocation.VendorLocationID).parent().addClass("listview-selected");
        cmService.loaderScope.showLoader(false, null);
    }

    $scope.findCurrentLoc = function () {
        cmService.loaderScope.showLoader(true, "Finding near by locations");
        var geoOptions = {
            timeout: 5000
        }
        navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, geoOptions);
    }
}]);

//Using Haversine formula to calculate distance between two lat,longs
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}