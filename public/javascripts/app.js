var app = angular.module('waste', ['angular-loading-bar', 'ui.router', 'ui.bootstrap', 'angular-growl', 'highcharts-ng']);

app.config(function($stateProvider, $urlRouterProvider, growlProvider) {
    growlProvider.globalTimeToLive(3000);
    growlProvider.globalDisableCountDown(true);
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('index', {
        url: '/',
        templateUrl: 'views/index.html',
        controller: 'IndexController'
    }).state('money', {
        url: '/money',
        templateUrl: 'views/money.html',
        controller: 'MoneyController'
    });
});

app.service('utils', function($filter) {
    this.getLocalToday = function() {
        return $filter('date')(new Date(), 'yyyyMMdd');
    };
    this.parseDate = function(str) {
        return Date.UTC(parseInt(str.substring(0, 4)), parseInt(str.substring(4, 6)) - 1,
            parseInt(str.substring(6, 8)));
    };
});

