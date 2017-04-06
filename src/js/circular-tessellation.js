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


Dependencies:
	- path.js

*/

class CircularTessellation {

	/**
	Draws circular tessellation.  It rotates when clicked or hovered over.

	@param {Object} paper on which to draw
	@param {X: number, Y: number} origin point
	@param {number} diameter
	@param {Object} options:
		{number} rotations as rotational order of shape
		{number} levels.  Ie, number of time slices repeat along the line
		{boolean} withReflection -- set true for symmetric line
		{number} slicesCount number of slices per level
		{array} slicesPathList: pathList of slices to use
	*/
	constructor(paper, origin, diameter, options) {
		this.paper = paper;
		this.pathSet = this.paper.set();

		this.origin = origin;
		
		this.diameter = diameter;
		this.radius = this.diameter/2;

		// handle options
		this.options = options || {};
		this.levels = Number(this.options.levels) || 1;
		this.scaleFactor = 2;
		this.withReflection = this.options.withReflection ? Boolean(this.options.withReflection) : false;
		
		// slicesCount is the number of items in a line segment to be repeated
		// make this number larger for more complicated patterns
		this.slicesCount = this.options.slicesCount || 3;
		// slices pathList could have optionally be passed
		this.slicesPathList = this.options.slicesPathList || null;

		this.rotations = options.rotations || 1;
		// set up rotation transform string
		this.rotationDegrees = 360/this.rotations;
		this.rotationTransformString = getRotationTransformString(this.origin, this.rotations);
		// keep track of whether currently rotating to avoid setting
		// off rotation twice at the same time
		this.isRotating = false;

		// set the starting height and width of a slice.  Hooray whipping out the binary tree math
		this.height = this.radius/(Math.pow(this.scaleFactor, this.levels) - 1);
		this.width = this.height/Math.max(4, this.rotations);

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

		// generate base slices if do not already have them
		if (!this.slicesPathList)
			this.slicesPathList = getFundamentalDomainLineSlices(this.origin, this.width, this.height, this.slicesCount, this.withReflection);
		
		let slicesPath = this.paper.path(this.slicesPathList);
		// for each level, add the base slices, scaled and translated appropriately
		lineSet.push(slicesPath);
		for (let l=1; l<this.levels; l++) {
		    // clone it + scale it up + translate
		    let nextSlicesPath = slicesPath.clone();
		    let transformList = [
		        ["T", 0, this.height],
		        // USE LOWER CASE s
		        ["s", Math.pow(this.scaleFactor, l), Math.pow(this.scaleFactor, l), this.origin.X, this.origin.Y],
		    ];
		    // add scaling portion to transform string
		    nextSlicesPath.transform(transformList);
		    lineSet.push(nextSlicesPath);
		}
	    return lineSet;
	}
};
