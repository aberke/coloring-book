function canvasCenteredDrawingDirective($window) {
	return {
		restrict: 'EA', //E = element, A = attribute, C = class, M = comment
		link: function (scope, element, attrs) {
			//DOM manipulation

			// get the element to draw canvas paper on and make it sq
			let elt = element[0];
			elt.style.height = (String(elt.clientWidth) + "px");
			elt.style.padding = 0; // remove padding used to make square with CSS

			let paper = new Raphael(elt);
			// add canvas-centered-drawing class + the canvas class in case not already there
			elt.className += " canvas canvas-centered-drawing";

			// get the drawFunction
			let drawFunction = attrs.drawFunction ? $window[attrs.drawFunction] : 'drawCircle';

			// safely get the options -- yeah not that safe
			let functionOptions = {};
			let options = {};
			try {
				functionOptions = JSON.parse(attrs.functionOptions || "{}");
				options = JSON.parse(attrs.options || "{}");
			} catch(e) {}

			scope.drawing =  drawInCanvasCenter(paper, drawFunction, functionOptions, options);
			
			// if this is a part of a text-content-graphic, style for it
			// CSS styles do not work here :(
			let eltParent = element.parent();
			let eltGrandparent = element.parent().parent();
			if (eltParent.hasClass("text-content-graphic") || eltGrandparent.hasClass("text-content-graphic")) {

				scope.drawing.pathSet.attr({
				    'stroke-width': options['stroke-width'] || 2,
				    // default linecap is 'butt' which doesn't look right with thick strokes
				    // Docs: https://www.w3.org/TR/SVG/painting.html#StrokeLinecapProperty
				    'stroke-linecap': 'square', // default is butt cap.
				});
			}
		}	
	};
}
