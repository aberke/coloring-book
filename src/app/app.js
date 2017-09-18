'use strict';

// Parameter to be toggled
// Purpose: There are browser performance boosts that can be made when
// in print mode, such as avoiding setting up listeners & animations
var DISABLE_ANIMATIONS = false;
// parameters and routes to be used to turn on 'print' or 'disable-animations' mode
const DISABLE_ANIMATIONS_PARAM = 'disable-animations';
const PRINT_ROUTE = '/print-book';
const PRINT_PARAM = 'print';



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
    // set 'disable-animations' flag if param is present or in printing
    vm.checkMode = function() {
        if (!!$location.search()[PRINT_PARAM] || $location.path() === PRINT_ROUTE) {
            vm.print = true;
            DISABLE_ANIMATIONS = true;
        } else if (!!$location.search()[DISABLE_ANIMATIONS_PARAM]) {
            DISABLE_ANIMATIONS = true;
        }

    }
    
    // handle anchor tags & routeparam changes
    // this will be triggered on first page load, as well as all route changes
    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
        $location.hash($routeParams.scrollTo);  
        $anchorScroll();

        vm.checkMode();
    });
});
