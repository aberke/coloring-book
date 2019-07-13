/*
Use
--------
<circular-pattern
	with-redraw  // whether should be redrawn on click
	as-flower
	rings=[{number between 0 and 1}]  // list for creating rings below pattern, where each number marks fraction of pattern's radius to draw at
	rotations={number}
	initial-rotation={number}
	with-reflection={true|false}
	tap-reflect={"H"|"V"} // mutually exclusive with with-redraw
	slices-count={number}
	levels={number}
	margin={number}
	inscribed={"circle"|"square"|...}
	mirror-lines={number} // if set, draws mirror lines through the shape
	redraw-fn={"nameOfFunctionToCallToRedraw"}
></circular-pattern>
**/
function circularPatternDirective($location) {
	return {
		restrict: "EAC", //E = element, A = attribute, C = class, M = comment
		scope: {
			// Binds directive's scope to the following attributes.
			// '?' indicates that the attribute is optional.
			initialRotation: "@?",
			inscribed: "@?",
			levels: "@?",
			margin: "@?",
			mirrorLines: "@?",
			rotations: "@",
			slicesCount: "@?",
			withReflection: "@?",
			// Reflects across the inscribed shape.
			// (mutually exclusive with with-redraw and requires inscribed shape)
			tapReflect: "@?",
			// This exposes the redrawFn to the parent scope.
			// An isolated scope is used for the redraw fn with a namable
			// attribute so that a call to one directive's redraw fn does not
			// trigger another directive's fn.
			redrawFn: "=?",
		},
		link: function (scope, element, attrs) {

			scope.circularPattern;

			//DOM manipulation

			// get the element to draw canvas paper on and make it sq
			let elt = element[0];
			// add the canvas class in case not already there.  This adds style { display: block }.
			elt.className += " canvas";
			let size = elt.clientWidth;
			let margin = Number(scope.margin || 0);
			let diameter = size - margin;
			if (diameter <= 0)  // applicable for when CSS says display=none
				return;

			elt.style.height = String(size) + "px";
			elt.style.padding = 0; // remove padding used to make square with CSS

			// create the canvas paper and define it's size
			let paper = new Raphael(elt);
			let inscribedShapePathset;
			let origin = getCanvasCenter(paper);

			let asFlower = ("asFlower" in attrs && attrs.asFlower !== "false") ? true : false;
			let withRedraw = (("withRedraw" in attrs) && (attrs.withRedraw != "false"));
			let tapReflect = attrs.tapReflect;  // mutually exclusive with with-redraw

			// Default animation time in ms
			let animateMs = 3000;
			
			function collectDrawOptions() {
				let options = {
					initialRotation: (!!scope.initialRotation) ? Number(scope.initialRotation) : null,
					rotations: Number(scope.rotations || 2),
					levels: Number(scope.levels || 1),
					withReflection: scope.withReflection ? true : null,
					slicesCount: attrs.slicesCount ? Number(attrs.slicesCount) : null,
					slicesPathList: (!!attrs.slicesPathList) ? JSON.parse(attrs.slicesPathList) : null,
					asFlower: asFlower,
				};
				// allow passing ?animate option in URL bar
				if ($location.search().animate)
					options.animateMs = animateMs;

				return options;
			}

			// draw concentric rings below pattern
			// radius of ring is decided by the ringRadiusFraction
			function drawRings(rings) {
				if (!rings || !rings.length)
					return;

				rings.forEach(function(ringRadiusFraction){
					// ring radius fraction must be between 0 and 1
					if (ringRadiusFraction <= 0 || ringRadiusFraction > 1)
						return;

					paper.circle(origin.X, origin.Y, (ringRadiusFraction/2)*diameter);
				});
			}

			function draw(options) {
				if (scope.inscribed)
					inscribedShapePathset = drawInscribingShape(paper, origin, diameter, scope.inscribed, options.initialRotation || 0);

				let rings = JSON.parse(attrs.rings || "[]");
				drawRings(rings);

				scope.circularPattern = new CircularPattern(paper, origin, diameter, options);

				// draw mirror lines last so that they sit on top
				if (scope.mirrorLines)
					drawMirrorLines(paper, origin, scope.mirrorLines);
			}

			scope.redrawFn = function(opts = {}) {
				// clear the previous CircularPattern instance
				scope.circularPattern.clear();

				// & redraw new instance of the pattern
				// (when redrawing, animate the drawing of rotations)
				let options = collectDrawOptions();
				options.animateMs = animateMs;
				// An outside caller could have also passed options - include those too.
				Object.assign(options, opts);
				draw(options);
				analytics.trackRedraw("CircularPattern");
			}

			draw(collectDrawOptions());

			 // with-redraw and tap-reflect are mutually exclusive.
			let onclickFn;
			if (withRedraw)
				onclickFn = scope.redrawFn;
			else if (tapReflect && inscribedShapePathset)
				onclickFn = util.getReflectFn(inscribedShapePathset, origin, tapReflect, animateMs);

			// Attach redraw handler if with-redraw flag was present
			if (onclickFn) {
				elt.className += " clickable";
				paper.canvas.addEventListener("mouseup", onclickFn);
				element.on("$destroy", function() {
					paper.canvas.removeEventListener("mouseup", onclickFn);
				});
			}
		}
	};
}
