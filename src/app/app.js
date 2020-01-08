'use strict';

// Parameters to be toggled
const DEBUG_PARAM = 'debug';
let DEBUG = false;
// Purpose: There are browser performance boosts that can be made when
// in print mode, such as avoiding setting up listeners & animations
var DISABLE_ANIMATIONS = false;
// parameters and routes to be used to turn on 'print' or 'disable-animations' mode
const DISABLE_ANIMATIONS_PARAM = 'disable-animations';
const PRINT_ROUTE = '/print-book';
const PRINT_PARAM = 'print';
// Set a print mode accessible to other JS.
let PRINT_MODE = false;

const PRINT_FULL_BLEED_SIZE_PARAM = 'print-full-bleed-size';

const GRAYSCALE_PARAM = 'grayscale';
let GRAYSCALE = false;


angular.module('app', [
    'ngRoute',
    'ngAnimate',

    'ngLoadScript',

    'app.info',
    'app.menu',
    'app.book',
    'app.frieze',
    'app.posters',
    'app.solutions',
    'app.wallpaper',
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
            templateUrl: '/app/book/book.html',
        })
        .when('/theory-reference', {
            templateUrl: '/app/theory-reference/theory-reference.html',
        })
        .when('/symmetries', {
            templateUrl: '/app/symmetry-guide/symmetry-guide.html',
        })
        .when('/solutions', {
            templateUrl: '/app/solutions/solutions.html',
        })
        .when('/pieces', {
            templateUrl: '/app/pieces.html',
        })
        .when('/style-guide', {
            templateUrl: '/app/style-guide.html',
        })
        .when('/circular-pattern', {
            templateUrl: '/app/circular-pattern.html',
        })
        .when('/worksheet', {
            templateUrl: '/app/worksheet.html',
        })
        .when('/cards', {
            templateUrl: '/app/cards.html',
        })
        .when('/info', {
            templateUrl: '/app/info/info.html',
        })
        .when('/frieze', {
            templateUrl: '/app/frieze/frieze.html',
        })
        .when('/wallpaper', {
            templateUrl: '/app/wallpaper/wallpaper.html',
        })
        .when('/posters', {
            templateUrl: '/app/posters/posters-index.html',
        })
        .otherwise({ redirectTo: '/' });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
}])

// bootstrap the directives
.directive('tweet', tweetDirective)
.directive('fraction', fractionDirective)
.directive('simpleDrawing', simpleDrawingDirective)
.directive('canvasCenteredDrawing', canvasCenteredDrawingDirective)
.directive('circularPattern', circularPatternDirective)

// set up the main page controller
.controller('MainCntl', function($rootScope, $location) {
    // view model
    let vm = this;

    // set the 'print' flag if the route is the PRINT_ROUTE or PRINT_PARAM is present
    // set 'disable-animations' flag if param is present or in printing
    vm.checkMode = function() {
        if (!!$location.search()[DEBUG_PARAM]) {
            vm.debug = true;
            DEBUG = true;
        }
        if (!!$location.search()[PRINT_FULL_BLEED_SIZE_PARAM]) {
            vm.printFullBleedSize = true; 
        }
        if (!!$location.search()[GRAYSCALE_PARAM]) {
            vm.grayscale = true;
            GRAYSCALE = true;
        }
        
        if (!!$location.search()[PRINT_PARAM] || $location.path() === PRINT_ROUTE) {
            $rootScope.print = true;
            vm.print = true;
            DISABLE_ANIMATIONS = true;
            PRINT_MODE = true;
        } else if (!!$location.search()[DISABLE_ANIMATIONS_PARAM]) {
            DISABLE_ANIMATIONS = true;
        }
    }
    
    // handle anchor tags & routeparam changes
    // this will be triggered on first page load, as well as all route changes
    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
        vm.checkMode();
        analytics.trackPageView();
    });
});
