
/*
Define how symmetry set lines should be show with RaphaelJS attributes.
*/
const SYMMETRY_SET_STYLES = {
	'h1': {'stroke': 'red', 'stroke-width': 4},
	'v1': {'stroke': 'mediumpurple', 'stroke-width': 4},
	'v2': {'stroke': 'darkmagenta', 'stroke-width': 4},
	'g': {
    	'stroke': 'green',
    	'stroke-dasharray': '-',
    	'stroke-width': 4,
    },
};


// TODO: move this data to a service,
// and inject that service in the FriezePageCntl and directive
const friezeGroupsData = {
	'p1': {
		description: 'Translation only',
	},
	'p11m': {
		description: 'Horizontal reflection',
	},
	'p1m1': {
		description: 'Vertical Reflection',
	},
	'p1a1': {
		description: 'Glide Reflection',
	},
	'p2': {
		description: 'Order-2 Rotations',
	},
	'p2mg': {
		description: 'Vertical Reflection + Glide Reflection + Order-2 Rotations',
	},
	'p2mm': {
		description: 'Horizontal Reflection + Vertical Reflections + Order-2 Rotations + Translation',
	},
};
