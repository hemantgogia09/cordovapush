var appmodule = angular.module("appModule", ["ngRoute", "appService.Module", "kendo.directives", "ngAnimate"]);
appmodule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', { templateUrl: 'views/home.html', controller: 'HomeController' })
        .when('/locations', { templateUrl: 'views/locations.html', controller: 'LocationsController' })
        .when('/services', { templateUrl: 'views/services.html', controller: 'ServicesController' })
        .when('/services/:serviceType/:serviceID', { templateUrl: 'views/services.html', controller: 'ServicesController' })
        .when('/offers', { templateUrl: 'views/offers.html', controller: 'OffersController' })
        .when('/myinfo', { templateUrl: 'views/myinfo.html', controller: 'MyinfoController' })
        .when('/contact', { templateUrl: 'views/contact.html', controller: 'ContactController' })
        .when('/login', { templateUrl: 'views/login.html', controller: 'LoginController' })
        .when('/editinfo', { templateUrl: 'views/editinfo.html', controller: 'EditInfoController' })
        .when('/myvisits', { templateUrl: 'views/myvisits.html', controller: 'MyVisitsController' })
        .when('/feedback', { templateUrl: 'views/feedback.html', controller: 'FeedbackController' })
        .otherwise({ redirectTo: '/' });
}])
