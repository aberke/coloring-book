
/*
Controller for the frieze page
*/
function friezePageCntl($scope) {

	$scope.friezeGroupsData = friezeGroupsData;
	$scope.selectedGroupName = "p1";

	$scope.showGroupDescription = false;
	$scope.showSymmetrySets = false;

	$scope.selectGroup = function(groupName) {
		$scope.selectedGroupName = groupName;
	}

	$scope.showGroupDetails = function() {
		// toggle showing the group description
		$scope.showGroupDescription = !$scope.showGroupDescription;
		// toggle showing the symmetry sets
		$scope.showSymmetrySets = !$scope.showSymmetrySets;
	}
}
