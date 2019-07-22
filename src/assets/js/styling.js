
const styling = (function() {
    'use strict';

    console.log('styling')

	const COLORS = {
		GRAY: "#A9A9A9",
		LIGHT_GRAY: "#d3d3d3",
		PURPLE: "#670067",
		AQUA: "#3bcca6",
		YELLOW: "#ffe100",
		CORAL: "#FF7F50",
	};


	let coloringFillArray;
	function getColoringFillArray() {
		if (!!GRAYSCALE) {
			coloringFillArray = [
				"",
				COLORS.GRAY,
				COLORS.LIGHT_GRAY
			];
		} else {
			// Using patterns so that on black and white paper the coloring is still clear
			coloringFillArray = [
				"", // first fill is the empty fill
				COLORS.AQUA, // 1 solid fill
				// pattern SVGs
				"url(/assets/img/coloring-fills/coloring-fill-purple.svg)",
				"url(/assets/img/coloring-fills/coloring-fill-yellow.svg)",
				"url(/assets/img/coloring-fills/coloring-fill-black.svg)",
				"url(/assets/img/coloring-fills/coloring-fill-gray.svg)",
			];
		}
		return coloringFillArray;
	}


    return {
		// Ways to style the sides of a shape
		// with path.attr({'stroke-dasharray': string})
        strokeDashArray: ["", "-", ".", "-.", "--..", "-..", ". ", "- ", "--", "- .", "--."],
        
		// Get ways to fill a shape as a "coloring"
        getColoringFillArray: getColoringFillArray,
    };
}());
