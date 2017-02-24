
friezeApp.controller('PageController', function($scope, $location) { // TODO: pattern service

  $scope.patternsData = patternsData;

  for (var patternName in $scope.patternsData) {
    $scope.patternsData[patternName].ngHref = '#!/' + patternName;
  }

});
