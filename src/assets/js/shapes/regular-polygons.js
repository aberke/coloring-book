/**
Draws regular polygon with N sides/rotations
where the polygon sits with the bottom side horizontally
aligned along the x-axis.
*/

class RegularPolygon extends DihedralShape {
	
	constructor(paper, origin, size, options) {
        super(paper, origin, size, options);
	}

	// override parent's drawPathSet
	drawPathSet() {
		let pathSet = this.paper.set();

		let rotationRadians = 2*Math.PI/this.N;
		let halfRotationRadians = rotationRadians/2;

		// Size is the diameter of the shape.  Need radius for for computing sides.
		let halfSize = (1/2)*this.size;
		
		// start at the bottom left point of the bottom side
		// (the polygon's first side sides parallel to the X-axis)
		let currentAngle = (0 - halfRotationRadians);

		// draw each side as 3 points
		// aka draw each portion of the shape as 2 triangles
		// for looking at the bottom side of a shape:
		//  - p1 is the bottom left point
		//  - p3 is the bottom right point
		//  - p2 sits in the middle of their side (or closer to center if concave)
		let p1, p2, p3; // consider p0 the center (origin)
		for (var i=0; i<this.N; i++) {

			// compute the points for this side
			p1 = {
				X: this.origin.X + (halfSize*Math.sin(currentAngle)),
				Y: this.origin.Y + (halfSize*Math.cos(currentAngle))
			};
			// compute p3
			currentAngle += rotationRadians;
			p3 = {
				X: this.origin.X + (halfSize*Math.sin(currentAngle)),
				Y: this.origin.Y + (halfSize*Math.cos(currentAngle))
			};
			// p2 is in the middle of the line between p1 and p3
			p2 = {
				X: (1/2)*(p1.X + p3.X),
				Y: (1/2)*(p1.Y + p3.Y)
			};
			// but if concave: shift p2 half way to the origin
			if (!!this.options.concave) {
				p2.X = (1/2)*(this.origin.X + p2.X);
				p2.Y = (1/2)*(this.origin.Y + p2.Y);
			}

			// if options.withMirrorSections, then draw shape in segments with mirrors
			// so that each segment can be colored separately
			if (this.options.withMirrorSections) {
				// draw 2 segments where each segment is an L
				// first point of each segment is the origin
				// this shows the mirrors and allows coloring by creating concave paths
				
				let segment1Path = this.paper.path([
					["M", this.origin.X, this.origin.Y],
					["L", p1.X, p1.Y],
					["L", p2.X, p2.Y],
				]);
				pathSet.push(segment1Path);

				let segment2Path = this.paper.path([
					["M", this.origin.X, this.origin.Y],
					["L", p2.X, p2.Y],
					["L", p3.X, p3.Y],
				]);
				pathSet.push(segment2Path);
			} else {
				let segmentPath = this.paper.path([
					["M", p1.X, p1.Y],
					["L", p2.X, p2.Y],
					["L", p3.X, p3.Y],
				]);
				pathSet.push(segmentPath);
			}
		}
		this.pathSet = pathSet;
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
