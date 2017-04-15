/*
	Collection of SVG Path generating functions

	Each returns a path as either an array or a string.
*/


/*
Work in progress
*/
function slantedSlicesPath(origin, width, height, options) {
    options = options || {};

    var pathList = [
        ["M", origin.X, origin.Y],
        ["L", origin.X + width, origin.Y - height]
    ];

    pathList += curves3(origin, width, height);

    var fullSlantedDiamondPathList = slantedDiamond(origin, width, height);
    pathList += fullSlantedDiamondPathList;

    return pathList;
}

function slantedDiamond(origin, width, height) {

    var startPointPathPart = ["M", origin.X, origin.Y];

    return [
        // add the left/top side
        startPointPathPart,
        ["L", origin.X + (1/4)*width, origin.Y - (1/2)*height],
        ["L", origin.X + width, origin.Y - height],
        
        // add the right/bottom side
        startPointPathPart,
        ["L", origin.X + (3/4)*width, origin.Y - (1/2)*height],
        ["L", origin.X + width, origin.Y - height],
    ];
}



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
function getFundamentalDomainLineSlices(origin, width, height, options) {
    options = options || {};

    var slicesCount = options.slicesCount || 3;
    var withReflection = options.withReflection || false;
    var deltaYMultiplier = options.deltaYMultiplier || 1;

    var pathList = [];

    // divide slices total height into pieces and make a slice per piece
    var sliceHeight = height/slicesCount;

    // keep track of number of slices that are blank -- do not want all slice blank
    var zeroPathsNumbers = 0;

    for (var s=0; s<slicesCount; s++) {

        var sliceStartPoint = {
            X: origin.X,
            Y: origin.Y + deltaYMultiplier*s*sliceHeight,
        };
        
        // How many lines for this given slice? randomly choose from pathNumbers
        // for the first slice, it should be 0 or 1 if there are more slices to come
        // The number of potential paths scales with slices
        // reasoning: at the origin, can't visually handle too many paths
        // At the same time, want to avoid situation where pathsNumber is 0 for each slice
        // and the result is a an empty pathList
        var pathsNumber = Math.round(Math.random()*(s + 1));

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
        var sliceWidth = Math.max(5, (s + 1)*width/slicesCount);
        var wChange = sliceWidth/pathsNumber;
        for (var i=0; i < pathsNumber; i++) {
            pathList += getFundamentalDomainLineSlicePath(sliceStartPoint, sliceWidth, sliceHeight, withReflection, deltaYMultiplier);
            // decrement the sliceWidth in preparation for the next path creation
            // do not var it get smaller than 5
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
function getFundamentalDomainLineSlicePath(startPoint, width, height, withReflection, deltaYMultiplier) {
    deltaYMultiplier = deltaYMultiplier || 1;

    var pathList = [];  // initialize pathList
    var startPointPathPart = ["M", startPoint.X, startPoint.Y];
    var endPoint = {
        X: startPoint.X,
        Y: startPoint.Y + height
    }

    // randomly generate either a linear path or a curved path
    if (Math.random() > 0.5) {
        // generate line path

        // Add two sides:

        // generate random delta for side 1
        var deltaY1 = Math.random()*height;
        // get delta for side  2 -- same as side 1 if with reflection
        var deltaY2 = withReflection ? deltaY1 : Math.random()*height;

        // add sides to the pathList
        pathList += [
            // add side 1
            startPointPathPart,
            ["L", startPoint.X + width, startPoint.Y + deltaYMultiplier*deltaY1],
            ["L", endPoint.X, endPoint.Y],
            // add side 2
            startPointPathPart,
            ["L", startPoint.X - width, startPoint.Y + deltaYMultiplier*deltaY2],
            ["L", endPoint.X, endPoint.Y],
        ];
    } else {
        // generate curved path
        var centerPoint = {
            X: startPoint.X + width,
            Y: startPoint.Y + deltaYMultiplier*(height/2)
        };
        // get path for side 1
        var multiplierY1 = Math.random();
        var curvedPath1 = getCatmullRomPath(startPoint, endPoint, centerPoint, 1, multiplierY1);

        // get path for side 2
        var multiplierY2 = withReflection ? multiplierY1 : Math.random();
        var curvedPath2 = getCatmullRomPath(startPoint, endPoint, centerPoint, -1, multiplierY2);

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
    var differenceX = (centerPoint.X - fromPoint.X);
    var differenceY = (centerPoint.Y - fromPoint.Y);
    return ["R", fromPoint.X + multiplierX*differenceX, fromPoint.Y + multiplierY*differenceY, toPoint.X, toPoint.Y];
}


var curves = function(n, origin, width, height) {
    // draw the path with start at origin
    var pathList = [];
    var startPointPathPart = ["M", origin.X, origin.Y];

    // add the curve a few times, always starting and ending in the same place
    var endX = width;
    var endY = -1*(height/2);
    var controlX = width/2;
    var controlY = (-1)*(2*height);
    var i = 0;
    var heightChange = height/n;
    while (i < n && endY < origin.Y) {
        i += 1;
        pathList.push(startPointPathPart);
        controlY += heightChange;
        pathList.push(["q", controlX, controlY, endX, endY]);
    }
    return pathList;
}
var curves2 = curves.bind(this, 2);
var curves3 = curves.bind(this, 3);
var curves4 = curves.bind(this, 4);
var curves5 = curves.bind(this, 5);


var quarterEllipse = function(origin, width, height) {
	/*
	Draw series of connected curves of diminishing height where axis length = offset
	*/
    // draw the path with start at origin
    var pathString = ""
    var startingSpotString = "M" + String(origin.X) + "," + String(origin.Y);
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
var trianglesPath = function(n, origin, width, height) {
    n = n || 1;
    var pathList = [];
    var startPointPathPart = ["M", origin.X, origin.Y];

    for (var i=1; i<=n; i++) {
        pathList.push(startPointPathPart);
        var widthDivisor = Math.pow(2, i);
        pathList.push(["h", width/widthDivisor]);
        pathList.push(["v", (-1)*height]);
        pathList.push(["Z"]);
    }
    return pathList;
}
var trianglePath = trianglesPath.bind(this, 1);
var trianglesPath2 = trianglesPath.bind(this, 2);
var trianglesPath3 = trianglesPath.bind(this, 3);

/**
 * Draw series of connected curves of diminishing height where axis length = offset
**/
var petalEllipse = function(origin, width, height) {

    // draw the path with start at origin
    var pathString = ""
    var startingSpotString = "M" + String(origin.X) + "," + String(origin.Y);
    // add the curve a few times, always starting and ending in the same place
    var aX = origin.X + width;
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

