dndApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
        .when('/encounters', {
          templateUrl: 'partials/encounters.html',
          controller: 'EncountersController'
        })
        .when('/manage-units', {
          templateUrl: 'partials/manage-units.html',
          controller: 'ManageUnitsController'
        })
        .when('/manage-encounters', {
          templateUrl: 'partials/manage-encounters.html',
          controller: 'ManageEncountersController'
        })
        .when('/', {
          // Go to the manage-units page by default
          templateUrl: 'partials/manage-units.html',
          controller: 'ManageUnitsController'
        })
        .otherwise({
          redirectTo: 'partials/error.html',
          templateUrl: 'partials/error.html'
        });
  }
]);