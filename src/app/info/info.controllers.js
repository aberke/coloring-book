'use strict';


/*
There is one large HTML page for the multiple info views/sections.
The InfoCntl handles jumping to the right section
*/
function InfoCntl($anchorScroll, $location, $timeout) {
    // view model is this InfoCntl
    let vm = this;
    const timeout = 3000;

    // scroll to the section indicated by the hash
    vm.setupPage = function() {
        // Timeout needed for nonlocal site page
        $timeout(function() {
            $anchorScroll($location.hash());
        }, timeout);
    };

    vm.setupPage();
}
