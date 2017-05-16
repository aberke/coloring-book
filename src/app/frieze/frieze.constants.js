
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
		generators: ['Translation'],
	},
	'p11m': {
		generators: [
			'Translation',
			'Horizontal reflection'
		],
	},
	'p1m1': {
		generators: [
			'Translation',
			'Vertical reflection'
		],
	},
	'p1a1': {
		generators: [
			'Translation',
			'Glide reflection'
		],
	},
	'p2': {
		generators: [
			'Translation',
			'Order-2 Rotations'
		],
	},
	'p2mg': {
		generators: [
			'Translation',
			'Vertical reflection',
			'Glide reflection',
			'Order-2 Rotations',
		],
	},
	'p2mm': {
		generators: [
			'Translation',
			'Horizontal reflection',
			'Vertical reflection',
			'Order-2 Rotations',
		],
	},
};
