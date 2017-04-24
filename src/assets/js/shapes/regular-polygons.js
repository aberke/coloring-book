/**
Draws regular polygon with N sides/rotations
where the polygon sits with the bottom side horizontally
aligned along the x-axis.
*/
class RegularPolygon extends DihedralShape {

	constructor(paper, origin, size, options) {
        super(paper, origin, size, options);
	}

	// generates the path set to be used as the 'fundamental' domain of the polygon
	getLinePathList() {
		// draw the bottom side of the polygon, oriented to lie horizontally flat
		var rotationRadians = 2*Math.PI/this.N;
		var halfRotationRadians = rotationRadians/2;
		
		var deltaX = (1/2)*this.size*Math.sin(halfRotationRadians);
		var deltaY = (1/2)*this.size*Math.cos(halfRotationRadians);

		// initialize the start point and draw bottom differently
		// depending on whether this n-gon is convex or concave
		var linePathList = [
			["M", this.origin.X - deltaX, this.origin.Y + deltaY]
		];
		// if shape is concave, then there is an extra point in the bottom of the line
		if (this.options.concave) {
			linePathList += [
				["L", this.origin.X, this.origin.Y + (1/2)*deltaY],
			];
		}
		linePathList += [
			["L", this.origin.X + deltaX, this.origin.Y + deltaY]
		];

		return linePathList;
	}
}


/**
Lighter weight NGon creator:
Returns pathList for a regular N-sided polygon
Borrowed from https://www.safaribooksonline.com/library/view/raphaeljs/9781449365356/ch04.html

@param {X: number, Y: number} origin point
@param {number} size AKA side length

@returns {array} PathList
*/
function getRegularNGonPath(origin, size, N) {
	var pathList = []; // what will be returned

	var x = origin.X;
	var y = origin.Y;
	var temp_x, temp_y, angle, n;

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
