'use strict';

const PRINT_ROUTE = '/print-book';
const PRINT_PARAM = 'print';
// Parameter to be toggled
// Purpose: There are browser performance boosts that can be made when
// in print mode, such as avoiding setting up listeners & animations
var IS_PRINT_MODE = false;



angular.module('app', [
    'ngRoute',
    'ngAnimate',

    'ngLoadScript',

    'app.menu',
    'app.book',
    'app.frieze',
    'app.posters',
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
        .when(PRINT_ROUTE, {
            templateUrl: '/app/print-book.html',
        })
        .when('/theory-reference', {
            templateUrl: '/app/theory-reference/theory-reference.html',
        })
        .when('/pieces', {
            templateUrl: '/app/pieces.html',
        })
        .when('/worksheet', {
            templateUrl: '/app/worksheet.html',
        })
        .when('/cards', {
            templateUrl: '/app/cards.html',
        })
        .when('/about', {
            templateUrl: '/app/about.html',
        })
        .when('/frieze', {
            templateUrl: '/app/frieze/frieze.html',
        })

        // posters routes
        .when('/posters/:posterName', {
            templateUrl: '/app/posters/posters-index.html',
        })
        .when('/posters', {
            templateUrl: '/app/posters/posters-index.html',
        })
        .otherwise({ redirectTo: '/' });


    $locationProvider.hashPrefix('!');
}])

// bootstrap the directives
.directive('fraction', fractionDirective)
.directive('canvasCenteredDrawing', canvasCenteredDrawingDirective)
.directive('circularTessellation', circularTessellationDirective)

// set up the main page controller
.controller('MainCntl', function($rootScope, $location, $anchorScroll, $routeParams) {
    // view model
    let vm = this;

    // set the 'print' flag if the route is the PRINT_ROUTE or PRINT_PARAM is present
    vm.checkPrint = function() {
        if (!!$location.search()[PRINT_PARAM] || $location.path() === PRINT_ROUTE) {
            vm.print = true;
            IS_PRINT_MODE = true;
        }
    }
    
    // handle anchor tags & routeparam changes
    // this will be triggered on first page load, as well as all route changes
    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
        $location.hash($routeParams.scrollTo);  
        $anchorScroll();

        // this will also be triggered on first page load
        vm.checkPrint();
    });
});
