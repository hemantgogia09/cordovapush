angular.module('appModule').controller("OffersController", ["$scope", "cmService", "$http", "$sce", function ($scope, cmService, $http, $sce) {
    $(".swiper-container").height($(window).height() - 52);
    $(".swiper-container").width($(window).width());
    $scope.vendorName = cmService.vendorName;
    $scope.offers = [];
    var mySwiper = $('.swiper-container').swiper({
        mode: 'horizontal',
        //loop: true,
        autoplay: 5000,
        pagination: '.pagination',
        paginationClickable: true
    });
    $scope.getOffersList = new function () {
        cmService.loaderScope.showLoader(true, "Loading Offers...");
        $http.get(cmService.baseURL + "book/GetOffersList?str=" + new Date().toFullString()).success(function (data, status, headers, config) {
            if (data.Result == "OK") {
                angular.forEach(data.Data, function (offer, index) {
                    offer.Content = $sce.trustAsHtml(offer.Content);
                    offer.OfferClaimed = false;
                    offer.OfferCodeToShow = "";
                    angular.forEach(offer.OfferRuleTypes, function (offertype, index) {
                        if (offertype.OfferType == 2) {
                            offertype.shareDialog = function () {
                                $scope.shareDialog();
                            };
                        }
                    });
                });
                $scope.offers = data.Data;
                setTimeout(function () {
                    angular.forEach($scope.offers, function (offer, index) {
                        if (offer.OfferRunEndDate != null) {
                            var endDate = new Date(parseInt(offer.OfferRunEndDate.substring(6)));
                            $("#cout-down-" + offer.OfferMasterID).countdowntimer({ dateAndTime: endDate, size: "lg" });
                        }
                    });
                    //if(FB)
                    //    FB.XFBML.parse();
                    mySwiper.reInit();
                    cmService.loaderScope.showLoader(false, null);
                }, 500);
            }
            else {
                alert("No offers found");
                window.history.back();
            }
        })
        .error(function (data, status, headers, config) {
            cmService.loaderScope.showLoader(false, null);
        });
    }

    $scope.likeURL = function (currentOffer) {
        $http.post("https://graph.facebook.com/me/og.likes?access_token=" + window.localStorage['FBAccessToken'] + "&object=" + currentOffer.OfferRuleTypes[0].URLToPost).success(function (success) {
            $scope.getOfferCodeByID(currentOffer);
            console.log(JSON.stringify(success));
        })
        .error(function (error) {
            //If Url is already liked by user
            if (error.code == 3501) {
                $scope.getOfferCodeByID(currentOffer);
            }
            console.log(JSON.stringify(error));
        });
    }

    $scope.getPermission = function (currentOffer) {
        facebookConnectPlugin.login(["publish_actions"],
            function (successResponse) {
                console.log(JSON.stringify(successResponse));
                $scope.likeURL(currentOffer);
            },
            function (errorResponse) {
                console.log(JSON.stringify(errorResponse));
            });
    }

    $scope.openDialog = function (method, currentOffer) {
        if (method == "like") {
            $scope.getPermission(currentOffer);
        } else {
            var options = {
                method: method,
                link: currentOffer.OfferRuleTypes[0].URLToPost,
                caption: ""
            }

            facebookConnectPlugin.showDialog(options,
                function (success) {
                    console.log(JSON.stringify(success));
                    $scope.getOfferCodeByID(currentOffer);
                },
                function (error) {
                    console.log(JSON.stringify(error));
                });
        }
    }

    $scope.getOfferCodeByID = function (currentOffer) {
        cmService.loaderScope.showLoader(true, "Getting offer code...");
        $http.get(cmService.baseURL + "book/ClaimCouponCode/" + currentOffer.OfferMasterID + "/" + currentOffer.OfferRuleTypes[0].OfferRuleID).success(function (data, status, headers, config) {
            if (data.Result == "OK") {
                currentOffer.OfferCodeToShow = data.Data.Message;
                currentOffer.OfferClaimed = true;
            }
            mySwiper.reInit();
            cmService.loaderScope.showLoader(false, null);
        })
        .error(function (data, status, headers, config) {
            cmService.loaderScope.showLoader(false, null);
        });
    }

    //$scope.likeURL = function (currentOffer) {
    //    facebookConnectPlugin.login(["publish_actions"],
    //        function (successResponse) {
    //            facebookConnectPlugin.api("/me/og.likes",
    //                "POST",
    //                {
    //                    "object": "http:\/\/google.com"
    //                },
    //                function (response) {
    //                    if (response && !response.error) {
    //                        alert(response);
    //                    }
    //                });
    //        },
    //        function (errorResponse) {
    //            alert(JSON.stringify(errorResponse))
    //        });
    //}
}]);