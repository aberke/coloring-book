
/*
Controller for the wallpaper page
*/
function WallpaperPageCntl($location) {
	// view model is this WallpaperPageCntl
	let vm = this;

	vm.wallpaperGroupNames = ["p1", "pm", "pg", "cm", "p2", "pmm"];

	vm.selectedGroupName = $location.search().group || "p1";

	vm.selectGroup = function(groupName) {
		vm.selectedGroupName = groupName;
		$location.search("group", groupName);
	};
}
