'use strict';


angular.module('app', [
	'ngRoute',
	'ngAnimate',
	'app.book',
	'app.frieze',
	'ngLoadScript',
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
.directive('circularTessellation', circularTessellationDirective);
