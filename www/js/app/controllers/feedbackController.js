angular.module('appModule').controller("FeedbackController", ["$scope", "cmService", "$http", "$location", function ($scope, cmService, $http, $location) {
    $scope.goBack = function () {
        window.history.back();
    }
    $scope.SurveyName = "";
    $scope.SurveyID = 0;
    $scope.SurvayQuestions = [];
    $scope.ServiceQuestions = [];
    $scope.selectedBillFeedback = cmService.selectedVisit;
    $scope.getFeedbackForm = function () {
        cmService.loaderScope.showLoader(true, "Loading feedback form...");
        $scope.SurvayQuestions = [];
        $scope.ServiceQuestions = [];
        var feed = {
            id: cmService.userInfo.CustomerDetailsID,
            str: $scope.selectedBillFeedback.CommonID,
            locationID: $scope.selectedBillFeedback.VendorLocationID
        };
        $http.post(cmService.baseURL + "WebServices/LoadFeedbackForm", feed).success(function (result) {
            $scope.SurveyName = result.SurveyName;
            $scope.SurveyID = result.SurveyID;
            angular.forEach(result.Data, function (que, index) {
                if (que.QuestionID > 0) {
                    $scope.SurvayQuestions.push(que);
                } else {
                    $scope.ServiceQuestions.push(que);
                }
            });
            $scope.selectedBillFeedback = feed;
            setTimeout(function () {
                angular.forEach(result.Data, function (que, index) {
                    if (que.AnswerType == 0) {
                        if (que.Active) {
                            $("#" + que.QuestionID).barrating({
                                initialRating: null,
                                showSelectedRating: false,
                                showValues: true,
                                onSelect: function (value, text) {
                                    var queid = parseInt($(this).parent().prev().attr("id"));
                                    angular.forEach($scope.SurvayQuestions, function (que, index) {
                                        if (que.QuestionID == queid) {
                                            que.Rating = parseInt(value);
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            $("#" + que.QuestionID).barrating({ initialRating: que.Rating, showValues: true, showSelectedRating: false, readonly: true });
                        }
                    }
                });
            }, 1000);
            cmService.loaderScope.showLoader(false, null);
        })
        .error(function (error) {
            cmService.loaderScope.showLoader(false, null);
        });
    }
    $scope.getFeedbackForm();
    $scope.sendFeedback = function () {
        cmService.loaderScope.showLoader(true, "Saving feedback...");
        angular.forEach($scope.ServiceQuestions, function (que, index) {
            $scope.SurvayQuestions.push(que);
        });
        var feedback = {
            CommonID: $scope.selectedBillFeedback.str,
            CustomerDetailsID: cmService.userInfo.CustomerDetailsID,
            SurveyID: $scope.SurveyID == null ? 0 : $scope.SurveyID,
            Answers: $scope.SurvayQuestions,
            VendorLocationID: $scope.selectedBillFeedback.locationID
        }

        $http.post(cmService.baseURL + "WebServices/SaveFeedback", feedback).success(function (result) {
            $scope.selectedBillFeedback = null;
            cmService.selectedVisit = null;
            alert("We got your feedback, thankyou!");
            cmService.loaderScope.showLoader(false, null);
            window.history.back();
        })
        .error(function (error) {
            cmService.loaderScope.showLoader(false, null);
        });
    }
}]);