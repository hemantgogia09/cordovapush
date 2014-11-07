angular.module('appModule').controller("ServicesController", ["$scope", "cmService", "$http", "$location", "$routeParams", "$window", "$sce", "$anchorScroll", "$filter", function ($scope, cmService, $http, $location, $routeParams, $window, $sce, $anchorScroll, $filter) {
    $scope.vendorName = cmService.vendorName;
    $(".page-area").height($(window).height() - 52);
    $scope.categoryTemplate = $("#categoryTemplate").html();
    $scope.isSubCat = false;
    $scope.isService = false;
    $scope.showAddtoCart = false;
    $scope.showRequestForm = false;
    $scope.subCatTitle = "";
    $scope.categories = [];
    $scope.cartServices = [];
    $scope.availableSlots = [];
    $scope.Sessions = ["Morning", "Afternoon", "Evening", "Night"];
    $scope.checkoutFlow = cmService.checkoutFlow;
    $scope.LocationID = 0;
    $scope.LocationName = "";
    if (localStorage.getItem('LocationID')) {
        $scope.LocationID = parseInt(localStorage.getItem('LocationID'));
        $scope.LocationName = localStorage.getItem('LocationName');
    }
    else {
        $location.path("/locations")
    }
   
    $scope.getServices = function () {
        cmService.loaderScope.showLoader(true, "Loading Sevices...");
        //Cheking if category/service is clicked
        if ($routeParams.serviceType) {
            try{
                $scope.categories = [];
                $scope.serviceType = $routeParams.serviceType;
                //If category is clicked
                if ($routeParams.serviceType == "category") {
                    $scope.isSubCat = true;
                    if (cmService.categoryList) {
                        var catFound = false; //Variable to check if clicked category is found from list
                        angular.forEach(cmService.categoryList.SubCategory, function (cat1, index) {
                            if (!catFound && cat1.CategoryID == parseInt($routeParams.serviceID)) { //Checking for clicked category from list
                                if ($scope.isSubCat)//for showing pagetitle if subcategory is clicked
                                    $scope.subCatTitle = cat1.CategoryName;
                                angular.forEach(cat1.SubCategory, function (cat, index) {
                                    cat.ThumbnailImageURL = "http:" + cat.ThumbnailImageURL;
                                    $scope.categories.push(cat);
                                });
                                if ($scope.categories == null) {
                                    $scope.categories = [];
                                }
                                //GET call to get services by categoryID
                                $http.get(cmService.baseURL + "services/GetServicesByCategoryID/" + cat1.CategoryID).success(function (result, status, headers, config) {
                                    if (result.Result == "OK") {
                                        angular.forEach(result.Data, function (service, index) {
                                            service.ThumbnailImageURL = "http:" + service.ThumbnailImageURL;
                                            $scope.categories.push(service);
                                        });
                                    }
                                    cmService.loaderScope.showLoader(false, null);
                                }).
                                error(function (data, status, headers, config) {
                                    cmService.loaderScope.showLoader(false, null);
                                });
                                catFound = true;
                            }
                            if (!catFound) {
                                //Looping through subcategories same as above
                                angular.forEach(cat1.SubCategory, function (cat2, index) {
                                    if (!catFound && cat2.CategoryID == parseInt($routeParams.serviceID)) {
                                        if ($scope.isSubCat)//for showing pagetitle if subcategory is clicked
                                            $scope.subCatTitle = cat2.CategoryName
                                        angular.forEach(cat2.SubCategory, function (cat, index) {
                                            $scope.categories.push(cat);
                                        });
                                        if ($scope.categories == null) {
                                            $scope.categories = [];
                                        }
                                        //GET call to get services by categoryID
                                        $http.get(cmService.baseURL + "services/GetServicesByCategoryID/" + cat2.CategoryID).success(function (result, status, headers, config) {
                                            if (result.Result == "OK") {
                                                angular.forEach(result.Data, function (service, index) {
                                                    service.ThumbnailImageURL = "http:" + service.ThumbnailImageURL;
                                                    $scope.categories.push(service);
                                                });
                                            }
                                            cmService.loaderScope.showLoader(false, null);
                                        }).
                                        error(function (data, status, headers, config) {
                                            cmService.loaderScope.showLoader(false, null);
                                        });
                                        catFound = true;
                                    }
                                });
                            }
                        });
                    }
                }
                    //If service is clicked
                else {
                    $scope.isService = true;
                    $scope.selectedService = cmService.selectedService;
                    if (typeof $scope.selectedService.WebContent == "string") {
                        $scope.selectedService.WebContent = $sce.trustAsHtml($scope.selectedService.WebContent);
                    }
                    $scope.selectedService.CoverImageURL = "https:"+$scope.selectedService.CoverImageURL + "?var=" + new Date().getDate();
                    setTimeout(function () {
                        var mySwiper = $('.swiper-container').swiper({
                            mode: 'horizontal',
                            loop: true,
                            //autoplay: 5000,
                            pagination: '.pagination',
                            paginationClickable: true
                        });
                        $(".swiper-container").height($(".swiper-container .image_single").height() + 15);
                    }, 1000);
                    cmService.loaderScope.showLoader(false, null);
                }
            }
            catch (error) { //If user presses back button after booking appointment
                cmService.loaderScope.showLoader(false, null);
                $location.path("/");
            }
        }
        //If loading for first time
        else { 
            $http.get(cmService.baseURL + "book/GetFormatedCategories/?id="+$scope.LocationID).success(function (result, status, headers, config) {
                if (result.Result == "OK") {
                    //Assigning thumbnail url for categories including subcategories
                    angular.forEach(result.Data[0].SubCategory, function (cat, indx) {
                        cat.Thumbnail = cmService.getCategoryThumb(cat.CategoryID);
                        if (cat.SubCategory) {
                            angular.forEach(cat.SubCategory, function (cat2, indx) {
                                cat2.Thumbnail = cmService.getCategoryThumb(cat2.CategoryID);
                            });
                        }
                    });
                    cmService.categoryList = result.Data[0];
                    $scope.categories = result.Data[0].SubCategory;
                    if (result.Data[0].Services) {
                        angular.forEach(result.Data[0].Services, function (service, index) {
                            $scope.categories.push(service);
                        });
                    }
                    //checking if any service is already added in cart using localStorage
                    if (localStorage.getItem('cartServices') && cmService.cart.services.length == 0) {
                        var cartItems = JSON.parse(localStorage.getItem('cartServices'));
                        angular.forEach(cartItems, function (service, index) {
                            $scope.cartCount += 1;
                            cmService.cart.services.push(service);
                            $scope.cartServices.push(service);
                        });
                    }
                }
                else if (result.Result == "UNAUTH") {
                    $location.path("/login");
                }
                else {
                    alert("alert while loading data");
                }
                cmService.loaderScope.showLoader(false, null);
            }).
            error(function (data, status, headers, config) {
                cmService.loaderScope.showLoader(false, null);
            });
        }
    }

    $scope.today = $filter("date")(Date.now(), 'yyyy-MM-ddTHH:mm');

    $scope.bookNow = function () {
        if ($scope.checkoutFlow == 0) {
            $scope.formInfo = {
                DateRequested: $scope.today,
                ServiceName: $scope.selectedService.ServiceDisplayName,
                LocationName: $scope.LocationName
            }
            $scope.showRequestForm = true;
        }
        else if ($scope.checkoutFlow > 0) {
            if (!window.localStorage['auth'] || window.localStorage['auth'] != 'YES') {
                $location.path("/login");
                return;
            }
            $scope.showAddtoCart = true;
            $scope.date = {
                slotDate: $filter("date")(Date.now(), 'yyyy-MM-dd')
            }
        }
        else{

        }
    }

    var Staff = function () {
        this.ResourceID = 0;
        this.ResourceName = "";
        this.TimeSlots = null;
    }

    var SessionTimeSlot = function () {
        this.Session = null;
        this.Slots = [];
    }

    var FormatSlot = function (tmslt) {
        var ahour = tmslt.hour % 12;
        if (ahour == 0)
            ahour = 12;
        var ampm = "AM";
        if (tmslt.hour > 11)
            ampm = "PM";
        var filler = tmslt.min < 10 ? "0" : "";
        var rstr = ahour.toString() + ":" + filler + tmslt.min.toString() + " " + ampm;
        return rstr;
    };

    var FillSlots = function (TimeSlot, tmslt) {
        if (tmslt.hour >= 5 && tmslt.hour < 12) {
            tmslt.TextFormat = FormatSlot(tmslt);
            TimeSlot[0].Slots.push(tmslt);
        }
        if (tmslt.hour >= 12 && tmslt.hour < 16) {
            tmslt.TextFormat = FormatSlot(tmslt);
            TimeSlot[1].Slots.push(tmslt);
        }
        if (tmslt.hour >= 16 && tmslt.hour < 22) {
            tmslt.TextFormat = FormatSlot(tmslt);
            TimeSlot[2].Slots.push(tmslt);
        }
        if (tmslt.hour >= 22 && tmslt.hour < 5) {
            tmslt.TextFormat = FormatSlot(tmslt);
            TimeSlot[3].Slots.push(tmslt);
        }
        return TimeSlot;
    };

    var resourse = function (id, name) {
        this.ResourceID = id;
        this.ResourceName = name;
    }


    $scope.FilteredTimeSlots = [];
    $scope.ResourceList = [];
    $scope.selectedResource = null;

    $scope.checkAvl = function () {
        cmService.loaderScope.showLoader(true, "Checking available slots");
        var now = new Date();
        $scope.FilteredTimeSlots = [];
        $http.get(cmService.baseURL + "Book/StaffAvailability/" + $scope.LocationID + "/" + $scope.selectedService.ServiceID + "?date=" + new Date($scope.date.slotDate).toPlanoLocalDateString() + "&DisType=" + $scope.checkoutFlow + "&clientDay=" + now.getDate() + "&clientHour=" + now.getHours() + "&clientMinute=" + now.getMinutes()).success(function (result, status, headers, config) {
            if (result.Result == "OK") {
                angular.forEach(result.Data, function (stf, index) {
                    var staff = new Staff();
                    staff.ResourceID = stf.staffid;
                    staff.ResourceName = stf.stffirstname + (stf.stflastname != null ? (" " + stf.stflastname) : "");
                    if ($scope.checkoutFlow == 2) {
                        var resource = new resourse(staff.ResourceID, staff.ResourceName);
                        if (index == 0) {
                            $scope.selectedResource = resource;
                        }
                        $scope.ResourceList.push(resource);
                    }

                    var TimeSlot = [];
                    for (var i = 0; i < $scope.Sessions.length; i++) {
                        var tm = new SessionTimeSlot();
                        tm.Session = $scope.Sessions[i];
                        TimeSlot.push(tm);
                    }

                    if (stf.timeslots.length > 0) {
                        angular.forEach(stf.timeslots, function (tms,i) {
                            var timslt = FillSlots(TimeSlot, tms);
                            staff.TimeSlots = timslt;
                        });
                    }
                    $scope.FilteredTimeSlots.push(staff);
                });
                cmService.loaderScope.showLoader(false, null);
            }
            else {
                alert("No slots available");
                cmService.loaderScope.showLoader(false, null);
            }
        }).
        error(function (data, status, headers, config) {
            cmService.loaderScope.showLoader(false, null);
        });
    }

    $scope.RequestApt = function () {
        if ($scope.LocationID == 0) {
            $location.path("/locations");
            return;
        }
        cmService.loaderScope.showLoader(true, "Sending Request");
        $http.post(cmService.baseURL + "Book/SendCustomerBookMail/?LocationID=" + $scope.LocationID, $scope.formInfo).success(function (result, status, headers, config) {
            if (result.Result == "OK") {
                alert("Request submitted successfully");
                $location.path("/");
            }
            cmService.loaderScope.showLoader(false, null);
        })
        .error(function (data, status, headers, config) {
            cmService.loaderScope.showLoader(false, null);
        });
    }

    $scope.saveCart = function () {
        cmService.loaderScope.showLoader(true, "Booking Appointment");
        $http.post(cmService.baseURL + "book/SaveCart?type=3", $scope.cartServices).success(function (result, status, headers, config) {
            if (result.Result == "OK") {
                cmService.cart.services = [];
                localStorage.setItem("cartServices", JSON.stringify(cmService.cart.services));
                alert("Appointment booked successfully");
                $location.path("/");
            }
            else {
                alert("Couldn't book appointment try again");
            }
            cmService.loaderScope.showLoader(false, null);
        }).
        error(function (data, status, headers, config) {
            cmService.loaderScope.showLoader(false, null);
        });
    }

    $scope.SelectedTimeSlot = null;
    $scope.slotClicked = function (slot) {
        $scope.SelectedTimeSlot = slot;
    };

    $scope.cartCount = cmService.cart.services.length;
    $scope.addtocart = function () {
        if ($scope.SelectedTimeSlot == null) {
            alert("Please select any timeslot")
            return;
        }
        else {
            var isAdded = false;
            angular.forEach(cmService.cart.services, function (service, index) {
                if (service.ServiceDetail.TextFormat == $scope.SelectedTimeSlot.TextFormat) {
                    isAdded = true;
                }
                if (isAdded)
                    return;
            });
            var StaffName = "";
            angular.forEach($scope.FilteredTimeSlots, function (slot, index) {
                if ($scope.SelectedTimeSlot.staffid == slot.ResourceID)
                    StaffName = slot.ResourceName;
            });
            var chkoutitem = {
                Type: 1,
                LocID: $scope.LocationID,
                LocName: $scope.LocationName,
                ServiceDetail: $scope.SelectedTimeSlot,
                ServiceName: $scope.selectedService.ServiceDisplayName,
                StaffName: StaffName,
                serviceDate: new Date($scope.date.slotDate).toPlanoLocalDateString(),
                CustomFieldSections: null,
                displaytype: $scope.checkoutFlow.toString()
            };
            if (!isAdded) {
                $scope.cartCount += 1;
                cmService.cart.services.push(chkoutitem);
                $scope.cartServices = cmService.cart.services;
                localStorage.setItem("cartServices", JSON.stringify($scope.cartServices));
                $("#cart-window").kendoMobileModalView("open");
            }
            else {
                alert("This time slot is already added to cart");
            }
        }
    }

    $scope.openCart = function () {
        $scope.cartServices = cmService.cart.services;
        $("#cart-window").kendoMobileModalView("open");
    }

    $scope.removefromcart = function (selectedService) {
        cmService.cart.services.splice($scope.cartServices.indexOf(selectedService), 1);
        localStorage.setItem("cartServices", JSON.stringify($scope.cartServices));
        $scope.cartCount -= 1;
    }

    $scope.categoryClick = function (selectedCategory) {
        if (selectedCategory) {
            if (selectedCategory.CategoryID > 0 && !selectedCategory.ServiceID) {
                $location.path("/services/category/"+ selectedCategory.CategoryID);
            }
            else {
                //saving selected service temp for service details page
                cmService.selectedService = selectedCategory;
                $location.path("/services/service/" + selectedCategory.ServiceID);
            }
        }
    }

    $scope.goBack = function () {
        $window.history.back();
    }
    $scope.getServices();
}]);