// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('nflTeams', ['ionic', 'nflTeams.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.filter('getById', function() {
  return function(input, id) {
    for (var i=0; i<input.length; i++) {
      if (input[i].id == id) {
        return input[i];
      }
    }
    return null;
  }
})

.filter('getByField', function() {
  return function(input, field, value) {
    for (var i=0; i<input.length; i++) {

      if (input[i][field] == value) {
        return input[i];
      }
    }
    return null;
  }
})

.filter('capitalize', function() {
  return function(input, all) {
    return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }) : '';
  }
})

.factory('teamFactory', ['$http', '$q', '$filter', function($http, $q, $filter){
  var teamFactory = {
    teams: [],
    apiBase: 'http://sports-data-master.herokuapp.com/api/v2/',
    league: 'nfl'
  }
  teamFactory.getAll = function getAll() {
    if(teamFactory.teams.length){
      return $q(function(resolve){ resolve() });
    } else {
      return $http.get(teamFactory.apiBase+'leagues/'+teamFactory.league+'/teams').success(function(data){
        angular.copy(data, teamFactory.teams);
        console.log('teams loaded');
      }).error(function(error){
        console.log(error);
      })
    }
  }
  teamFactory.get = function get(id) {
    return teamFactory.getAll().then(function(){
      var team = $filter('getById')(teamFactory.teams, id);
      return team;
    });
  }
  teamFactory.getRoster = function getRoster(id) {
    return teamFactory.get(id).then(function(team){
      if(team.roster && team.roster.length){
        return team;
      } else {
        return $http.get(teamFactory.apiBase+'teams/'+id+'/players').success(function(data){
          team.roster = data;
          console.log('roster loaded for '+id);
        }).error(function(error){
          console.log(error);
        }).then(function(){
          return team;
        });
      }
    });
  }
  teamFactory.getPlayer = function getPlayer(id) {
    var player = {};
    return $http.get(teamFactory.apiBase+'players/'+id).success(function(data){
      player = data;
      console.log('player data loaded for '+id);
    }).error(function(error){
      console.log(error);
    }).then(function(){
      return player;
    });
  }
  teamFactory.getDepth = function getDepth(id) {
    return teamFactory.get(id).then(function(team){
      if(team.depth && team.depth.length){
        return team;
      } else {
        return $http.get(teamFactory.apiBase+'teams/'+id+'/depth').success(function(data){
          team.depth = data;
          console.log('depth chart loaded for '+id);
        }).error(function(error){
          console.log(error);
        }).then(function(){
          return team;
        });
      }
    });
  }

  teamFactory.getDepthChart = function getDepthChart(teamId,chartId) {
    return teamFactory.getDepth(teamId).then(function(team){
      return $filter('getById')(team.depth, chartId);
    });
  }

  teamFactory.getStats = function getStats(id) {
    return teamFactory.get(id).then(function(team){
      if(team.depth && team.depth.length){
        return team;
      } else {
        return $http.get(teamFactory.apiBase+'teams/'+id+'/depth').success(function(data){
          team.depth = data;
          console.log('stats loaded for '+id);
        }).error(function(error){
          console.log(error);
        }).then(function(){
          return team;
        });
      }
    });
  }
  return teamFactory;
}])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })

  .state('app.teams', {
    url: '/teams',
    views: {
      'menuContent': {
        templateUrl: 'templates/teams.html',
        controller: 'TeamsCtrl'
      }
    },
    resolve: {
      teamPromise: ['teamFactory', function(teamFactory){
        return teamFactory.getAll()
      }]
    }
  })

  .state('app.team', {
    url: '/teams/:teamId',
    views: {
      'menuContent': {
        templateUrl: 'templates/team.html',
        controller: 'TeamCtrl'
      }
    },
    resolve: {
      team: ['$stateParams', 'teamFactory', function($stateParams, teamFactory) {
        return teamFactory.get($stateParams.teamId)
      }]
    }
  })

  .state('app.roster', {
    url: '/teams/:teamId/roster',
    views: {
      'menuContent': {
        templateUrl: 'templates/roster.html',
        controller: 'RosterCtrl'
      }
    },
    resolve: {
      team: ['$stateParams', 'teamFactory', function($stateParams, teamFactory) {
        return teamFactory.getRoster($stateParams.teamId)
      }]
    }
  })

  .state('app.player', {
    url: '/players/:playerId',
    views: {
      'menuContent': {
        templateUrl: 'templates/player.html',
        controller: 'PlayerCtrl'
      }
    },
    resolve: {
      player: ['$stateParams', 'teamFactory', function($stateParams, teamFactory) {
        return teamFactory.getPlayer($stateParams.playerId)
      }]
    }
  })

  .state('app.depth', {
    url: '/teams/:teamId/depth',
    views: {
      'menuContent': {
        templateUrl: 'templates/depth.html',
        controller: 'DepthCtrl'
      }
    },
    resolve: {
      team: ['$stateParams', 'teamFactory', function($stateParams, teamFactory) {
        return teamFactory.getDepth($stateParams.teamId)
      }]
    }
  })

  .state('app.depth-chart', {
    url: '/teams/:teamId/depth/:chartId',
    views: {
      'menuContent': {
        templateUrl: 'templates/depth-chart.html',
        controller: 'DepthChartCtrl'
      }
    },
    resolve: {
      team: ['$stateParams', 'teamFactory', function($stateParams, teamFactory) {
        return teamFactory.getDepth($stateParams.teamId);
      }],
      chart: ['$stateParams', 'teamFactory', function($stateParams, teamFactory) {
        return teamFactory.getDepthChart($stateParams.teamId, $stateParams.chartId);
      }]
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/teams');
});
