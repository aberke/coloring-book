/*
	Collection of SVG Path generating functions

	Each returns a (String) path
*/


var curves = function(n, startX, startY, width, height) {
    // draw the path with start at MstartX,startY
    var pathString = ""
    var startingSpotString = "M" + String(startX) + "," + String(startY);
    // add the curve a few times, always starting and ending in the same place
    var endX = width;
    var endY = -1*(height/2);
    var controlX = width/2;
    var controlY = (-1)*(2*height);
    var i = 0;
    var heightChange = height/n;
    while (i < n && endY < startY) {
        i += 1;
        pathString += (startingSpotString + " ");
        controlY += heightChange;
        pathString = pathString + "q" + String(controlX) + "," + String(controlY) + " " + String(endX) + "," + String(endY) + " ";
    }
    return pathString;
}
var curves2 = curves.bind(this, 2);
var curves3 = curves.bind(this, 3);
var curves4 = curves.bind(this, 4);
var curves5 = curves.bind(this, 5);



var curvedPathNoSymmetry = function(startX, startY, width, height) {
    // draw the path with start at MstartX,startY
    var pathString = ""
    var startingSpotString = "M" + String(startX) + "," + String(startY);
    // add the curve a few times, always starting and ending in the same place
    var aX = width/2;
    var aY = height;
    var angle = 0;
    var i = 0;
    var maxLoops = 4;
    var heightChange = height/maxLoops;
    while (i < maxLoops && height > 0) {
        i += 1;
        heightChange = (i < maxLoops) ? (heightChange) : 0;
        pathString += (startingSpotString + " ");
        pathString = pathString + "c" + String(aX) + "," + String(aY) + " " + String(angle) + " 1,1 " + String(width) + ",-" + String(height) + " l0," + String(heightChange) + " ";

        aY -= heightChange;
        angle += 10;
        height = height - heightChange;
    }
    return pathString;
}

var quarterEllipse = function(startX, startY, width, height) {
	/*
	Draw series of connected curves of diminishing height where axis length = offset
	*/
    // draw the path with start at MstartX,startY
    var pathString = ""
    var startingSpotString = "M" + String(startX) + "," + String(startY);
    // add the curve a few times, always starting and ending in the same place
    var aX = width;
    var aY = height;
    var endOffsetY = height;

    var i = 0;
    var maxLoops = 4;
    var angle = 0;
    var heightChange = (-1)*(height/maxLoops);
    while (i <= maxLoops && aY > 0) {
        pathString += (startingSpotString + " ");
        pathString += ("a" + String(aX) + "," + String(aY) + " " + String(angle) + " 0,1 " + String(aX) + ",-" + String(aY) + " ");
        // draw vertical line connecting to previous curve
        if (i > 0)
        	pathString += (" l0," + String(heightChange) + " ");

        aY += heightChange;
        i += 1;
    }
    return pathString;
}

/***
 * Generates path string for the triangle path: n triangles placed within eachother
 * @return {string} for a path for n triangles, placed within eachother
**/
var triangles = function(n, startX, startY, width, height) {
    n = n || 1;
    var pathString = ""
    var startingSpotString = "M" + String(startX) + "," + String(startY);

    for (var i=1; i<=n; i++) {
        pathString += startingSpotString;
        var widthDivisor = 2**i;
        pathString += ("v-" + String(height) + "h" + String(width/widthDivisor) + "Z");
    }
    return pathString;
}
var triangles2 = triangles.bind(this, 2);
var triangles3 = triangles.bind(this, 3);

/**
 * Draw series of connected curves of diminishing height where axis length = offset
**/
var petalEllipse = function(startX, startY, width, height) {

    // draw the path with start at MstartX,startY
    var pathString = ""
    var startingSpotString = "M" + String(startX) + "," + String(startY);
    // add the curve a few times, always starting and ending in the same place
    var aX = startX + width;
    var aY = height;
    var endOffsetY = height;

    var i = 0;
    var maxLoops = 3;
    var angle = -10;
    var heightChange = (-1)*(height/maxLoops);
    while (i <= maxLoops && aY > 0) {
        pathString += (startingSpotString + " ");
        pathString += ("a" + String(aX) + "," + String(aY) + " " + String(angle) + " 0,1 " + String(aX) + ",-" + String(aY) + " ");
        pathString += (startingSpotString + " ");
        pathString += ("a" + String(aX) + "," + String(aY) + " " + String(angle) + " 0,0 " + String(aX) + ",-" + String(aY) + " ");

        aY += heightChange;
        angle += 5;
        i += 1;
    }
    return pathString;
}

