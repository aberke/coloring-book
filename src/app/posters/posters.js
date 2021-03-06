'use strict';

angular.module('app.posters', [])
.controller('PostersCntl', function($anchorScroll, $location) {
	/*
	For Frieze Pattern posters: redirects to frieze pattern page

	For other posters:
		Takes a route like /posters/:posterName and tells view how to show
		the right posterPage
		To add a poster:
			- put an HTML partial in the /posters directory with {name}
			- add {name} to the vm.otherPosterNames list
	**/
	let vm = this;
	vm.showVersion = 0; // Some posters hide/show based on parameter 's'


	vm.posterPageSrcBase = '/app/posters';
	vm.getPosterPageSrc = function(name) {
		return (vm.posterPageSrcBase + '/' + name + '.html');
	};

	vm.friezePosters = {};
	vm.otherPosters = {};
	let friezeGroupNames = [
		'p1',
		'p11m',
		'p1m1',
		'p11g',
		'p2',
		'p2mg',
		'p2mm'
	];
	let otherPosterNames = [
		'book-title',
		'book-parts-titles',
		'square-reflections-challenges',
		'you-may-know',
		'wallpaper-repeated',
		'radial-ideas',
	];

	let friezePosterUrlBase = '/frieze?print';
	let otherPostersUrlBase = '/posters?poster-name=';

	function setupFriezePosters() {
		friezeGroupNames.forEach(function(fg) {
			vm.friezePosters[fg] = friezePosterUrlBase.concat('&group=', fg);
		});
	}
	function setupOtherPosters() {
		otherPosterNames.forEach(function(pName) {
			vm.otherPosters[pName] = otherPostersUrlBase + pName;
		});
	}

	function getShowVersion() {
		return $location.search()['s'] || 0;
	}


	vm.init = function() {
		setupOtherPosters();
		setupFriezePosters();

		// get the page from the url
		let posterName = $location.search()['poster-name'] || $location.search()['p'];
		if (!posterName || otherPosterNames.indexOf(posterName) < 0) 
			return;

		vm.posterName = posterName;
		vm.posterPageSrc = vm.getPosterPageSrc(posterName);

		vm.showVersion = getShowVersion();

		// scroll to the top
		$anchorScroll();	
	};

	vm.init();
});
