angular.module('appModule').controller("MyVisitsController", ["$scope", "cmService", "$http", "$location", function ($scope, cmService, $http, $location) {
    $scope.goBack = function () {
        window.history.back();
    }
    $scope.billOptions = [
        { value: "", text: "Paid/Un-Paid" },
        { value: "true", text: "Paid" },
        { value: "false", text: "Un-Paid" }
    ];
    $scope.selectedBillOption = $scope.billOptions[0];
    $scope.PastVisits = [];
    $scope.FutureVisits = [];
    $scope.loading = false;
    $scope.TotalAmount = 0;
    $scope.PendingAmount = 0;
    var d = new Date();
    var year = d.getFullYear();
    var smonth = d.getMonth() + 1;
    if (smonth < 10) {
        smonth = "0" + smonth;
    };
    var emonth = d.getMonth() + 2;
    if (emonth < 10) {
        emonth = "0" + emonth;
    };
    var day = d.getDate();
    if (day < 10) {
        day = "0" + day;
    };
    var params = null;
    $scope.StartDate = year + "-" + smonth + "-" + day;
    $scope.EndDate = year + "-" + emonth + "-" + day;
    if (cmService.feedbackFilterHistory) {
        $scope.selectedBillOption.value = cmService.feedbackFilterHistory.Billed;
        var stdt= new Date(cmService.feedbackFilterHistory.StartDate);
        var syear = stdt.getFullYear();
        var smonth = stdt.getMonth() + 1;
        if (smonth < 10) {
            smonth = "0" + smonth;
        };
        var sday = stdt.getDate();
        if (sday < 10) {
            sday = "0" + sday;
        };
        $scope.StartDate = syear + "-" + smonth + "-" + sday;
        var enddt = new Date(cmService.feedbackFilterHistory.EndDate);
        var eyear = enddt.getFullYear();
        var enmonth = enddt.getMonth() + 1;
        if (enmonth < 10) {
            enmonth = "0" + enmonth;
        };
        var eday = enddt.getDate();
        if (eday < 10) {
            eday = "0" + eday;
        };
        $scope.EndDate = eyear + "-" + enmonth + "-" + eday;
    }
    $scope.getMyVisits = function () {
        $scope.loading = true;
        cmService.loaderScope.showLoader(true, "Getting your visits...");
        $scope.PastVisits = [];
        $scope.FutureVisits = [];
        params = {
            Billed: $scope.selectedBillOption.value,
            CustomerDetailsID: cmService.userInfo.CustomerDetailsID,
            EndDate: new Date($scope.EndDate).toPlanoLocalDateString(),
            StartDate: new Date($scope.StartDate).toPlanoLocalDateString(),
            str: new Date().toFullString()
        }
        $http.post(cmService.baseURL+"book/GetAppointmentListByCustomer/", params).success(function (result) {
            if (result.Result == "OK") {
                angular.forEach(result.Data.Past, function (dat) {
                    var appDate = dat.DateOfAppointment.GetDate();
                    dat.Day = appDate.getDate();
                    dat.ShortDate = dateFormat(appDate, "mmm yyyy");
                    dat.DateOfAppointment = dateFormat(appDate, dateFormat.masks.mediumDate);
                    dat.StartTime = dateFormat(dat.StartTime.GetDate(), dateFormat.masks.shortTime);
                    dat.EndTime = dateFormat(dat.EndTime.GetDate(), dateFormat.masks.shortTime);
                    $scope.PastVisits.push(dat);
                });
                angular.forEach(result.Data.Future, function (dat) {
                    var appDate = dat.DateOfAppointment.GetDate();
                    dat.Day = appDate.getDate();
                    dat.ShortDate = dateFormat(appDate, "mmm yyyy");
                    dat.DateOfAppointment = dateFormat(appDate, dateFormat.masks.mediumDate);
                    dat.StartTime = dateFormat(dat.StartTime.GetDate(), dateFormat.masks.shortTime);
                    dat.EndTime = dateFormat(dat.EndTime.GetDate(), dateFormat.masks.shortTime);
                    $scope.FutureVisits.push(dat);
                });
                $scope.PendingAmount = result.PendingAmount.toFixed(2);
                $scope.TotalAmount = result.TotalAmount.toFixed(2);
            }
            else {
                alert("No visit information found");
            }
            cmService.feedbackFilterHistory = null;
            cmService.loaderScope.showLoader(false, null);
            $scope.loading = false;
        })
        .error(function (error) {
            cmService.loaderScope.showLoader(false, null);
            $scope.loading = false;
        });
    }
    $scope.getMyVisits();
    $scope.openFeedback = function (visit) {
        cmService.selectedVisit = visit;
        cmService.feedbackFilterHistory = params;
        $location.path("/feedback");
    }

    

    $(".trigger_blog").click(function () {
        $(this).toggleClass("activeb").next().slideToggle("slow");
        return false;
    });
}]);