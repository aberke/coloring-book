
/* 
Define the color pallette
*/

const COLORS = {
	LIGHT_GRAY: "#d3d3d3",
	PURPLE: "#670067",
	AQUA: "#3bcca6",
	YELLOW: "#ffe100",
};


// Ways to style the sides of a shape
// with path.attr({'stroke-dasharray': string})
const STROKE_DASH_ARRAY = ["", ".", "-", "-.", "--..", "-..", ". ", "- ", "--", "- .", "--."];

// Ways to fill a shape as a "coloring"
// Using patterns so that on black and white paper the coloring is still clear
const COLORING_FILL_ARRAY = [
	"", // first fill is the empty fill
	COLORS.AQUA, // 1 solid fill
	// pattern SVGs
	"url(/assets/img/coloring-fills/coloring-fill-purple.svg)",
	"url(/assets/img/coloring-fills/coloring-fill-yellow.svg)",
	"url(/assets/img/coloring-fills/coloring-fill-black.svg)",
	"url(/assets/img/coloring-fills/coloring-fill-gray.svg)",
];
