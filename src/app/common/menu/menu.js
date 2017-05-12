'use strict';

angular.module('app.menu', [])
.controller('MenuCntl', function() {

	let vm = this;

	vm.open = false;

	vm.open = function() {
		vm.opened = true;
	}

	vm.close = function() {
		vm.opened = false;
	}
});
