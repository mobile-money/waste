var app = angular.module('waste', ['angular-loading-bar', 'ui.router', 'angular-growl']);

app.config(function($stateProvider, $urlRouterProvider, growlProvider) {
    growlProvider.globalTimeToLive(3000);
    growlProvider.globalDisableCountDown(true);
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('index', {
        url: '/',
        templateUrl: 'views/index.html',
        controller: 'IndexController'
    });
});

app.controller('IndexController', function($scope, $http, growl) {
    $scope.hello = "Hello, yeah!"
});