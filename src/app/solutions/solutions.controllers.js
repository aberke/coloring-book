'use strict';

function SolutionsPageCntl($location, $anchorScroll) {

	// view model is this SolutionsPageCntl
	let vm = this;

	vm.sections = [
		"shapes & symmetries",
		"frieze groups",
		"wallpaper groups"
	];

	vm.selectedSection = $location.search().section || "shapes & symmetries";

	vm.selectSection = function(section) {
		vm.selectedSection = section;
		$location.search("section", section);
		$anchorScroll()
	};
}
