
var friezeApp = angular.module('frieze', ['ngRoute']);

friezeApp.config(function($routeProvider) {

  var resolvePatternData = {
    fundamentalDomainPatterns: function() {
      return [
            petalEllipse,
            quarterEllipse,
            curves4,
            triangles3,
            curves3,
            triangles2,
        ];
    },
    fundamentalDomainProperties: function() {
      return {
        width: 100,
        height: 80,
        buffer: 5,
      }
    },
    patternsData: function () {
      return patternsData;
    }
  }
 
  $routeProvider
    .when('/', {
      template: getFriezeTemplate,
      resolve: resolvePatternData
    })
    .when('/:patternName', {
      controller:'friezeController',
      template: getPatternTemplate,
      resolve: resolvePatternData
    })
    .otherwise({
      redirectTo:'/'
    });
});
