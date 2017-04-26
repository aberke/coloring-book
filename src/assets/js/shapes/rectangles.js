
/**
Draws rectangle.
*/
class Rectangle extends DihedralShape {

	constructor(paper, origin, size, options) {
		options = options || {};
		options.rotations = 2;
		options.width = options.width || size;
		options.height = options.height || size/2;
        super(paper, origin, size, options);
	}

	// generates the path set to be used as the 'fundamental' domain of the polygon
	getSidePathList() {
		// draw the bottom + right sides of the polygon, oriented to lie horizontally flat
		var linePathList = [
			["M", this.origin.X - this.options.width/2, this.origin.Y + this.options.height/2],
			["L", this.origin.X + this.options.width/2, this.origin.Y + this.options.height/2],
			["L", this.origin.X + this.options.width/2, this.origin.Y - this.options.height/2],
		];
		return linePathList;
	}
}
