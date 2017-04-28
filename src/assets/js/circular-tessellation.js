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
		{number} drawAnimationInterval: animation interval for the rotate transformation of the draw routine
	*/
	constructor(paper, origin, diameter, options = {}) {
		this.paper = paper;
		this.pathSet = this.paper.set();

		this.origin = origin;
		
		this.diameter = diameter;

		// handle options
		this.options = options;
		this.levels = Number(this.options.levels) || 1;
		this.scaleFactor = 2;
		this.withReflection = this.options.withReflection ? Boolean(this.options.withReflection) : false;
		
		// maybe this isn't a true circular tessellation and is a flower instead!
		if (this.options.asFlower) {
			this.levels = 2;
			this.options.deltaYMultiplier = -1;
			this.diameter = (1.5)*diameter;
		}

		// slicesCount is the number of items in a line segment to be repeated
		// make this number larger for more complicated patterns
		this.slicesCount = this.options.slicesCount || 3;
		// slices pathList could have optionally be passed
		this.slicesPathList = this.options.slicesPathList || null;

		// If the rotation of the draw routine should be animated
		// the animation interval will be passed in
		// where the animation interval is time between spokes of the wheel being drawn
		this.drawAnimationInterval = this.options.drawAnimationInterval || 0;

		this.rotations = options.rotations || 1;
		// set up rotation transform string
		this.rotationDegrees = 360/this.rotations;
		this.rotationTransformString = getRotationTransformString(this.origin, this.rotations);
		// keep track of whether currently rotating to avoid setting
		// off rotation twice at the same time
		this.isRotating = false;

		this.radius = this.diameter/2;
		// set the starting height and width of a slice.  Hooray whipping out the binary tree math
		this.height = this.radius/(Math.pow(this.scaleFactor, this.levels) - 1);
		this.width = this.height*Math.PI/this.rotations;

		this.draw();
	}


	rotate() {
		// do not rotate if already rotating or currently drawing -- will put shape in bad position
		if (this.isRotating || this.drawing) return;

		this.isRotating = true;

		const self = this;
		this.pathSet.animate({transform: this.rotationTransformString}, 1000, function() {
			self.isRotating = false;
		});
	}


	draw() {
		if (this.drawing)
			return;
		// set a flag that this shape is currently drawing
		this.drawing = true;

		// get a line to rotate
		let lineSet = this.getFundamentalDomainLine();
		this.pathSet.push(lineSet); // add it to the paperSet

		// use recursive routine to draw each rotated line of the circular tessellation
		const self = this;
		let drawNextRotation = function(r) {
			if (r >= this.rotations) {
				// no more rotations to draw
				this.drawing = false;
				return;
			}

			// reuse the lineSet -- clone it and rotate it, and add that clone to paperSet
	        var newLine = lineSet.clone();

	        var degreesToRotate = r*this.rotationDegrees;
	        var transformString = [
	        	"...R" + String(degreesToRotate),
	        	String(this.origin.X),
	        	String(this.origin.Y),
	        ].join(",");

	        // maybe animate rotating the newLine
	        // avoid using .animate for this.drawAnimationInterval=0 because there will still be a small delay
	        var transformCallback = function() {
		        self.pathSet.push(newLine);
		        // recursively call routing again for next rotation, r
		        drawNextRotation(r + 1);	
	        }
	        if (this.drawAnimationInterval) {
		       	newLine.animate({transform: transformString}, this.drawAnimationInterval, transformCallback); 	
	        } else {
	        	newLine.transform(transformString);
	        	transformCallback();
	        }

	    }.bind(this);
	    // start the drawNextRotation routine.  First rotation has already been drawn
	    drawNextRotation(1);

		this.pathSet.attr({
			'cursor': 'pointer',
			// using fill so that handlers are not just on the lines, but also the filled space
			'fill': 'white',
		});
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
	    var lineSet = this.paper.set();

		// generate base slices if do not already have them
		if (!this.slicesPathList) {
			this.slicesPathList = getFundamentalDomainLineSlices(this.origin, this.width, this.height, this.options);
		}
		
		var slicesPath = this.paper.path(this.slicesPathList);
		// for each level, add the base slices, scaled and translated appropriately
		lineSet.push(slicesPath);
		for (var l=1; l<this.levels; l++) {
		    // clone it + scale it up + translate
		    var nextSlicesPath = slicesPath.clone();
		    var transformList = [
		        ["T", 0, this.height],
		        // USE lower case 's'
		        ["s", Math.pow(this.scaleFactor, l), Math.pow(this.scaleFactor, l), this.origin.X, this.origin.Y],
		    ];
		    // add scaling portion to transform string
		    nextSlicesPath.transform(transformList);
		    lineSet.push(nextSlicesPath);
		}
	    return lineSet;
	}
};
