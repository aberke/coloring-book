function canvasCenteredDrawingDirective($window) {
	return {
		restrict: "EAC", //E = element, A = attribute, C = class, M = comment
		link: function ($scope, element, attrs) {
			//DOM manipulation

			// get the element to draw canvas paper on and make it sq
			let elt = element[0];
			elt.style.height = (String(elt.clientWidth) + "px");
			elt.style.padding = 0; // remove padding used to make square with CSS

			let paper = new Raphael(elt);
			// add the canvas class in case not already there
			elt.className += " canvas";

			// get the drawFunction
			let drawFunction = attrs.drawFunction ? $window[attrs.drawFunction] : "drawCircle";

			// safely get the options -- yeah not that safe
			let functionOptions = {};
			let options = {};
			try {
				functionOptions = JSON.parse(attrs.functionOptions || "{}");
				options = JSON.parse(attrs.options || "{}");
			} catch(e) {}

			let drawing = drawInCanvasCenter(paper, drawFunction, functionOptions, options);

			// if this is a part of a text-content-graphic, style for it
			let eltParent = element.parent();
			let eltGrandparent = element.parent().parent();
			if (eltParent.hasClass("text-content-graphic") || eltGrandparent.hasClass("text-content-graphic")) {

				drawing.pathSet.attr({
				    'stroke-width': options['stroke-width'] || 2,
				    // default linecap is 'butt' which doesn't look right with thick strokes
				    // Docs: https://www.w3.org/TR/SVG/painting.html#StrokeLinecapProperty
				    'stroke-linecap': 'square', // default is butt cap.
				});
			}
		}	
	};
}
