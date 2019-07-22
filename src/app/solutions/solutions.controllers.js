'use strict';

function SolutionsPageCntl($location, $anchorScroll) {

	// view model is this SolutionsPageCntl
	let vm = this;

	vm.sections = [
		"shapes",
		"frieze",
		"wallpaper"
	];

	vm.selectedSection = $location.search().section || "shapes";

	vm.selectSection = function(section) {
		vm.selectedSection = section;
		$location.search("section", section);
		$anchorScroll()
	};
}
