
/*
Controller for the wallpaper page
*/
function WallpaperPageCntl($location, $anchorScroll) {

	// view model is this WallpaperPageCntl
	let vm = this;

	vm.wallpaperDescription = "The wallpaper patterns repeat in multiple directions.   The simplest patterns to see are those that translate from top to bottom, and left to right, but other patterns have more symmetries than just translation: rotations, mirror reflections, and glide reflections.  There are exactly 17 ways symmetry groups that combine these symmetries in the plane.";

	vm.wallpaperGroups = [
		{
			name: "p1",
			description: "This is the simplest symmetry group. It consists only of translations.",
		},
		{
			name: "pm",
			description: "This group contains mirror reflections. The axes of mirror reflection are parallel to one axis of translation and perpendicular to the other axis of translation.  There are neither rotations nor glide reflections.",
		},
		{
			name: "pg",
			description: "This group has glide reflections. The direction of the glide reflection is parallel to one axis of translation and perpendicular to the other axis of translation. There are neither rotations nor mirror reflections.",
		},
		{
			name: "cm",
			description: "This group contains mirror reflections and glide reflections with parallel axes. The axes of the mirror reflections bisect the angle formed by the translations (so the lattice is rhombic).  There are no rotations in this group.",
		},
		{
			name: "p2",
			description: "This group has ½ turn rotations.",
		},
		{
			name: "pgg",
			description: "This group contains no mirror reflections, but it has glide-reflections and ½ turn rotations. There are perpendicular axes for the glide reflections, and the rotation centers do not lie on the axes.",
		},
		{
			name: "pmg",
			description: "This group contains mirror reflections and glide reflections which are perpendicular to the mirror reflection axes. It has ½ turn rotations on the glide axes, halfway between the mirror reflection axes.",
		},
		{
			name: "pmm",
			description: "This symmetry group contains perpendicular axes of mirror reflection, with ½ turn rotations where the axes intersect.",
		},
		{
			name: "cmm",
			description: "This group has perpendicular mirror reflection axes, as does group pmm, but this group also has additional ½ turn rotations. The centers of the additional rotations do not lie on the reflection axes.",
		},
		{
			name: "p4",
			description: "This group has ¼ turn rotations and ½ turn rotations. The centers of the ½ turn rotations are midway between the centers of the ¼ turn rotations. There are no reflections.",
		},
		{
			name: "p4g",
			description: "This group contains reflections and ½ turn and ¼ turn rotations. There are two perpendicular axes of reflection passing through each order ½ turn rotation, but the ¼ turn rotation centers do not lie on any reflection axis. There are four directions of glide reflection.",
		},
		{
			name: "p4m",
			description: "This group has ½ turn and ¼ turn rotations and four axes of mirror reflection. Every rotation center lies on some reflection axes: The centers of the ¼ turn rotations are at the intersection of four mirror reflection axes.  The centers of the ½ turn rotations sit on the intersection of two mirror reflection axes and two different reflection glide reflection axes.",
		},
		{
			name: "p3",
			description: "This is the simplest group that contains a ⅓ turn rotation.  It has no reflections.",
		},
		{
			name: "p31m",
			description: "This group contains mirror reflections, glide reflections, and ⅓ turn rotations. Some of the centers of rotation lie on the reflection axes, and some do not.",
		},
		{
			name: "p3m1",
			description: "This group has mirror reflections, glide reflections, and ⅓ turn rotations. All of the centers of rotation lie on the reflection axes.",
		},
		{
			name: "p6",
			description: "This group has ⅙ turn, ⅓ turn, and ½ turn rotations, but no mirror or glide reflections.",
		},
		{
			name: "p6m",
			description: "This group has ⅙ turn, ⅓ turn, and ½ turn rotations, as well as mirror and glide reflections. The axes of reflection meet at all the centers of rotation.",
		}
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

	// showDescriptions controls whether to show extra information.
	// If ?showDescriptions is set in the URL params, then the control is
	// initialized to true.
	// Note this avoids updating URL param on toggling so that page does not
	// reload and control/collapsed transition is smoother.
	vm.showDescriptions = (!!$location.search().showDescriptions);
	vm.toggleShowDescriptions = function() {
		vm.showDescriptions = !vm.showDescriptions;
	}
}
