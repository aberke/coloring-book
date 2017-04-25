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
        // can optionally dictate which side strokes are used for which sides
        // of the shape by passing in an array of integers, where there is one int per side
        this.sideStrokes = this.options.sideStrokes || null;

		this.rotationTransformString = getRotationTransformString(this.origin, this.N);

		this.pathSet;
		this.draw();
	}

	getLinePathList() {
		var startPointPathPart = ["M", this.origin.X, this.origin.Y];
		var endPoint = {
			X: this.origin.X,
			Y: this.origin.Y + this.size/2,
		};
		var centerPoint = {
            X: this.origin.X + this.size/4,
            Y: this.origin.Y + this.size/4
        };
        
		var linePathList = [
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
		var pathSet = this.paper.set(); // what will be returned

		// get the line path for the first side of the polygon
		// generate the rest of the sides by copying and rotating that first side
		var linePathList = this.getLinePathList();

		// draw the linePathList as a path on the paper
		var linePath = this.paper.path(linePathList);
		this.styleSide(linePath, 0);
		pathSet.push(linePath);

		// draw the other sides by cloning bottom side and rotating
		for (var n = 1; n < this.N; n++) {
			var newLinePath = linePath.clone();
			this.styleSide(newLinePath, n);

			var degreesToRotate = n*(360/this.N);
			var transformString = [
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
		// can optionally dictate how to style each side by number
		if (this.sideStrokes && this.sideStrokes.length > n && this.sideStrokes[n] < STROKE_DASH_ARRAY.length)
			path.attr({
                'stroke-dasharray': STROKE_DASH_ARRAY[this.sideStrokes[n]]
            });

		// or can say just say make all of the sides a different stroke -- will alternate
		if (this.useDifferentSideStrokes && n < STROKE_DASH_ARRAY.length)
            path.attr({
                'stroke-dasharray': STROKE_DASH_ARRAY[n % this.N]
            });
	}	
}
