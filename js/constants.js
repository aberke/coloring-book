/*
Templates
Currently not in an html template file because that would require running a server
*/

var SYMMETRY_SET_STYLES = {
	'h1': {'stroke': 'red', 'stroke-width': 4},
	'v1': {'stroke': 'mediumpurple', 'stroke-width': 4},
	'v2': {'stroke': 'darkmagenta', 'stroke-width': 4},
	'g': {
    	'stroke': 'green',
    	'stroke-dasharray': '-',
    	'stroke-width': 4,
    },
}

var getFriezeTemplate = function() {
  return `
    <div id='frieze-page'>
        <h1>FRIEZE</h1>
        <p>Groups</p>
    </div>
  `;	
}

var getPatternTemplate = function() {
  var html = `
    <div id='title'>
        <h1>{{ patternName }}</h1>
        <span id='hover-description'>: {{ patternDescription }}</span>
    </div>
    <div id='canvas' class='canvas'></div>
  `;
  return html;
}

var patternsData = {
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
