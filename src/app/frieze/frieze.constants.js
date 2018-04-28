
const frieze = (function() {
    'use strict';


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
        GROUP_DATA: GROUP_DATA
    };
}());
