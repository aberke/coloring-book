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
function BookCntl($scope, $location, $anchorScroll, $timeout) {
	// view model is this BookCntl
	let vm = this;

	vm.pageSrcBase = '/app/book/pages';
	vm.bookPageUrl = function(p) {
		return vm.pageSrcBase + '/' + p;
	};

	vm.pages = [
		{
			name: 'cover',
			url: vm.bookPageUrl('book-page-cover.html'),
		}, {
			name: 'about',
			url: vm.bookPageUrl('book-page-about.html'),
		}, {
			name: 'guide',
			url: vm.bookPageUrl('book-page-guide.html'),
		}, {
			name: 'table-of-contents',
			url: vm.bookPageUrl('book-page-table-of-contents.html'),
		}, {
			name: 'nature-intro',
			url: vm.bookPageUrl('book-page-nature-intro.html'),
		}, {
			name: 'shapes-intro',
			url: vm.bookPageUrl('book-page-shapes-intro.html'),
		}, {
			name: 'cn-0',
			url: vm.bookPageUrl('book-page-shapes-cn-0.html'),
		}, {
			name: 'cn-1',
			url: vm.bookPageUrl('book-page-shapes-cn-1.html'),
		}, {
			name: 'cn-2',
			url: vm.bookPageUrl('book-page-shapes-cn-2.html'),
		}, {
			name: 'cn-3',
			url: vm.bookPageUrl('book-page-shapes-cn-3.html'),
		}, {
			name: 'cn-4',
			url: vm.bookPageUrl('book-page-shapes-cn-4.html'),
		}, {
			name: 'cn-5',
			url: vm.bookPageUrl('book-page-shapes-cn-5.html'),
		}, {
		// 	name: 'cn-6',
		// 	url: vm.bookPageUrl('book-page-shapes-cn-6.html'),
		// }, {
			name: 'cn-7',
			url: vm.bookPageUrl('book-page-shapes-cn-7.html'),
		}, {
			name: 'cn-8',
			url: vm.bookPageUrl('book-page-shapes-cn-8.html'),
		}, {
			name: 'cn-9',
			url: vm.bookPageUrl('book-page-shapes-cn-9.html'),
		}, {
			name: 'cn-10',
			url: vm.bookPageUrl('book-page-shapes-cn-10.html'),
		}, {
			name: 'cn-11',
			url: vm.bookPageUrl('book-page-shapes-cn-11.html'),
		}, {
			name: 'cn-12',
			url: vm.bookPageUrl('book-page-shapes-cn-12.html'),
		}, {
			name: 'cn-13',
			url: vm.bookPageUrl('book-page-shapes-cn-13.html'),
		}, {
			name: 'cn-14',
			url: vm.bookPageUrl('book-page-shapes-cn-14.html'),
		}, {
			name: 'cn-15',
			url: vm.bookPageUrl('book-page-shapes-cn-15.html'),
		}, {
			name: 'cn-16',
			url: vm.bookPageUrl('book-page-shapes-cn-16.html'),
		}, {
			name: 'cn-17',
			url: vm.bookPageUrl('book-page-shapes-cn-17.html'),
		}, {
			name: 'cn-18',
			url: vm.bookPageUrl('book-page-shapes-cn-18.html'),
		}, {
			name: 'cn-19',
			url: vm.bookPageUrl('book-page-shapes-cn-19.html'),
		}, {
			name: 'dn-1',
			url: vm.bookPageUrl('book-page-shapes-dn-1.html'),
		}, {
			name: 'dn-2',
			url: vm.bookPageUrl('book-page-shapes-dn-2.html'),
		}, {
			name: 'dn-3',
			url: vm.bookPageUrl('book-page-shapes-dn-3.html'),
		}, {
			name: 'dn-4',
			url: vm.bookPageUrl('book-page-shapes-dn-4.html'),
		}, {
			name: 'dn-5',
			url: vm.bookPageUrl('book-page-shapes-dn-5.html'),
		}, {
			name: 'dn-6',
			url: vm.bookPageUrl('book-page-shapes-dn-6.html'),
		}, {
			name: 'dn-7',
			url: vm.bookPageUrl('book-page-shapes-dn-7.html'),
		}, {
			name: 'dn-8',
			url: vm.bookPageUrl('book-page-shapes-dn-8.html'),
		}, {
			name: 'dn-9',
			url: vm.bookPageUrl('book-page-shapes-dn-9.html'),
		}, {
			name: 'dn-10',
			url: vm.bookPageUrl('book-page-shapes-dn-10.html'),
		}, {
			name: 'dn-11',
			url: vm.bookPageUrl('book-page-shapes-dn-11.html'),
		}, {
			name: 'get-updates',
			url: vm.bookPageUrl('book-page-last.html'),
		}
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


	// Since page changes are triggered on mouse-over action,
	// only allow page changes from hover to happen in intervals
	vm.pageChangeReady = true;

	vm.triggerChangePageStart = function() {
		if (vm.changePageTimeout)
			$timeout.cancel(vm.changePageTimeout);

		vm.pageChangeReady = false;
		vm.changePageTimeout = $timeout(function() {
			vm.pageChangeReady = true;
		}, 3000);
	};

	vm.onHoverPreviousPage = function() {
		if (!vm.pageChangeReady || $location.search().develop)
			return;

		vm.previousPage();
	};

	vm.onHoverNextPage = function() {
		if (!vm.pageChangeReady || $location.search().develop)
			return;

		vm.nextPage();
	};

	// change to the previous page
	vm.previousPage = function() {
		vm.triggerChangePageStart();

		vm.animateNextPage = false;
		vm.animatePreviousPage = true;
		vm.changePage(vm.pageNumber - 1);
	};

	// change to the next page
	vm.nextPage = function() {
		vm.triggerChangePageStart();

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
				return page.name === pageName; // 'some' function will shortcircuit here if true
			};

			if (vm.pages.some(findSomePageNumber))
				return pageNumber;
		}
	}

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

	vm.setPageByNumber = function(pageIndex) {
		vm.pageNumber = pageIndex;
		vm.pageName = vm.pages[pageIndex].name;
		$location.search('pageNumber', pageIndex);
		$location.search('pageName', vm.pageName);
	};


	vm.init = function() {
		// get the page from the url
		vm.pageNumber = vm.getPageNumber();
		vm.setPageByNumber(vm.pageNumber);
		vm.setupPage();
	};

	// watch for when the route is updated by something other than this controller
	// if it is, then reinitialize the page again
	$scope.$on('$routeUpdate', function(current){
		if ($location.search().pageName !== vm.pageName || $location.search().pageNumber !== vm.pageNumber)
			vm.init();
	});

	vm.init();
}
