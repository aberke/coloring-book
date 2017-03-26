"use strict";


// Ways to style the sides of the polygon
// with path.attr({'stroke-dasharray': string})
const STROKE_DASH_ARRAY = ["", "-", ".", "--..", "-.", "-..", ". ", "- ", "--", "- .", "--."];


/**
Draws regular polygon with N sides/rotations
where the polygon sits with the bottom side horizontally
aligned along the x-axis.
*/
class RegularNGon {

	constructor(paper, origin, size, N, options) {
		this.paper = paper;
		this.origin = origin;
		this.size = size;
		this.N = N;

        this.options = options || {};

        // can optionally draw each side of polygon with a different stroke type
        this.useDifferentSideStrokes = options.useDifferentSideStrokes || false;
        this.sideStrokeOffset = options.sideStrokeOffset || 0;

		this.rotationTransformString = getRotationTransformString(this.origin, this.N);

		this.pathSet;
		this.draw();
	}


	draw() {
		let pathSet = this.paper.set(); // what will be returned

		// draw the bottom side of the polygon, oriented to lie horizontally flat
		let rotationRadians = 2*Math.PI/this.N;
		let halfRotationRadians = rotationRadians/2;
		
		let deltaX = (1/2)*this.size*Math.sin(halfRotationRadians);
		let deltaY = (1/2)*this.size*Math.cos(halfRotationRadians);
		let linePathList = [
			["M", this.origin.X - deltaX, this.origin.Y + deltaY],
			["L", this.origin.X + deltaX, this.origin.Y + deltaY]
		];

		let linePath = this.paper.path(linePathList);
		this.styleSide(linePath, 0);
		pathSet.push(linePath);

		// draw the other sides by cloning bottom side and rotating
		for (let n = 1; n < this.N; n++) {
			let newLinePath = linePath.clone();
			this.styleSide(newLinePath, n);

			let degreesToRotate = n*(360/this.N);
			let transformString = [
				"...R" + String(degreesToRotate),
				String(this.origin.X),
				String(this.origin.Y),
			].join(",");
			newLinePath.transform(transformString);
			pathSet.push(newLinePath);
		}
		this.pathSet = pathSet;
	}

	// n is which side it is, where 0 is the bottom side
	styleSide(path, n) {
		if (this.useDifferentSideStrokes && this.N < STROKE_DASH_ARRAY.length) {
            let strokeDashArray = STROKE_DASH_ARRAY[(this.sideStrokeOffset + n) % this.N];
            path.attr({
                'stroke-dasharray': strokeDashArray
            });
        }
	}
}


/**
Lighter weight:
Returns pathList for a regular N-sided polygon
Borrowed from https://www.safaribooksonline.com/library/view/raphaeljs/9781449365356/ch04.html

@param {X: number, Y: number} origin point
@param {number} size AKA side length

@returns {array} PathList
*/
function getRegularNGonPath(origin, size, N) {
	let pathList = []; // what will be returned

	let x = origin.X;
	let y = origin.Y;
	let temp_x, temp_y, angle, n;

    for (n = 0; n <= N; n += 1) {
        // the angle (in radians) as an nth fraction of the whole circle
        angle = n / N * 2 * Math.PI;

        // The starting x value of the point adjusted by the angle
        temp_x = x + Math.cos(angle) * size;
        // The starting y value of the point adjusted by the angle
        temp_y = y + Math.sin(angle) * size;

        // Start with "M" if it's the first point, otherwise L
        pathList += [(n === 0 ? "M" : "L"), temp_x, temp_y];
    }
    return pathList;
}
