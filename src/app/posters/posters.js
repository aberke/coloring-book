'use strict';

angular.module('app.posters', [])
.controller('PostersCntl', function($anchorScroll, $routeParams) {
	/*
	Takes a route like /posters/:posterName and tells view how to show
	the right posterPage
	To add a poster:
		- put an HTML partial in the /posters directory with {name}
		- add {name} to the vm.posteNames list
	**/

	let vm = this;

	vm.posterPageSrcBase = '/app/posters';
	vm.getPosterPageSrc = function(name) {
		return (vm.posterPageSrcBase + '/' + name + '.html');
	};

	vm.posterNames = [
		'you-may-know',
		'triangles',
		'cn-2-5',
		'cn-6-9',
	];


	vm.init = function() {
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
