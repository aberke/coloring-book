/**
Dependencies
- Uses styling in styles.js
*/
'use strict';


class CyclicShape {

	constructor(paper, origin, size, options) {
		this.paper = paper;
		this.origin = origin;
		this.size = size;

        this.options = options || {};

        this.N = this.options.rotations || this.options.N;
        this.withReflection = this.options.withReflection || false;
        
        // can optionally draw each side of polygon with a different stroke type
        this.alternateSideStrokes = this.options.alternateSideStrokes || false;
        // can optionally dictate which side strokes are used for which sides
        // of the shape by passing in an array of integers, where there is one int per side
        this.sideStrokes = this.options.sideStrokes || [];

        // can optionally dictate how to fill sections of the shape with color
        // by passing in array 'options.coloring' that choose colors from the COLORING_FILL_ARRAY
        // eg, options.coloring
        // defaults to shapes not being filled with color
        this.coloring = this.options.coloring || [];

		this.pathSet;
		this.draw();
	}

	getSidePathList() {
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
			paths.getCatmullRomPath(this.origin, endPoint, centerPoint, 1, 1),
			// add side two of path as straight line
			startPointPathPart,
			["L", endPoint.X, endPoint.Y],
		];
		return linePathList;
	}


	draw() {
		this.drawPathSet();
		// style sides or fill path section according to options passed in
		this.pathSet.items.forEach(this.styleSide.bind(this));
		this.pathSet.items.forEach(this.colorPathSection.bind(this));
	}


	drawPathSet() {
		let pathSet = this.paper.set(); // what will be returned

		// draw each side and then rotate it accordingly
		for (let n = 0; n < this.N; n++) {
			let sidePathList = this.getSidePathList();
			let sidePath = this.paper.path(sidePathList);

			let degreesToRotate = n*(360/this.N);
			let transformString = [
				"...R" + String(degreesToRotate),
				String(this.origin.X),
				String(this.origin.Y),
			].join(",");
			sidePath.transform(transformString);
			pathSet.push(sidePath);
		}
		this.pathSet = pathSet;	
	}


	// can optionally pass in options.coloring as an array dictating how to fill each section of the shape
	// eg, options.coloring = [0,0,1,1,2,2] will use fills from the list COLORING_FILL_ARRAY
	// by default shapes are not filled with color
	colorPathSection(path, n) {
		if (this.coloring && this.coloring.length > n && this.coloring[n] < COLORING_FILL_ARRAY.length)
			path.attr("fill", COLORING_FILL_ARRAY[this.coloring[n]]);
	}


	// n is which side it is, where 0 is the bottom side
	styleSide(path, n) {
		// can optionally dictate how to style each side by number
		if (this.sideStrokes && this.sideStrokes.length > n && this.sideStrokes[n] < STROKE_DASH_ARRAY.length)
			path.attr({
                'stroke-dasharray': STROKE_DASH_ARRAY[this.sideStrokes[n]]
            });

		// or can say just say make all of the sides a different stroke -- will alternate
		if (this.alternateSideStrokes && n < STROKE_DASH_ARRAY.length)
            path.attr({
                'stroke-dasharray': STROKE_DASH_ARRAY[n % this.N]
            });
	}	
}
