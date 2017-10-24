/*
Use
--------
<div
	circular-tessellation
	class="canvas"
	with-redraw  // whether should be redrawn on click
	rings=[{number between 0 and 1}]  // list for creating rings below tessellation, where each number marks fraction of tessellation's radius to draw at
	rotations={number}
	initial-rotation={number}
	slices-count={number}
	levels={number}
	margin={number}
	inscribed={"circle"|"square"|...}
	mirror-lines={number} // if set, draws mirror lines through the shape
></div>
**/
function circularTessellationDirective($location) {
	return {
		restrict: "EAC", //E = element, A = attribute, C = class, M = comment
		scope: {},
		link: function (scope, element, attrs) {

			scope.circularTessellation;

			//DOM manipulation

			// get the element to draw canvas paper on and make it sq
			let elt = element[0];
			let size = elt.clientWidth;
			if (size <= 0) // applicable for when CSS says display=none
				return;
			elt.style.height = String(size) + "px";
			elt.style.padding = 0; // remove padding used to make square with CSS

			// create the canvas paper
			let paper = new Raphael(elt);
			// add the canvas class in case not already there
			elt.className += " canvas";

			let origin = getCanvasCenter(paper);

			let margin = Number(attrs.margin || 0);
			let diameter = size - margin;

			let rings = JSON.parse(attrs.rings || "[]");

			// can inscribe within a shape
			let inscribed = attrs.inscribed;

			// can draw mirror lines
			let mirrorLines = attrs.mirrorLines;

			let asFlower = ("asFlower" in attrs && attrs.asFlower !== "false") ? true : false;

			let rotations = (!!attrs.rotations) ? Number(attrs.rotations) : null;
			let initialRotation = (!!attrs.initialRotation) ? Number(attrs.initialRotation) : null;
			let options = {
				initialRotation: initialRotation,
				rotations: rotations,
				levels: (!!attrs.levels) ? Number(attrs.levels) : null,
				withReflection: attrs.withReflection ? true : null,
				slicesCount: attrs.slicesCount ? Number(attrs.slicesCount) : null,
				slicesPathList: (!!attrs.slicesPathList) ? JSON.parse(attrs.slicesPathList) : null,
				asFlower: asFlower,
			};
			// allow option to go to pass ?animate option in URL bar
			if ($location.search().animate)
				options.drawAnimationInterval = 1000;


			// draw concentric rings below tessellation
			// radius of ring is decided by the ringRadiusFraction
			function drawRings() {
				if (!rings || !rings.length)
					return;

				rings.forEach(function(ringRadiusFraction){
					// ring radius fraction must be between 0 and 1
					if (ringRadiusFraction <= 0 || ringRadiusFraction > 1)
						return;

					paper.circle(origin.X, origin.Y, (ringRadiusFraction/2)*diameter);
				});
			}

			function draw() {
				if (inscribed)
					drawInscribingShape(paper, origin, diameter, inscribed, initialRotation || 0);

				drawRings();

				scope.circularTessellation = new CircularTessellation(paper, origin, diameter, options);
				if (!asFlower && rings && rings.length) // fill the path so that it sits above the rings
					scope.circularTessellation.pathSet.attr("fill", "white");

				// draw mirror lines last so that they sit on top
				if (mirrorLines)
					drawMirrorLines(paper, origin, mirrorLines);
			}

			function redraw() {
				// clear the previous CircularTessellation instance
				scope.circularTessellation.clear();

				// & redraw new instance of the tessellation
				// (when redrawing, animate the drawing of rotations)
				options.drawAnimationInterval = 1000;
				draw();
				trackRedraw("CircularTessellation");
			}

			// attach redraw handler if with-redraw flag was present
			if (("withRedraw" in attrs) && (attrs.withRedraw != "false")) {
				elt.className += " clickable";
				paper.canvas.addEventListener("mouseup", redraw);
			}

			draw();
		}
	};
}
