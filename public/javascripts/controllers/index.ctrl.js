var priorities = {
    low: 2,
    medium: 1,
    high: 0
};

function Waste() {
    this.priority = 'medium';
}

angular.module('waste').controller('IndexController', function($scope, $http, $uibModal, growl, utils) {
    $scope.currentFilter = 'actual';
    $scope.filter = function(f) {
        $scope.currentFilter = f;
        $scope.sort = f === 'actual' ? 'priorityVal' : '-closedAt';
    };
    $scope.headers = [
        {name: 'Title', sort: 'title', forState: 'all'},
        {name: 'Date Added', sort: 'dateAdded', forState: 'all'},
        {name: 'Date Closed', sort: 'closedAt', forState: 'closed'},
        {name: 'Apprx. Cost', sort: 'cost', forState: 'all'},
        {name: 'Real Cost', sort: 'actualCost', forState: 'closed'},
        {name: 'Before', forState: 'actual'},
        {name: 'Comment', forState: 'closed'},
        {name: 'Priority', sort: 'priorityVal', forState: 'actual'}
    ];
    $scope.selectedWaste = new Waste();
    $scope.wastes = [];
    $http.get('api/waste').then(function(response) {
        $scope.wastes = response.data.map(function(waste) {
            waste.priorityVal = priorities[waste.priority];
            waste.cost = parseInt(waste.cost) || '';
            waste.status = waste.status || 'actual';
            return waste;
        });
    });
    $http.get('/api/money').then(function(response) {
        var money = response.data;
        $scope.money = money;
        var todays = money.find(function(m) { return m.date == utils.getLocalToday();});
        $scope.todayMoney = todays ? todays.money : void(0);
    });

    $scope.upsertWaste = function() {
        var selectedWaste = $scope.selectedWaste;
        if (!selectedWaste._id) {
            selectedWaste.dateAdded = new Date();
            selectedWaste.cost = parseInt(selectedWaste.cost) || '';
            $http.post('/api/waste', selectedWaste).then(function() {
                $scope.wastes.push(selectedWaste);
                $scope.selectedWaste = new Waste();
                growl.success('Added!');
            });
        } else {
            selectedWaste.dateUpdated = new Date();
            selectedWaste.cost = parseInt(selectedWaste.cost) || '';
            $http.put('/api/waste/' + selectedWaste._id, selectedWaste).then(function() {
                growl.success('Updated!');
            });
        }
    };

    $scope.deleteWaste = function() {
        $scope.wastes.splice($scope.wastes.indexOf($scope.selectedWaste), 1);
        if ($scope.selectedWaste._id) $http.delete('/api/waste/' + $scope.selectedWaste._id);
    };
    
    $scope.closeWaste = function() {
        $uibModal.open({
            templateUrl: 'views/close.html',
            controller: 'CloseController',
            size: 'sm',
            scope: $scope
        }).result.then(function() {
            growl.success('Closed!');
        });
    };

    $scope.sort = 'priorityVal';
    $scope.setSort = function(sort) {
        if ($scope.sort == sort) sort = '-' + sort;
        $scope.sort = sort;
    };
    $scope.selectWaste = function($event, waste) {
        $scope.selectedWaste = waste;
        $event.stopPropagation();
    };
    $scope.unselect =function() {
        $scope.selectedWaste = new Waste();
    };
});

angular.module('waste').controller('CloseController', function($scope, $http, $uibModalInstance) {
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.closeWaste =function() {
        $http.put('/api/waste/' + $scope.selectedWaste._id + '/close', {
            actualCost: parseInt($scope.realPrice),
            comment: $scope.comment
        }).then(function() {
            $uibModalInstance.close();
        });
    }
});

angular.module('waste').filter('forState', function() {
    return function(input, currentState) {
        return input.filter(function(item) {
            return item.forState === currentState || item.forState === 'all';
        });
    }
});