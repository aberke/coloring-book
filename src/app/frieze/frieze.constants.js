
const frieze = (function() {
    "use strict";

	/*
	Define how symmetry set lines should be show with RaphaelJS attributes.
	*/
	const SYMMETRY_SET_STYLES = {
		h1: {
			'stroke': '#007f70',
			'stroke-width': 2
		},
		v1: {
			'stroke': '#007f70',
			'stroke-width': 2
		},
		v2: {
			'stroke': '#007f70',
			'stroke-width': 2
		},
		g: {
			'stroke': 'purple',
			'stroke-dasharray': '-',
			'stroke-width': 2,
	    },
	    r1: {
			'stroke': '#e65c00',
			'stroke-width': 4,
	    },
	    r2: {
			'stroke': '#e65c00',
			'stroke-width': 4,
		}
	};

	const GROUP_DATA = {
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
    return {
        GROUP_DATA: GROUP_DATA,
        SYMMETRY_SET_STYLES: SYMMETRY_SET_STYLES
    };
}());
