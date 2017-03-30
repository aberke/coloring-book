"use strict";

/**
Dependencies
- Uses styling in styles.js
*/

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

        // can optionally make this a concave (star) polygon
        this.concave = this.options.concave || false;

        // can optionally draw each side of polygon with a different stroke type
        this.useDifferentSideStrokes = this.options.useDifferentSideStrokes || false;
        this.sideStrokeOffset = this.options.sideStrokeOffset || 0;

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

		// initialize the start point and draw bottom differently
		// depending on whether this n-gon is convex or concave
		let linePathList = [
			["M", this.origin.X - deltaX, this.origin.Y + deltaY]
		];
		// if shape is concave, then there is an extra point in the bottom of the line
		if (this.concave) {
			linePathList += [
				["L", this.origin.X, this.origin.Y + (1/2)*deltaY],
			];
		}
		linePathList += [
			["L", this.origin.X + deltaX, this.origin.Y + deltaY]
		];

		// draw the linePathList as a path on the paper
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
