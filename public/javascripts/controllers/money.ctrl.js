angular.module('waste').controller('MoneyController', function($scope, $http, growl, utils) {
    $http.get('/api/money').then(function(response) {
        var money = response.data;
        $scope.money = money;
        var todays = money.find(function(m) { return m.date == utils.getLocalToday();});
        $scope.todayMoney = todays ? todays.money : void(0);
        $scope.moneyChartConfig = {
            options: {
                chart: {
                    type: 'column'
                },
                tooltip: {
                    style: {
                        padding: 10,
                        fontWeight: 'bold'
                    },
                    formatter: function() {
                        return this.y;
                    }
                },
                legend: {enabled: false}
            },
            title: {
                text: ''
            },
            series: [{
                data: money.map(function(m) {
                    return [utils.parseDate(m.date), m.money];
                }),
                pointWidth: 10,
                pointPadding: 0
            }],
            xAxis: {
                title: {text: 'Days'},
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Money'
                }
            }
        };
        console.log('wtf');
    });
    $scope.saveTodayMoney = function() {
        $http.post('/api/money/' + utils.getLocalToday(), {
            date: utils.getLocalToday(),
            money: parseInt($scope.todayMoney)
        }).then(function() {
            growl.success('Saved! See you tomorrow.');
        });
    };
});