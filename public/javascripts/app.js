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
    $scope.newWaste = {};
    $scope.wastes = [];
    $http.get('api/waste').then(function(response) {
        $scope.wastes = response.data;
    });
    $scope.addWaste = function() {
        $http.post('/api/waste', $scope.newWaste).then(function() {
            $scope.wastes.push($scope.newWaste);
            $scope.newWaste = {};
        });
    }
});