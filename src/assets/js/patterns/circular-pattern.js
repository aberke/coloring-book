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
'use strict';


class CircularPattern {

	/**
	Draws circular pattern.  It rotates when clicked or hovered over.

	@param {Object} paper on which to draw
	@param {X: number, Y: number} origin point
	@param {number} diameter
	@param {Object} options:
		{number} initialRotation as initial rotation in degrees.  e.g. 90
		{number} rotations as rotational order of shape
		{number} levels.  Ie, number of time slices repeat along the line
		{boolean} withReflection -- set true for symmetric line
		{number} slicesCount number of slices per level
		{array} slicesPathList: pathList of slices to use
		{number} animateMs: animation time in ms for the drawing routine
	*/
	constructor(paper, origin, diameter, options = {}) {
		this.paper = paper; // What is drawn on.
		this.pathSet = this.paper.set(); // The set of paths drawn.

		// Validate parameters, or throw error.
		this.validate(origin, diameter, options);

		this.origin = origin;

		this.diameter = diameter;

		// handle options
		this.options = options;
		this.levels = Number(this.options.levels) || 1;
		this.scaleFactor = 2;
		this.withReflection = this.options.withReflection ? Boolean(this.options.withReflection) : false;

		// maybe draw as a flower instead!
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
		this.animateMs = DISABLE_ANIMATIONS ? 0 : (this.options.animateMs || 0);

		this.initialRotation = options.initialRotation || 0;

		this.rotations = options.rotations || 2;
		// set up rotation transform string
		this.rotationTransformString = getRotationTransformString(this.origin, this.rotations);
		// keep track of whether currently rotating to avoid setting
		// off rotation twice at the same time
		this.isRotating = false;

		this.radius = this.diameter/2;
		// set the starting height and width of a slice.  Hooray whipping out the binary tree math
		this.height = this.radius/(Math.pow(this.scaleFactor, this.levels) - 1);
		this.width = this.height*Math.PI/this.rotations;
		
		// once clear()-ed, no more rotations will be added
		this.cleared = false;

		this.draw();
	}

	/*
	Validate the input parameters for the constructor.
	Throw an error for invalid parameters.
	*/
	validate(origin, diameter, options) {
		// validate origin.
		if (origin.X < 0 || origin.Y < 0) {
			throw Error("CircularPattern: invalid origin", origin);
		}
		// validate diameter
		if (diameter <= 0) {
			throw Error("CircularPattern: invalid diameter: " + options.diameter);
		}
		// Validate options
		if (options.levels < 1) {
			throw Error("CircularPattern: invalid levels: " + options.levels);
		}
		if (options.rotations < 2) {
			throw Error("CircularPattern: invalid rotations: " + options.rotations);
		}
		if (options.slicesCount < 1) {
			throw Error("CircularPattern: invalid slicesCount: " + options.slicesCount);
		}
	}


	clear() {
		this.cleared = true;
		this.paper.clear();
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
		const rotationDegrees = 360/this.rotations;

		// use recursive routine to draw each rotated line of the circular pattern
		const self = this;
		let drawNextRotation = function(r) {
			if (r >= this.rotations || this.cleared) {
				// no more rotations to draw
				this.drawing = false;
				return;
			}

            // newLine will be the fundamental domain, maybe cloned and transformed
            let newLine;
            let callback = function() {
                // Add the new line and recursively call again for next rotation, r
                this.pathSet.push(newLine);
                drawNextRotation(r + 1);
            }.bind(this);

            if (r == 0) {
                newLine = this.getFundamentalDomainLine();
                return callback();
            }

            newLine = this.pathSet.items[r - 1].clone();
            let transform = getRotateDegreesTransformString(this.origin, rotationDegrees);

            // maybe animate rotating the newLine
            // avoid using .animate for this.animateMs=0 because there will still be a small delay
            if (this.animateMs > 0)
                return newLine.animate({transform: transform}, this.animateMs/this.rotations, callback);

            // Without animation simply apply transform
            newLine.transform(transform);
            return callback();
        }.bind(this);

	    drawNextRotation(0);

	    // set up interactions if !DISABLE_ANIMATIONS
        if (!DISABLE_ANIMATIONS) {
            this.pathSet.attr({ 'cursor': 'pointer', });
            this.pathSet.mouseup(this.rotate.bind(this));
            this.pathSet.mouseover(this.rotate.bind(this));	
        }
	    return this.pathSet;
	}


	/**
    Generate or reuse the set of paths that are the fundamental domain.
    The fundamental domain is line has repeating patterns, that are
    scaled in in size as they repeat.
    This line can then be rotated to create the circular pattern.

    @returns Paper.set() of paths of line
    */
    getFundamentalDomainLine() {

        if (this.fundamentalDomain)
            return this.fundamentalDomain.clone();

        // Generate fundamental domain for reuse later.
        this.fundamentalDomain = this.paper.set();

        // Generate base slices if do not already have them.
        if (!this.slicesPathList)
            this.slicesPathList = getFundamentalDomainLineSlices(this.origin, this.width, this.height, this.options);

        let slicesPath = this.paper.path(this.slicesPathList);
        // for each level, add the base slices, scaled and translated appropriately
        this.fundamentalDomain.push(slicesPath);
        for (var l=1; l<this.levels; l++) {
            // clone it + scale it up + translate
            let nextSlicesPath = slicesPath.clone();
            let transformList = [
                ["T", 0, this.height],
                // USE lower case 's'
                ["s", Math.pow(this.scaleFactor, l), Math.pow(this.scaleFactor, l), this.origin.X, this.origin.Y],
            ];
            nextSlicesPath.transform(transformList);
            // rotate by initial rotation
            if (this.initialRotation > 0)
                nextSlicesPath.transform(getRotateDegreesTransformString(this.origin, this.initialRotation));
            
            this.fundamentalDomain.push(nextSlicesPath);
        }
        return this.fundamentalDomain;
    }
}
