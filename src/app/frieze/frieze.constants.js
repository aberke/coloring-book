
/*
Define how symmetry set lines should be show with RaphaelJS attributes.
*/
const SYMMETRY_SET_STYLES = {
	h1: {
		'stroke': 'rgba(255, 0, 0, 0.6)',
		'stroke-width': 4
	},
	v1: {
		// mediumpurple
		'stroke': 'rgba(147,112,219, 0.6)',
		'stroke-width': 4
	},
	v2: {
		// darkmagenta
		'stroke': 'rgba(139,0,139,0.6)',
		'stroke-width': 4
	},
	g: {
		// green
		'stroke': 'rgba(68, 182, 58, 0.7)',
		'stroke-dasharray': '-',
		'stroke-width': 4,
    },
    r1: {
		'stroke': 'coral',
		'stroke-width': 4,
    },
    r2: {
		'stroke': 'orange',
		'stroke-width': 4,
	}
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
	'p11g': {
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
			'Glide reflection',
			'Order-2 Rotations',
		],
	},
};
