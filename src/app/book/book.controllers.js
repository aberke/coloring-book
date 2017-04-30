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
function BookCntl($location, $anchorScroll, $timeout) {
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
			name: 'guide',
			url: vm.bookPageUrl('book-page-coloring-guide.html'),
		}, {
			name: 'shapes-intro',
			url: vm.bookPageUrl('book-page-shapes-intro.html'),
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
			name: 'cn-6',
			url: vm.bookPageUrl('book-page-shapes-cn-6.html'),
		}, {
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
			name: 'get-updates',
			url: vm.bookPageUrl('book-page-last.html'),
		}
	];


	vm.setupPage = function() {
		vm.page = vm.pages[vm.pageIndex];
		vm.pageName = vm.page.name;

		// view should only show button to return to previous page
		// if there is a previous page
		vm.showPreviousPageBtn = (vm.pageIndex > 0) ? true : false;
		// view should only show button to return to next page
		// if there is a next page
		vm.showNextPageBtn = (vm.pageIndex < (vm.pages.length - 1)) ? true : false;	

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
		vm.changePage(vm.pageIndex - 1);
	};

	// change to the next page
	vm.nextPage = function() {
		vm.triggerChangePageStart();

		vm.animateNextPage = true;
		vm.animatePreviousPage = false;
		vm.changePage(vm.pageIndex + 1);
	};

	vm.changePage = function(pageIndex) {
		if (pageIndex < 0 || pageIndex > vm.pages.length)
			return;

		vm.pageIndex = pageIndex;
		vm.setPageNumber(pageIndex);
		vm.setupPage();
	};


	vm.getPageNumber = function() {
		// get the pageIndex from the search parameters if present
		// otherwise return the 0th page
		var pageNumberParam = Number($location.search().pageNumber);
		// NaN will always be less than 0
		if (pageNumberParam >= 0 && pageNumberParam < vm.pages.length)
			return pageNumberParam;
		
		return 0;	
	};

	vm.setPageNumber = function(pageNumber) {
		$location.search('pageNumber', pageNumber);
	};


	vm.init = function() {
		// get the page from the url
		vm.pageIndex = vm.getPageNumber();
		vm.setupPage();
	};

	vm.init();
}
