/*
Templates
Currently not in an html template file because that would require running a server
*/

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
        <span class='hover-description'>: {{ patternDescription }}</span>
    </div>
    <div id='canvas' class='canvas'></div>
  `;
  return html;
}

var patternsData = {
	'p1': {},
	'p11m': {},
	'p2mm': {
		generators: [1, 3],
		description: 'Horizontal Reflection + Vertical Reflections + Order-2 Rotations + Translation',
	},
};


