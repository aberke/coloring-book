
/*
Controller for the frieze page
*/
function FriezePageCntl($location) {

	// view model is this FriezePageCntl
	let vm = this;

	vm.friezeGroupsData = frieze.GROUP_DATA;
	vm.selectedGroupName = $location.search().group || "p11g";

	vm.showGroupDescription = false;
	vm.showSymmetrySets = false;

	vm.selectGroup = function(groupName) {
		vm.selectedGroupName = groupName;
		$location.search("group", groupName);
	};

	vm.showGroupDetails = function() {
		// toggle showing the group description
		vm.showGroupDescription = !vm.showGroupDescription;
		// toggle showing the symmetry sets
		vm.showSymmetrySets = !vm.showSymmetrySets;
	};
}
