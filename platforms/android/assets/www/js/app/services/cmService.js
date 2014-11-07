var appService = angular.module("appService.Module", ["ngRoute"]);

appService.factory("cmService", [function () {
    var service = {};

    //Change shortname only to change vendor
    service.shortName = "pavant77";

    service.vendorName = window.localStorage['vendorName'];
	service.vendorID = window.localStorage['vendorID'];
	service.checkoutFlow = 0; //0 - Request for appointment only, 1 - Show available slots then book appointment, 2 - Show available time slots by staff memeber then book
	service.baseURL = "https://" + service.shortName + ".customermantra.com/";
	service.MOBILE_SERVICE_URL = 'https://cmantramobile.azure-mobile.net/';
	service.MOBILE_SERVICE_APP_KEY = 'MZkjfYNFccppxwLbWrymEOpuiKhUjA96';
	service.GCM_SENDER_ID = '792160202199';
	service.vendorLoaded = false;
	service.loaderScope = null;
	service.selctedLocation = null;

	service.getLocationThumb = function (locationID) {
	    var url = "https://az177188.vo.msecnd.net/" + service.vendorID + "-static/Location/th/" + locationID + "/Image-" + locationID + "?ver=" + new Date().getDate();
	    return url;
	}


	service.getCategoryThumb = function (catID) {
	    var url = "https://az177188.vo.msecnd.net/" + service.vendorID + "-static/cat/" + catID + "/normal-" + catID + "?ver=" + new Date().getDate();
	    return url;
	}

	service.getUserDP = function (custID) {
	    var url = "http://buffalousercontent.blob.core.windows.net/" + service.vendorID + "-static/profileimages/full/" + custID + "?ver=" + new Date().getDate();
	    return url;
	}

	service.selectedService = null;

	service.cart = {
        services: []
	}

	service.categoryList = [];

	service.userInfo = null;

	service.selectedVisit = null;

	service.feedbackFilterHistory = null;

    //Veriable to maintain correct navigation flow if user is not logged in 
	service.isPreviousPageVisited = false;


    //Format money function
	service.formatMoney = function (val) {
	    var PlanoNumberFormat = JSON.parse(window.localStorage['numberFormatOptions']);
	    return accounting.formatMoney(val,
                        PlanoNumberFormat.CurrencySymbol, 2, PlanoNumberFormat.GroupSep, PlanoNumberFormat.DecimalSep, PlanoNumberFormat.positiveFormat);
	};
	
	return service;
}]);