'use strict';


angular.module('app', [
	'ngRoute',
	'app.book',
	'app.frieze',
	'ngLoadScript',
])
// bootstrap the directives
.directive('canvasCenteredDrawing', canvasCenteredDrawingDirective)
.directive('circularTessellation', circularTessellationDirective);
