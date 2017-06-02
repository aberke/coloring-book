'use strict';

angular.module('app.posters', [])
.controller('PostersCntl', function($anchorScroll, $routeParams) {
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
		'you-may-know',
		'triangles',
		'cn-2-5',
		'cn-6-9',
	];

	let friezePosterUrlBase = '/#!/frieze?print';
	let otherPostersUrlBase = '/#!/posters/';

	function setupFriezePosters() {
		friezeGroupNames.forEach(function(fg) {
			vm.friezePosters[fg] = friezePosterUrlBase + '&' + fg;
		});
	}
	function setupOtherPosters() {
		otherPosterNames.forEach(function(pName) {
			vm.otherPosters[pName] = otherPostersUrlBase + pName;
		});
	}


	vm.init = function() {
		setupFriezePosters();
		setupOtherPosters();

		// get the page from the url
		let posterName = $routeParams.posterName;
		if (!posterName || vm.posterNames.indexOf(posterName) < 0)
			return;

		vm.posterName = posterName;
		vm.posterPageSrc = vm.getPosterPageSrc(posterName);

		// scroll to the top
		$anchorScroll();	
	};

	vm.init();
});
