
// circular-tessellation directive
function circularTessellationDirective() {
	return {
		restrict: 'EAC', //E = element, A = attribute, C = class, M = comment
		link: function ($scope, element, attrs) {
			//DOM manipulation

			// get the element to draw canvas paper on and make it sq
			var elt = element[0];
			elt.style.height = (String(elt.clientWidth) + "px");
			// create the canvas paper
			var paper = new Raphael(elt);
			// add the canvas class in case not already there
			elt.className += " canvas";

			var origin = getCanvasCenter(paper);

			var margin = Number(attrs.margin || 0);
			var diameter = Math.min(paper.getSize().width, paper.getSize().height) - margin;

			var options = {
				rotations: attrs.rotations ? eval(attrs.rotations) : null,
				levels: attrs.levels ? eval(attrs.levels) : null,
				withReflection: attrs.withReflection ? true : null,
				slicesCount: attrs.slicesCount ? Number(attrs.slicesCount) : null,
				slicesPathList: attrs.slicesPathList ? eval(attrs.slicesPathList) : null,
				asFlower: attrs.asFlower ? eval(attrs.asFlower) : false,
			};

			function redraw() {
				paper.clear();
				// when redrawing, animate the drawing of rotations
				options.drawAnimationInterval = 1000;
				new CircularTessellation(paper, origin, diameter, options);
			}

			// attach redraw handler if with-redraw flag was present
			if (('withRedraw' in attrs) && (attrs.withRedraw != "false")) {
				elt.className += " clickable";
				paper.canvas.addEventListener('mouseup', redraw);
			}

			new CircularTessellation(paper, origin, diameter, options);
		}
	}	
}

// Generic canvas drawing directive
function canvasCenteredDrawingDirective() {
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
			var drawFunction = attrs.drawFunction ? attrs.drawFunction : drawCircle;

			drawFunction = eval('(' + attrs.drawFunction + ')');

			// safely get the options -- yeah not that safe
			var functionOptions = {};
			var options = {};
			try {
				functionOptions = JSON.parse(attrs.functionOptions || "{}");
				options = JSON.parse(attrs.options || "{}");
			} catch(e) {};

			drawInCanvasCenter(paper, drawFunction, functionOptions, options);
		}	
	}
}
