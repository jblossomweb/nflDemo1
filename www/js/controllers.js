angular.module('nflTeams.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('TeamsCtrl', ['$scope', 'teamFactory', function($scope, teamFactory) {
  $scope.teams = teamFactory.teams;
}])

.controller('TeamCtrl', ['$scope', 'team', function($scope, team) {
  $scope.team = team;
}])

.controller('RosterCtrl', ['$scope', 'team', function($scope, team) {
  $scope.team = team;
  $scope.roster = team ? team.roster || [] : [];
}])

.controller('DepthCtrl', ['$scope', 'team', function($scope, team) {
  $scope.team = team;
  $scope.depth = team ? team.depth || [] : [];
  $scope.orderByType = function(chartType) {
    switch(chartType) {
      case 'offense': return 1;
      case 'defense': return 2;
      case 'special teams': return 3;
      default: return 4;
    }
  };
}])

.controller('DepthChartCtrl', ['$scope', '$filter', 'team', 'chart', function($scope, $filter, team, chart) {
  $scope.team = team;
  $scope.depth = team ? team.depth || [] : [];
  $scope.chart = chart || {};
  $scope.formation = $filter('getByField')(chart.formations || [], 'isDefault', true);
  console.log($scope.formation);
}]);
