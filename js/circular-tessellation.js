"use strict";

/*
Logic:
- For a given line, say the <0, 10> vector:
	- Get the fundamental domain along that line
	- Repeat it along that line, scaling size up each time
	- Get other side, where other side is either
		- (For Reflection symmetry): same fundamental domain line
		- (For no reflection symmetry): new fundamental domain line
		- Reflect other side
		- Compose sides
	- Rotate
- 
*/

class CircularTessellation {

	/**
	Draws circular tessellation.  It rotates when clicked or hovered over.

	@param {Object} paper on which to draw
	@param {number} levels.  Ie, number of time slices repeat along the line
	@param {X: number, Y: number} origin point
	@param {number} diameter
	@param {Object} options:
		withReclection: {boolean} withReflection -- set true for symmetric line
		slicesCount: {number} number of slices per level
	*/
	constructor(paper, levels, origin, diameter, rotations, options) {
		this.paper = paper;
		this.pathSet = this.paper.set();

		this.levels = levels;

		this.origin = origin;
		
		this.diameter = diameter;
		this.radius = this.diameter/2;

		this.rotations = rotations;
		// set up rotation transform string
		this.rotationDegrees = 360/rotations;
		this.rotationTransformString = getRotationTransformString(this.origin, this.rotations);
		// keep track of whether currently rotating to avoid setting
		// off rotation twice at the same time
		this.isRotating = false;

		// handle options
		this.options = options || {};
		this.scaleFactor = 2;
		this.withReflection = this.options.withReflection ? this.options.withReflection : false;
		
		// slicesCount is the number of items in a line segment to be repeated
		// make this number larger for more complicated patterns
		this.slicesCount = this.options.slicesCount || 3;

		// set the starting height and width of a slice.  Hooray whipping out the binary tree math
		this.height = this.radius/(this.scaleFactor**this.levels - 1);
		this.width = this.height/5;

		this.draw();
	}


	rotate() {
		if (this.isRotating) return;

		this.isRotating = true;

		let self = this;
		this.pathSet.animate({transform: this.rotationTransformString}, 1000, function() {
			self.isRotating = false;
		});
	}


	draw() {
		// get a line to rotate
		let lineSet = this.getFundamentalDomainLine();
		this.pathSet.push(lineSet); // add it to the paperSet

		// reuse that line -- clone it and rotate it, and add that clone to paperSet
		for (let r = 1; r < this.rotations; r++) {
	        let newLine = lineSet.clone();

	        let degreesToRotate = r*this.rotationDegrees;
	        let transformString = [
	        	"...R" + String(degreesToRotate),
	        	String(this.origin.X),
	        	String(this.origin.Y),
	        ].join(",");
	        newLine.transform(transformString);
	        this.pathSet.push(newLine);
	    }
		this.pathSet.attr({'cursor': 'pointer'});
		this.pathSet.mouseup(this.rotate.bind(this));
		this.pathSet.mouseover(this.rotate.bind(this));
	    return this.pathSet;
	}


	/**
	Generate the set of paths that represent a "decorated line".
	This line has repeating patterns, that are scaled in size as they repeat.
	This line can then be rotated to create the circular tessellation.

	@returns Paper.set() of paths of line
	*/
	getFundamentalDomainLine() {

		// initialize the final set of paths that will be returned
	    let lineSet = this.paper.set();

		// generate base slices
		let slicesPathList = this.getFundamentalDomainLineSlices();
		let slicesPath = this.paper.path(slicesPathList);
		// for each level, add the base slices, scaled and translated appropriately
		lineSet.push(slicesPath);
		for (let l=1; l<this.levels; l++) {
		    // clone it + scale it up + translate
		    let nextSlicesPath = slicesPath.clone();
		    let transformList = [
		        ["T", 0, this.height],
		        // USE LOWER CASE s
		        ["s", this.scaleFactor**l, this.scaleFactor**l, this.origin.X, this.origin.Y],
		    ];
		    // add scaling portion to transform string
		    nextSlicesPath.transform(transformList);
		    lineSet.push(nextSlicesPath);
		}
	    return lineSet;
	}

