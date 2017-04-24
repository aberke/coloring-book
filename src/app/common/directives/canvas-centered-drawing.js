function canvasCenteredDrawingDirective($window) {
	return {
		restrict: 'EAC', //E = element, A = attribute, C = class, M = comment
		link: function ($scope, element, attrs) {
			//DOM manipulation

			// get the element to draw canvas paper on and make it sq
			var elt = element[0];
			elt.style.height = (String(elt.clientWidth) + "px");
			var paper = new Raphael(elt);
			// add the canvas class in case not already there
			elt.className += " canvas";

			// get the drawFunction
			var drawFunction = attrs.drawFunction ? $window[attrs.drawFunction] : 'drawCircle';

			// safely get the options -- yeah not that safe
			var functionOptions = {};
			var options = {};
			try {
				functionOptions = JSON.parse(attrs.functionOptions || "{}");
				options = JSON.parse(attrs.options || "{}");
			} catch(e) {}

			drawInCanvasCenter(paper, drawFunction, functionOptions, options);
		}	
	};
}
