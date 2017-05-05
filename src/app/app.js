'use strict';


angular.module('app', [
    'ngRoute',
    'ngAnimate',

    'ngLoadScript',

    'app.book',
    'app.frieze',
])
.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
        .when('/', {
            templateUrl: '/app/book/book.html',
        	// avoid reloading view when updating ?pageNumber param
            reloadOnSearch: false,
        })
        .when('/book', {
            templateUrl: '/app/book/book.html',
        	// avoid reloading view when updating ?pageNumber param
            reloadOnSearch: false,
        })
        .when('/theory-reference', {
            templateUrl: '/app/theory-reference/theory-reference.html',
        })
        .when('/pieces', {
            templateUrl: '/app/pieces.html',
        })
        .when('/frieze', {
            templateUrl: '/app/frieze/frieze.html',
        })
        .otherwise({ redirectTo: '/' });


    $locationProvider.hashPrefix('!');
}])
// bootstrap the directives
.directive('fraction', fractionDirective)
.directive('canvasCenteredDrawing', canvasCenteredDrawingDirective)
.directive('circularTessellation', circularTessellationDirective)

.run(function($rootScope, $location, $anchorScroll, $routeParams) {
    
    // handle anchor tags on route change
    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
        $location.hash($routeParams.scrollTo);    
        $anchorScroll();
    });
});