	/**
	Creates path for slice of fundamental domain line, contained within
	(width, height) and oriented with line on the right.

	@returns {array} pathList
	*/
	getFundamentalDomainLineSlices() {
		let slicesCount = this.slicesCount;
		let width = this.width;
		let height = this.height;

		let pathList = [];

		// divide slices total height into pieces and make a slice per piece
		let sliceHeight = height/slicesCount;
		for (var s=0; s<slicesCount; s++) {

			// scale the width of the slices as they get further from the ORIGIN
			let w = (s + 1)*width;

			let sliceStartPoint = {
				X: this.origin.X,
				Y: this.origin.Y + s*sliceHeight,
			};
			// how many lines for this given slice? randomly choose from pathNumbers
			// for the first slice, it should be 0 or 1
			// number of potential paths scales with slices
			// reasoning: at the origin, can't visually handle too many paths
			let pathsNumber = Math.round(Math.random()*(s + 1));
			for (let i=0; i < pathsNumber; i++) {
				pathList += this.getFundamentalDomainLineSlicePath(sliceStartPoint, w, sliceHeight);
			}
		}
		return pathList;
	}


	/**
	Generates a path that starts at startPoint, and ends further along
	the fundamental domain line slice.  Path is randomly generated.

	@param {X: number, Y: number} startPoint to start drawing along line
	@param {number} width of the slice
	@param {number} height of the slice
	@param {boolean} withReflection whether or not two sides of line should be symmetric

	@returns {array} pathList used to draw Path
	*/
	getFundamentalDomainLineSlicePath(startPoint, width, height) {
		let pathList = [];  // initialize pathList
		let startPointPathPart = ["M", startPoint.X, startPoint.Y];
		let endPoint = {
			X: startPoint.X,
			Y: startPoint.Y + height
		}
		console.log('this.withReflection', this.withReflection)

		// randomly generate either a linear path or a curved path
		if (Math.random() > 0.5) {
			// generate line path

			// add two sides
			// generate deltas for side 1
			let deltaX1 = Math.random()*width;
			let deltaY1 = Math.random()*height;

			// get deltas for side  2 -- same as side 1 if with reflection
			let deltaX2 = this.withReflection ? deltaX1 : Math.random()*width;
			let deltaY2 = this.withReflection ? deltaY1 : Math.random()*height;

			// add sides to the pathList
			pathList += [
				// add side 1
				startPointPathPart,
				["L", startPoint.X + deltaX1, startPoint.Y + deltaY1],
				["L", endPoint.X, endPoint.Y],
				// add side 2
				startPointPathPart,
				["L", startPoint.X - deltaX2, startPoint.Y + deltaY2],
				["L", endPoint.X, endPoint.Y],
			];
		} else {
			// generate curved path
			let centerPoint = {
				X: startPoint.X + width,
				Y: startPoint.Y + height/2
			}
			// get path for side 1
			let multiplier1 = Math.random();
			let curvedPath1 = getCatmullRomPath(startPoint, endPoint, centerPoint, multiplier1, multiplier1);

			// get path for side 2
			let multiplier2 = this.withReflection ? multiplier1 : Math.random();
			let curvedPath2 = getCatmullRomPath(startPoint, endPoint, centerPoint, (-1)*multiplier2, multiplier2);

			// add sides to the pathList
			pathList += [
				// add side 1
				startPointPathPart,
				curvedPath1,
				// add side 2
				startPointPathPart,
				curvedPath2,
			];
		}
		return pathList;
	}
};


function getCatmullRomPath(fromPoint, toPoint, centerPoint, multiplierX, multiplierY) {
	let differenceX = (centerPoint.X - fromPoint.X);
	let differenceY = (centerPoint.Y - fromPoint.Y);
	return ["R", fromPoint.X + multiplierX*differenceX, fromPoint.Y + multiplierY*differenceY, toPoint.X, toPoint.Y];
}
