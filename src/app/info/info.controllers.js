'use strict';


/*
There is one large HTML page for the multiple info views/sections.
The InfoCntl handles jumping to the right section
*/
function InfoCntl($location, $anchorScroll) {
    // view model is this InfoCntl
    let vm = this;

    // scroll to the section indicated by the hash
    vm.setupPage = function() {
        $anchorScroll();
    };

    vm.setupPage();
}
