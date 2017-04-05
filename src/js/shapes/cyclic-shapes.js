"use strict";

/**
Dependencies
- Uses styling in styles.js
*/


class CyclicShape {

	constructor(paper, origin, size, options) {
		this.paper = paper;
		this.origin = origin;
		this.size = size;

        this.options = options || {};
        this.N = this.options.rotations || this.options.N;
        this.withReflection = this.options.withReflection || false;
        
        // can optionally draw each side of polygon with a different stroke type
        this.useDifferentSideStrokes = this.options.useDifferentSideStrokes || false;
        this.sideStrokeOffset = this.options.sideStrokeOffset || 0;

		this.rotationTransformString = getRotationTransformString(this.origin, this.N);

		this.pathSet;
		this.draw();
	}

	getLinePathList() {
		let startPointPathPart = ["M", this.origin.X, this.origin.Y];
		let endPoint = {
			X: this.origin.X,
			Y: this.origin.Y + this.size/2,
		};
		let centerPoint = {
            X: this.origin.X + this.size/4,
            Y: this.origin.Y + this.size/4
        };
        
		let linePathList = [
			// add side one of path as curved
			startPointPathPart,
			getCatmullRomPath(this.origin, endPoint, centerPoint, 1, 1),
			// add side two of path as straight line
			startPointPathPart,
			["L", endPoint.X, endPoint.Y],
		];
		return linePathList;
	}


	draw() {
		let pathSet = this.paper.set(); // what will be returned

		// get the line path for the first side of the polygon
		// generate the rest of the sides by copying and rotating that first side
		let linePathList = this.getLinePathList();

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
