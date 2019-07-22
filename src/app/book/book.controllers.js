'use strict';

/*

Note the terrible but important view hack:

Each book-page that is included in the book.html
has an ng-if to check if it is the current page and
should therefore be rendered.

Reason:
- Need ng-include to first fetch all the templates ONCE
so cannot put ng-if around ng-include
- If instead had ng-include or ng-view fetching templates
for book-page's when needed, then changing from one book-page to
the next would be very slow

- Need to use ng-if on book-page's so that their heavy SVGs are
not rendered in the DOM when the book-page is not the current page
- Using display:none or ng-hide is not enough, these SVGs must
be removed from the page -- together they're too heavy for browsers

Also note: PageNumber variable references number for pageSet items,
not pagenumbers corresponding to book-page's

*/
function BookCntl($scope, $rootScope, $window, $location, $anchorScroll) {
    // view model is this BookCntl
    let vm = this;

    vm.pageSrcBase = '/app/book/pages';
    vm.bookPageUrl = function(p) {
        return vm.pageSrcBase + '/' + p;
    };

    // Some pages are only shown in the print or app version only.
    vm.pageSets = [
        {
            name: 'cover',
            url: vm.bookPageUrl('book-page-cover.html'),
            appOnly: true,
        }, {
            name: 'about',
            url: vm.bookPageUrl('book-page-about.html'),
        }, {
            name: 'before-info',
            url: vm.bookPageUrl('book-page-before-info.html'),
            printOnly: true,
        }, {
            name: 'before-designs',
            url: vm.bookPageUrl('book-page-before-designs.html'),
            printOnly: true,
        }, {
            name: 'road-map',
            url: vm.bookPageUrl('book-page-road-map.html'),
        }, {
            name: 'table-of-contents',
            url: vm.bookPageUrl('book-page-table-of-contents.html'),
        }, {
            name: 'shapes-introduction',
            url: vm.bookPageUrl('book-page-shapes-introduction.html'),
        },{
            name: 'shapes-rotations',
            url: vm.bookPageUrl('book-page-shapes-rotations.html'),
        },{
            name: 'shapes-cyclic-groups',
            url: vm.bookPageUrl('book-page-shapes-cyclic-groups.html'),
        },{
            name: 'shapes-generators',
            url: vm.bookPageUrl('book-page-shapes-generators.html'),
        },{
            name: 'shapes-cyclic-subgroups-and-closure',
            url: vm.bookPageUrl('book-page-shapes-cyclic-subgroups-and-closure.html'),
        },{
            name: 'shapes-reflections',
            url: vm.bookPageUrl('book-page-shapes-reflections.html'),
        },{
            name: 'shapes-dihedral-groups',
            url: vm.bookPageUrl('book-page-shapes-dihedral-groups.html'),
        },{
            name: 'shapes-dihedral-subgroups',
            url: vm.bookPageUrl('book-page-shapes-dihedral-subgroups.html'),
        },{
            name: 'shapes-dihedral-inverses',
            url: vm.bookPageUrl('book-page-shapes-dihedral-inverses.html'),
        },{
            name: 'patterns-frieze-translations',
            url: vm.bookPageUrl('book-page-patterns-frieze-translations.html'),
        },{
            name: 'patterns-frieze-rotations-and-reflections',
            url: vm.bookPageUrl('book-page-patterns-frieze-rotations-and-reflections.html'),
        },{
            name: 'patterns-frieze-symmetry-groups',
            url: vm.bookPageUrl('book-page-patterns-frieze-symmetry-groups.html'),
        },{
            name: 'patterns-frieze-combining-symmetries',
            url: vm.bookPageUrl('book-page-patterns-frieze-combining-symmetries.html'),
        },
        {
            name: 'patterns-wallpaper-intro',
            url: vm.bookPageUrl('book-page-patterns-wallpaper-intro.html'),
        },
        {
            name: 'patterns-wallpaper-translations',
            url: vm.bookPageUrl('book-page-patterns-wallpaper-translations.html'),
        },
        {
            name: 'patterns-wallpaper-rotations',
            url: vm.bookPageUrl('book-page-patterns-wallpaper-rotations.html'),
        },
        {
            name: 'patterns-wallpaper-catalogue-no-rotations',
            url: vm.bookPageUrl('book-page-patterns-wallpaper-catalogue-no-rotations.html'),
        },
        {
            name: 'patterns-wallpaper-catalogue-order-2-rotations-1',
            url: vm.bookPageUrl('book-page-patterns-wallpaper-catalogue-order-2-rotations-1.html'),
        },
        {
            name: 'patterns-wallpaper-catalogue-order-2-rotations-2',
            url: vm.bookPageUrl('book-page-patterns-wallpaper-catalogue-order-2-rotations-2.html'),
        },
        {
            name: 'patterns-wallpaper-catalogue-order-4-rotations',
            url: vm.bookPageUrl('book-page-patterns-wallpaper-catalogue-order-4-rotations.html'),
        },
        {
            name: 'patterns-wallpaper-catalogue-order-3-rotations',
            url: vm.bookPageUrl('book-page-patterns-wallpaper-catalogue-order-3-rotations.html'),
        },
        {
            name: 'patterns-wallpaper-catalogue-order-6-rotations',
            url: vm.bookPageUrl('book-page-patterns-wallpaper-catalogue-order-6-rotations.html'),
        },
        {
            name: 'patterns-wallpaper-end',
            url: vm.bookPageUrl('book-page-patterns-wallpaper-end.html'),
        }, {
            name: 'after-info',
            url: vm.bookPageUrl('book-page-after-info.html'),
        },
        {
            name: 'notation',
            url: vm.bookPageUrl('book-page-notation.html'),
        },
        {
            name: 'theory-reference',
            url: vm.bookPageUrl('book-page-theory-reference.html'),
        }
    ];


    vm.setupPage = function() {
        vm.page = vm.pageSets[vm.pageNumber];
        vm.pageName = vm.page.name;

        // view should only show button to return to previous page
        // if there is a previous page
        vm.showPreviousPageBtn = (vm.pageNumber > 0) ? true : false;
        // view should only show button to return to next page
        // if there is a next page
        vm.showNextPageBtn = (vm.pageNumber < (vm.pageSets.length - 1)) ? true : false;    

        // scroll to the top of the new book-page that is shown
        $anchorScroll();   
    };


    // change to the previous page
    vm.previousPage = function() {
        vm.animateNextPage = false;
        vm.animatePreviousPage = true;
        vm.changePage(vm.pageNumber - 1);
    };

    // change to the next page
    vm.nextPage = function() {
        vm.animateNextPage = true;
        vm.animatePreviousPage = false;
        vm.changePage(vm.pageNumber + 1);
    };

    vm.changePage = function(pageIndex) {
        if (pageIndex < 0 || pageIndex > vm.pageSets.length)
            return;

        vm.setPageByNumber(pageIndex);
        vm.setupPage();
    };


    // Meant for easier redirects to page
    // Tries to pull the pageName from the URL params
    // and returns pageNumber corresponding to that page name
    vm.getPageNumberByPageName = function() {
        let pageName = $location.search().pageName;
        let pageNumber;

        if (!!pageName) {
            let findSomePageNumber = function(page, index) {
                pageNumber = index;
                // 'some' function will shortcircuit here if true
                return (page.name === pageName); 
            };

            if (vm.pageSets.some(findSomePageNumber))
                return pageNumber;
        }
    };

    vm.getPageNumber = function() {
        // first try to get the page by pageName
        // otherwise return the 0th page
        let pageNumber = vm.getPageNumberByPageName();

        if (!!pageNumber)
            return pageNumber;
        return 0;   
    };

    vm.setPageByNumber = function(pageIndex, isInit=false) {
        vm.pageNumber = pageIndex;
        vm.pageName = vm.pageSets[pageIndex].name;
        // Update search params in this way to keep the others that are not
        // related to page (e.g. debug, print)
        let searchDict = $location.search();
        searchDict.pageName = vm.pageName;
        $location.search(searchDict);
        // In order to not break the back button and allow the user
        // to return to the page they came from, do not add a new
        // browser history the first time the search params are updated.
        if (isInit)
            $location.replace();
    };

    vm.removeAppOnlyPages = function() {
        let p = 0;
        while (p < vm.pageSets.length) {
            if (!!vm.pageSets[p].appOnly)
                vm.pageSets.splice(p, 1);
            else
                p++;
        }       
    }

    vm.removePrintOnlyPages = function() {
        let p = 0;
        while (p < vm.pageSets.length) {
            if (!!vm.pageSets[p].printOnly)
                vm.pageSets.splice(p, 1);
            else
                p++;
        }     
    }


    vm.init = function() {
        // Unless in print mode, remove the printOnly pages.
        // And when in print mode, remove the appOnly pages
        if (!$rootScope.print)
            vm.removePrintOnlyPages();
        else
            vm.removeAppOnlyPages();


        // get the page from the url
        vm.pageNumber = vm.getPageNumber();
        vm.setPageByNumber(vm.pageNumber, true);
        vm.setupPage();
    };

    // watch for when the route is updated by something other than this controller
    // if it is, then reinitialize the page again
    $scope.$on('$routeUpdate', function() {
        let ls = $location.search();
        if (ls.pageName !== vm.pageName) {
            vm.init();
        } else if (vm.pageName != vm.previousPageName) {
            vm.previousPageName = vm.pageName;
            // Note: the MainController updates google analytics too and in
            // some edge cases there may be double counts
            analytics.trackPageView();
        }
    });

    vm.init();
}
