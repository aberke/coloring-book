
/*
Controller for the wallpaper page
*/
function WallpaperPageCntl($location, $anchorScroll) {
	// view model is this WallpaperPageCntl
	let vm = this;

	vm.wallpaperGroupNames = [
		"p1", "pm", "pg", "cm", "p2", "pgg", "pmg", "pmm", "cmm",
		"p4", "p4g", "p4m",
		"p3", "p31m", "p3m1",
		"p6", "p6m"
	];

	vm.drawPathFunctions = [
		petalEllipse,
		quarterEllipse,
		curves2,
		curves3,
		curves4,
		curves5,
		petalsEllipseWithDiamondPath,
		slantedSlices,
		trianglesPath4,
		trianglesPath3,
		trianglesPath2,
		trianglePath
	];
	vm.selectGroup = function(groupName) {
		vm.selectedGroupName = groupName;
		$location.search("group", groupName);
	};
	// Initialize group from search params or default.
	vm.selectedGroupName = $location.search().group;
	if (!vm.selectedGroupName)
		vm.selectGroup("p4g");

	vm.selectDrawPathFunction = function(drawPathFunctionName) {
		// Initilize to default
		let drawPathFunction = vm.drawPathFunctions[0];

		vm.drawPathFunctions.forEach(f => {
			if (f.name == drawPathFunctionName)
				drawPathFunction = f;
		});
		vm.selectedDrawPathFunction = drawPathFunction;
		$location.search("drawPathFunction", drawPathFunction.name);
	}
	// Initialize drawPathFunction selection from search params or default.
	vm.selectDrawPathFunction($location.search().drawPathFunction);
}
