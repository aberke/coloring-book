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

*/
function BookCntl($scope, $rootScope, $window, $location, $anchorScroll) {
    // view model is this BookCntl
    let vm = this;

    vm.pageSrcBase = '/app/book/pages';
    vm.bookPageUrl = function(p) {
        return vm.pageSrcBase + '/' + p;
    };

    // Proxy for section page-names
    // allows linking to section starts by pageName='PAGE' in table-of-contents
    vm.sectionPages = {
        'shapes-and-symmetries-section': 'shapes-introduction-1',
        'rotations-section': 'cn-0',
        'reflections-section': 'dn-1',
        'frieze-section': 'frieze-1',
        'wallpaper-section': 'wallpaper-1',
    };

    // Some pages are only shown in the print version - printOnly.
    vm.pages = [
        {
            name: 'cover',
            url: vm.bookPageUrl('book-page-cover.html'),
        }, {
            name: 'about',
            url: vm.bookPageUrl('book-page-about.html'),
        }, {
            name: 'road-map',
            url: vm.bookPageUrl('book-page-road-map.html'),
        }, {
            name: 'before-info',
            url: vm.bookPageUrl('book-page-before-info.html'),
            printOnly: true,
        }, {
            name: 'table-of-contents',
            url: vm.bookPageUrl('book-page-table-of-contents.html'),
        }, {
            name: 'shapes-introduction-1',
            url: vm.bookPageUrl('shapes-introduction-1.html'),
        },
        {
            name: 'shapes-introduction-2',
            url: vm.bookPageUrl('shapes-introduction-2.html'),
        },
        {
            name: 'shapes-introduction-challenges-1',
            url: vm.bookPageUrl('shapes-introduction-challenges-1.html'),
        },
        {
            name: 'shapes-introduction-challenges-2',
            url: vm.bookPageUrl('shapes-introduction-challenges-2.html'),
        },
        {
            name: 'shapes-rotations-1',
            url: vm.bookPageUrl('shapes-rotations-1.html'),
        },
        {
            name: 'shapes-rotations-2',
            url: vm.bookPageUrl('shapes-rotations-2.html'),
        },
        {
            name: 'shapes-rotations-3',
            url: vm.bookPageUrl('shapes-rotations-3.html'),
        },
        {
            name: 'shapes-rotations-challenges-1',
            url: vm.bookPageUrl('shapes-rotations-challenges-1.html'),
        },
        {
            name: 'shapes-rotations-challenges-2',
            url: vm.bookPageUrl('shapes-rotations-challenges-2.html'),
        },
        {
            name: 'shapes-rotations-challenges-3',
            url: vm.bookPageUrl('shapes-rotations-challenges-3.html'),
        },
        {
            name: 'shapes-rotations-challenges-4',
            url: vm.bookPageUrl('shapes-rotations-challenges-4.html'),
        }

        // }, {
        //     name: 'nature-intro',
        //     url: vm.bookPageUrl('book-page-nature-intro.html'),
        // }, {
        //     name: 'shapes-intro-1',
        //     url: vm.bookPageUrl('book-page-shapes-intro-1.html'),
        // }, {
        //     name: 'shapes-intro-2',
        //     url: vm.bookPageUrl('book-page-shapes-intro-2.html'),
        // }, {
        //     name: 'cn-0',
        //     url: vm.bookPageUrl('book-page-shapes-cn-0.html'),
        // }, {
        //     name: 'cn-1',
        //     url: vm.bookPageUrl('book-page-shapes-cn-1.html'),
        // }, {
        //     name: 'cn-2',
        //     url: vm.bookPageUrl('book-page-shapes-cn-2.html'),
        // }, {
        //     name: 'cn-3',
        //     url: vm.bookPageUrl('book-page-shapes-cn-3.html'),
        // }, {
        //     name: 'cn-4',
        //     url: vm.bookPageUrl('book-page-shapes-cn-4.html'),
        // }, {
        //     name: 'cn-5',
        //     url: vm.bookPageUrl('book-page-shapes-cn-5.html'),
        // }, {
        // //  name: 'cn-6',
        // //  url: vm.bookPageUrl('book-page-shapes-cn-6.html'),
        // // }, {
        //     name: 'cn-7',
        //     url: vm.bookPageUrl('book-page-shapes-cn-7.html'),
        // }, {
        //     name: 'cn-8',
        //     url: vm.bookPageUrl('book-page-shapes-cn-8.html'),
        // }, {
        //     name: 'cn-9',
        //     url: vm.bookPageUrl('book-page-shapes-cn-9.html'),
        // }, {
        //     name: 'cn-10',
        //     url: vm.bookPageUrl('book-page-shapes-cn-10.html'),
        // }, {
        //     name: 'cn-11',
        //     url: vm.bookPageUrl('book-page-shapes-cn-11.html'),
        // }, {
        //     name: 'cn-12',
        //     url: vm.bookPageUrl('book-page-shapes-cn-12.html'),
        // }, {
        //     name: 'cn-13',
        //     url: vm.bookPageUrl('book-page-shapes-cn-13.html'),
        // }, {
        //     name: 'cn-14',
        //     url: vm.bookPageUrl('book-page-shapes-cn-14.html'),
        // }, {
        //     name: 'cn-15',
        //     url: vm.bookPageUrl('book-page-shapes-cn-15.html'),
        // }, {
        //     name: 'cn-16',
        //     url: vm.bookPageUrl('book-page-shapes-cn-16.html'),
        // }, {
        //     name: 'cn-17',
        //     url: vm.bookPageUrl('book-page-shapes-cn-17.html'),
        // }, {
        //     name: 'cn-18',
        //     url: vm.bookPageUrl('book-page-shapes-cn-18.html'),
        // }, {
        //     name: 'cn-19',
        //     url: vm.bookPageUrl('book-page-shapes-cn-19.html'),
        // }, {
        //     name: 'dn-1',
        //     url: vm.bookPageUrl('book-page-shapes-dn-1.html'),
        // }, {
        //     name: 'dn-2',
        //     url: vm.bookPageUrl('book-page-shapes-dn-2.html'),
        // }, {
        //     name: 'dn-3',
        //     url: vm.bookPageUrl('book-page-shapes-dn-3.html'),
        // }, {
        //     name: 'dn-4',
        //     url: vm.bookPageUrl('book-page-shapes-dn-4.html'),
        // }, {
        //     name: 'dn-5',
        //     url: vm.bookPageUrl('book-page-shapes-dn-5.html'),
        // }, {
        //     name: 'dn-6',
        //     url: vm.bookPageUrl('book-page-shapes-dn-6.html'),
        // }, {
        //     name: 'dn-7',
        //     url: vm.bookPageUrl('book-page-shapes-dn-7.html'),
        // }, {
        //     name: 'dn-8',
        //     url: vm.bookPageUrl('book-page-shapes-dn-8.html'),
        // }, {
        //     name: 'dn-9',
        //     url: vm.bookPageUrl('book-page-shapes-dn-9.html'),
        // }, {
        //     name: 'dn-10',
        //     url: vm.bookPageUrl('book-page-shapes-dn-10.html'),
        // }, {
        //     name: 'dn-11',
        //     url: vm.bookPageUrl('book-page-shapes-dn-11.html'),
        // }, {
        //     name: 'dn-12',
        //     url: vm.bookPageUrl('book-page-shapes-dn-12.html'),
        // }, {
        //     name: 'dn-13',
        //     url: vm.bookPageUrl('book-page-shapes-dn-13.html'),
        // }, {
        //     name: 'dn-14',
        //     url: vm.bookPageUrl('book-page-shapes-dn-14.html'),
        // }, {
        //     name: 'dn-15',
        //     url: vm.bookPageUrl('book-page-shapes-dn-15.html'),
        // }, {
        //     name: 'dn-16',
        //     url: vm.bookPageUrl('book-page-shapes-dn-16.html'),
        // }, {
        //     name: 'frieze-1',
        //     url: vm.bookPageUrl('book-page-frieze-1.html'),
        // }, {
        //     name: 'frieze-2',
        //     url: vm.bookPageUrl('book-page-frieze-2.html'),
        // }, {
        //     name: 'frieze-3',
        //     url: vm.bookPageUrl('book-page-frieze-3.html'),
        // }, {
        //     name: 'frieze-4',
        //     url: vm.bookPageUrl('book-page-frieze-4.html'),
        // }, {
        //     name: 'frieze-5',
        //     url: vm.bookPageUrl('book-page-frieze-5.html'),
        // }, {
        //     name: 'frieze-6',
        //     url: vm.bookPageUrl('book-page-frieze-6.html'),
        // }, {
        //     name: 'frieze-7',
        //     url: vm.bookPageUrl('book-page-frieze-7.html'),
        // }, {
        //     name: 'frieze-8',
        //     url: vm.bookPageUrl('book-page-frieze-8.html'),
        // }, {
        //     name: 'frieze-9',
        //     url: vm.bookPageUrl('book-page-frieze-9.html'),
        // }, {
        //     name: 'frieze-10',
        //     url: vm.bookPageUrl('book-page-frieze-10.html'),
        // }, {
        //     name: 'frieze-11',
        //     url: vm.bookPageUrl('book-page-frieze-11.html'),
        // }, {
        //     name: 'frieze-12',
        //     url: vm.bookPageUrl('book-page-frieze-12.html'),
        // }, {
        //     name: 'frieze-13',
        //     url: vm.bookPageUrl('book-page-frieze-13.html'),
        // }, {
        //     name: 'frieze-14',
        //     url: vm.bookPageUrl('book-page-frieze-14.html'),
        // }, {
        //     name: 'frieze-15',
        //     url: vm.bookPageUrl('book-page-frieze-15.html'),
        // }, {
        //     name: 'frieze-16',
        //     url: vm.bookPageUrl('book-page-frieze-16.html'),
        // }, {
        //     name: 'frieze-17',
        //     url: vm.bookPageUrl('book-page-frieze-17.html'),
        // }, {
        //     name: 'frieze-18',
        //     url: vm.bookPageUrl('book-page-frieze-18.html'),
        // }, {
        //     name: 'frieze-19',
        //     url: vm.bookPageUrl('book-page-frieze-19.html'),
        // }, {
        //     name: 'wallpaper-1',
        //     url: vm.bookPageUrl('book-page-wallpaper-1.html'),
        // }, {
        //     name: 'wallpaper-2',
        //     url: vm.bookPageUrl('book-page-wallpaper-2.html'),
        // }, {
        //     name: 'wallpaper-3',
        //     url: vm.bookPageUrl('book-page-wallpaper-3.html'),
        // }, {
        //     name: 'wallpaper-4',
        //     url: vm.bookPageUrl('book-page-wallpaper-4.html'),
        // }, {
        //     name: 'wallpaper-5',
        //     url: vm.bookPageUrl('book-page-wallpaper-5.html'),
        // }, {
        //     name: 'wallpaper-6',
        //     url: vm.bookPageUrl('book-page-wallpaper-6.html'),
        // }, {
        //     name: 'wallpaper-7',
        //     url: vm.bookPageUrl('book-page-wallpaper-7.html'),
        // }, {
        //     name: 'wallpaper-8',
        //     url: vm.bookPageUrl('book-page-wallpaper-8.html'),
        // }, {
        //     name: 'wallpaper-9',
        //     url: vm.bookPageUrl('book-page-wallpaper-9.html'),
        // }, {
        //     name: 'wallpaper-10',
        //     url: vm.bookPageUrl('book-page-wallpaper-10.html'),
        // }, {
        //     name: 'wallpaper-11',
        //     url: vm.bookPageUrl('book-page-wallpaper-11.html'),
        // }, {
        //     name: 'wallpaper-12',
        //     url: vm.bookPageUrl('book-page-wallpaper-12.html'),
        // }, {
        //     name: 'wallpaper-13',
        //     url: vm.bookPageUrl('book-page-wallpaper-13.html'),
        // }, {
        //     name: 'wallpaper-14',
        //     url: vm.bookPageUrl('book-page-wallpaper-14.html'),
        // }, {
        //     name: 'wallpaper-15',
        //     url: vm.bookPageUrl('book-page-wallpaper-15.html'),
        // }, {
        //     name: 'wallpaper-16',
        //     url: vm.bookPageUrl('book-page-wallpaper-16.html'),
        // }, {
        //     name: 'wallpaper-17',
        //     url: vm.bookPageUrl('book-page-wallpaper-17.html'),
        // }, {
        //     name: 'wallpaper-18',
        //     url: vm.bookPageUrl('book-page-wallpaper-18.html'),
        // }, {
        //     name: 'wallpaper-19',
        //     url: vm.bookPageUrl('book-page-wallpaper-19.html'),
        // }, {
        //     name: 'wallpaper-20',
        //     url: vm.bookPageUrl('book-page-wallpaper-20.html'),
        // }, {
        //     name: 'wallpaper-21',
        //     url: vm.bookPageUrl('book-page-wallpaper-21.html'),
        // }, {
        //     name: 'wallpaper-22',
        //     url: vm.bookPageUrl('book-page-wallpaper-22.html'),
        // }, {
        //     name: 'wallpaper-23',
        //     url: vm.bookPageUrl('book-page-wallpaper-23.html'),
        // }, {
        //     name: 'wallpaper-24',
        //     url: vm.bookPageUrl('book-page-wallpaper-24.html'),
        // }, {
        //     name: 'after-info',
        //     url: vm.bookPageUrl('book-page-after-info.html'),
        // }
    ];


    vm.setupPage = function() {
        vm.page = vm.pages[vm.pageNumber];
        vm.pageName = vm.page.name;

        // view should only show button to return to previous page
        // if there is a previous page
        vm.showPreviousPageBtn = (vm.pageNumber > 0) ? true : false;
        // view should only show button to return to next page
        // if there is a next page
        vm.showNextPageBtn = (vm.pageNumber < (vm.pages.length - 1)) ? true : false;    

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
        if (pageIndex < 0 || pageIndex > vm.pages.length)
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
                return (page.name === pageName || page.name == vm.sectionPages[pageName]); 
            };

            if (vm.pages.some(findSomePageNumber))
                return pageNumber;
        }
    };

    vm.getPageNumber = function() {
        // get the pageIndex from the search parameters if present:
        // first try to get the page by pageName
        // otherwise try to get the pageNumber
        // otherwise return the 0th page
        let pageNumber = vm.getPageNumberByPageName();

        if (!!pageNumber)
            return pageNumber;

        let pageNumberParam = Number($location.search().pageNumber);
        // NaN will always be less than 0
        if (pageNumberParam >= 0 && pageNumberParam < vm.pages.length)
            return pageNumberParam;
        
        return 0;   
    };

    vm.setPageByNumber = function(pageIndex, isInit=false) {
        vm.pageNumber = pageIndex;
        vm.pageName = vm.pages[pageIndex].name;
        // Update search params in this way to keep the others that are not
        // related to page (e.g. debug, print)
        let searchDict = $location.search();
        searchDict.pageName = vm.pageName;
        searchDict.pageNumber = pageIndex;
        $location.search(searchDict);
        // In order to not break the back button and allow the user
        // to return to the page they came from, do not add a new
        // browser history the first time the search params are updated.
        if (isInit)
            $location.replace();
    };

    vm.removePrintOnlyPages = function() {
        let p;
        for (p=0; p<vm.pages.length; p++) {
            if (!!vm.pages[p].printOnly)
                vm.pages.splice(p, 1);
        }        
    }


    vm.init = function() {
        // Unless in print mode, remove the printOnly pages.
        if (!$rootScope.print)
            vm.removePrintOnlyPages();
        
        // get the page from the url
        vm.pageNumber = vm.getPageNumber();
        vm.setPageByNumber(vm.pageNumber, true);
        vm.setupPage();
    };

    // watch for when the route is updated by something other than this controller
    // if it is, then reinitialize the page again
    $scope.$on('$routeUpdate', function() {
        let ls = $location.search();
        if (ls.pageName !== vm.pageName || ls.pageNumber !== vm.pageNumber) {
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
