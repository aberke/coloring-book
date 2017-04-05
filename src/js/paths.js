"use-strict";

/*
	Collection of SVG Path generating functions

	Each returns a path as either an array or a string.
*/


/**
Creates path of slices along a line, contained within
(width, height) and oriented with line on the right.
Path is randomly generated.
(Used by CircularTessellation)

@param {X: number, Y: number} origin to start drawing along line
@param {number} width of the slice
@param {number} height of the slice
@param {number} slicesCount as number of slices to draw along line
@param {boolean} withReflection whether or not slices should be symmetric

@returns {array} pathList
*/
function getFundamentalDomainLineSlices(origin, width, height, slicesCount, withReflection) {
    slicesCount = slicesCount || 3;
    withReflection = withReflection || true;

    let pathList = [];

    // divide slices total height into pieces and make a slice per piece
    let sliceHeight = height/slicesCount;

    // keep track of number of slices that are blank -- do not want all slice blank
    let zeroPathsNumbers = 0;

    for (var s=0; s<slicesCount; s++) {

        let sliceStartPoint = {
            X: origin.X,
            Y: origin.Y + s*sliceHeight,
        };
        
        // How many lines for this given slice? randomly choose from pathNumbers
        // for the first slice, it should be 0 or 1 if there are more slices to come
        // The number of potential paths scales with slices
        // reasoning: at the origin, can't visually handle too many paths
        // At the same time, want to avoid situation where pathsNumber is 0 for each slice
        // and the result is a an empty pathList
        let pathsNumber = Math.round(Math.random()*(s + 1));

        if (pathsNumber === 0) // another set of no paths -- record it
            zeroPathsNumbers += 1;
        // Don't allow case of ending up with all pathsNumbers being 0
        if (zeroPathsNumbers >= slicesCount)
            pathsNumber += 1;
        // continue if there are no slice paths to draw for this slice
        if (pathsNumber === 0)
            continue;

        // scale the width of the slices as they get further from the origin
        // start with the widest path, and then get smaller
        let sliceWidth = (s + 1)*width;
        let wChange = sliceWidth/pathsNumber;
        for (let i=0; i < pathsNumber; i++) {
            pathList += getFundamentalDomainLineSlicePath(sliceStartPoint, sliceWidth, sliceHeight, withReflection);
            // decrement the sliceWidth in preparation for the next path creation
            // do not let it get smaller than 5
            sliceWidth = Math.max(5, sliceWidth - wChange);
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
function getFundamentalDomainLineSlicePath(startPoint, width, height, withReflection) {
    let pathList = [];  // initialize pathList
    let startPointPathPart = ["M", startPoint.X, startPoint.Y];
    let endPoint = {
        X: startPoint.X,
        Y: startPoint.Y + height
    }

    // randomly generate either a linear path or a curved path
    if (Math.random() > 0.5) {
        // generate line path

        // Add two sides:

        // generate random delta for side 1
        let deltaY1 = Math.random()*height;
        // get delta for side  2 -- same as side 1 if with reflection
        let deltaY2 = withReflection ? deltaY1 : Math.random()*height;

        // add sides to the pathList
        pathList += [
            // add side 1
            startPointPathPart,
            ["L", startPoint.X + width, startPoint.Y + deltaY1],
            ["L", endPoint.X, endPoint.Y],
            // add side 2
            startPointPathPart,
            ["L", startPoint.X - width, startPoint.Y + deltaY2],
            ["L", endPoint.X, endPoint.Y],
        ];
    } else {
        // generate curved path
        let centerPoint = {
            X: startPoint.X + width,
            Y: startPoint.Y + height/2
        };
        // get path for side 1
        let multiplierY1 = Math.random();
        let curvedPath1 = getCatmullRomPath(startPoint, endPoint, centerPoint, 1, multiplierY1);

        // get path for side 2
        let multiplierY2 = withReflection ? multiplierY1 : Math.random();
        let curvedPath2 = getCatmullRomPath(startPoint, endPoint, centerPoint, -1, multiplierY2);

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


function getCatmullRomPath(fromPoint, toPoint, centerPoint, multiplierX, multiplierY) {
    let differenceX = (centerPoint.X - fromPoint.X);
    let differenceY = (centerPoint.Y - fromPoint.Y);
    return ["R", fromPoint.X + multiplierX*differenceX, fromPoint.Y + multiplierY*differenceY, toPoint.X, toPoint.Y];
}


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
        var widthDivisor = Math.pow(2, i);
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

