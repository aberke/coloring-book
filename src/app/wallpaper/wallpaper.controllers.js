
/*
Controller for the wallpaper page
*/
function WallpaperPageCntl($location) {
	// view model is this WallpaperPageCntl
	let vm = this;

	vm.wallpaperGroupNames = [
		"p1", "pm", "pg", "cm", "p2", "pgg", "pmg", "pmm", "cmm",
		"p4", "p4g", "p4m",
		"p3", "p31m", "p3m1",
		"p6", "p6m"
	];

	vm.selectedGroupName = $location.search().group || "p1";

	vm.drawPathFunctions = [
		trianglePath,
		trianglesPath2,
		trianglesPath3,
		trianglesPath4,
		slantedSlices,
		petalsEllipseWithDiamondPath,
		petalEllipse,
		quarterEllipse,
		curves2,
		curves3,
		curves4,
		curves5
	];
	vm.selectGroup = function(groupName) {
		vm.selectedGroupName = groupName;
		$location.search("group", groupName);
	};
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
