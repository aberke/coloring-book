/*
Collection of SVG Path generating functions
*/


/**
Draws the mirrors for a D2N shape.

@returns pathSet
**/
function drawMirrorLines(paper, centerPoint, N, size) {
    // Implementation detail:
    // - Draw mirrors as spokes from the center of length size/2
    // - That means drawing 2N lines
    size = size || Math.min(paper.getSize().width, paper.getSize().height);

    if (!N || N <= 0 || !size || size <= 0)
        return;

    let halfRotationRadians = Math.PI/N;
    let halfSize = (1/2)*size;

    let pathList = [];
    let r, p;
    for (r=0; r<2*N; r ++) {
        p = {
            X: centerPoint.X + (halfSize*Math.sin(r*halfRotationRadians)),
            Y: centerPoint.Y + (halfSize*Math.cos(r*halfRotationRadians))
        };
        pathList += [
            // center point
            ["M", centerPoint.X, centerPoint.Y],
            ["L", p.X, p.Y]
        ];
    }
    let path = paper.path(pathList).attr({
        // adding class allows styling with CSS
        "class": "mirror-line"
    });
    return paper.set().push(path);
}


/**
Creates a path of random slices slanted from the origin towards the opposite corner.

@param {X: number, Y: number} origin
@param {number} width of enclosed path
@param {number} height enclosing path
@param {object} options
                {number} levels of slices to create
                {number} pathsPerLevel
                {boolean} allowCurved (default: false) -- when false slices will not be curved

@returns {array} pathList
**/
function slantedSlices(origin, width, height, options) {
    options = options || {};

    // levels can be passed in as an option with a default of 3
    // and must be within range of minLevels and maxLevels
    var minLevels = 1;
    var maxLevels = 3;
    var levels = Math.max(minLevels, Math.min(options.levels || 3, maxLevels));

    var pathsPerLevel = options.pathsPerLevel || 2;

    var allowCurved = (!!options.allowCurved && options.allowCurved !== "false");
    // function to randomly decide if a path is curved or not
    function chooseIsCurved() {
        return (allowCurved && Math.random() > 0.4) ? true : false;
    }

    var pathList = [];

    // Set up containing box:
    // X1 is the leftmost width of the allowed box
    // X2 is the rightmost width of the allowed box
    // Y1 is the bottommost height of the containing box
    // Y2 is the topmost height

    // (X1, Y2)----(X2, Y2)
    // |           |
    // (X1, Y1)----(X2, Y1)
    var containingBox = {
        X1: origin.X,
        X2: origin.X + width,
        Y1: origin.Y,
        Y2: origin.Y - height,
    };

    var startPoint = origin;
    var midPoint = {
        X: origin.X + (1/2)*width,
        Y: origin.Y - (1/2)*height,
    };
    var endPoint = {
        X: origin.X + width,
        Y: origin.Y - height
    };
    var centerStartPoint = {
        X: origin.X + (1/4)*width,
        Y: origin.Y - (1/4)*height,
    };
    var centerEndPoint = {
        X: origin.X + (3/4)*width,
        Y: origin.Y - (3/4)*height,
    };

    for (var p=1; p <= pathsPerLevel; p++) {
        
        // create as many as 'pathsPerLevel' centered paths for when # of levels is 1
        // create only 3 centered path when levels > 2
        if (levels === 1 || (levels > 2 && p === 1)) {

            // put on the centered paths
            // They either take up the whole space, or just the middle portion
            // But there must be at least one path to take up take up the whole space
            if ((levels === 1 && p === 1) || Math.random() > 0.5) {
                // whole space
                pathList += slantedClosedPathWithinBox(startPoint, endPoint, containingBox, chooseIsCurved());
            } else {
                // center space
                pathList += slantedClosedPathWithinBox(centerStartPoint, centerEndPoint, containingBox, chooseIsCurved());
            }
        }

        // when levels 2 or 3, create the bottom and top portions
        if (levels > 1) {
            // add bottom portion
            pathList += slantedClosedPathWithinBox(startPoint, midPoint, containingBox, chooseIsCurved());
            
            // add top portion
            pathList += slantedClosedPathWithinBox(midPoint, endPoint, containingBox, chooseIsCurved());
        }

    }
    return pathList;
}

function closedCurvePathWithinBox(fromPoint, toPoint, containingBox) {
    return slantedClosedPathWithinBox(fromPoint, toPoint, containingBox, true);
}

function diamondWithinBox(fromPoint, toPoint, containingBox) {
    return slantedClosedPathWithinBox(fromPoint, toPoint, containingBox, false);
}

/*
Returns a random pathList representing a closed set of
curves or lines around a 45 degree diagonal line / .
The curves/lines should fit within the containing box boundaries.

X1 is the leftmost width of the allowed box
X2 is the rightmost width of the allowed box
Y1 is the bottommost height of the containing box
Y2 is the topmost height
Box:

(X1, Y2)----(X2, Y2)
|           |
(X1, Y1)----(X2, Y1)
**/
function slantedClosedPathWithinBox(fromPoint, toPoint, containingBox, isCurved) {
    var boxX1 = containingBox.X1;
    var boxX2 = containingBox.X2;
    var boxY1 = containingBox.Y1;
    var boxY2 = containingBox.Y2;

    // slope line that cuts from corner to corner of the box
    var slope = (boxY2 - boxY1)/(boxX2 - boxX1);
    var buffer = 15; // buffer from the vertical sides of the containing box and from the line

    // side 1
    var cX1 = getRandomNumber(boxX1, boxX2 - buffer);
    // make sure Y is above the slope line
    // neex a y that is between the y of the line and boxY2
    var cY1 = getRandomNumber(boxY2, slope*cX1 + boxY1 - buffer);

    // side 2
    var cX2 = getRandomNumber(boxX1 + buffer, boxX2);
    // make sure Y is below the slope line
    // neex a y that is between boxY1 and the y of the line (a buffer amount above line)
    var cY2 = getRandomNumber(slope*cX2 + boxY1 + buffer, boxY1);

    // push the path
    var startPointPathPart = ["M", fromPoint.X, fromPoint.Y];
    if (isCurved) {
        return [
            // top side
            startPointPathPart,
            ["Q", cX1, cY1, toPoint.X, toPoint.Y],

            // bottom side
            startPointPathPart,
            ["Q", cX2, cY2, toPoint.X, toPoint.Y],
        ];
    } else {
        var lineToEndPoint = ["L", toPoint.X, toPoint.Y];
        return [
            // top side
            startPointPathPart,
            ["L", cX1, cY1],
            lineToEndPoint,

            // bottom side
            startPointPathPart,
            ["L", cX2, cY2],
            lineToEndPoint
        ];
    }
}

/**
Creates path for petal ellipse enclosed by a slanted diamond

@param {X: number, Y: number} origin
@param {number} width of enclosed path
@param {number} height enclosing path

@returns {array} pathList
**/
function petalsEllipseWithDiamondPath(origin, width, height) {
    var pathList = [];
    pathList += petalEllipse(origin, width, height, {maxLoops: getRandomInt(1, 2)});
    pathList += slantedDiamond(origin, width, height);
    return pathList;
}


/**
 * Draw series of connected curves of diminishing height where axis length = offset
**/
function petalEllipse(origin, width, height, options = {}) {
    // height defaults to width
    height = height || width;

    // draw the path with start at origin
    var pathList = [];
    var startPointPathPart = ["M", origin.X, origin.Y];

    // add the curve a few times, always starting and ending in the same place
    var aX = origin.X + width;
    var aY = height;

    var i = 0;
    var maxLoops = options.maxLoops || 3;
    var angle = -10;
    var heightChange = (-1)*(height/maxLoops);
    while (i <= maxLoops && aY > 0) {
        pathList.push(startPointPathPart);
        pathList.push(["a", aX, aY, angle, 0, 1, aX, (-1)*aY]);
        pathList.push(startPointPathPart);
        pathList.push(["a", aX, aY, angle, 0, 0, aX, (-1)*aY]);
        
        aY += heightChange;
        angle += 5;
        i += 1;
    }
    return pathList;
}


/**
Creates path for a slanted diamond

@param {X: number, Y: number} origin
@param {number} width of enclosed path
@param {number} height enclosing path

@returns {array} pathList
**/
function slantedDiamond(origin, width, height) {
    var toPoint = {
        X: origin.X + width,
        Y: origin.Y - height,
    };
    var containingBox = {
        X1: origin.X,
        X2: toPoint.X,
        Y1: origin.Y,
        Y2: toPoint.Y,
    };
    return slantedClosedPathWithinBox(origin, toPoint, containingBox, false);
}



/**
Creates path for a line from the origin to opposite corner of the enclosing box.

@param {X: number, Y: number} origin
@param {number} width of enclosed path
@param {number} height enclosing path

@returns {array} pathList
**/
function slantedLinePath(origin, width, height) {
    return [
        ["M", origin.X, origin.Y],
        ["L", origin.X + width, origin.Y - height]
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
function getFundamentalDomainLineSlices(origin, width, height, options = {}) {
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
    };

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


function curves(n, origin, width, height) {
    // set default n
    n = n || 4;

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


function quarterEllipse(origin, width, height) {
	/*
	Draw series of connected curves of diminishing height where axis length = offset
	*/
    // draw the path with start at origin
    var pathString = "";
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
Generates path for triangles: n triangles placed within eachother
@return {array} for a pathList for n triangles, placed within eachother
**/
var trianglesPath = function(n, origin, width, height) {
    n = n || 1;
    // default height is same as width
    height = height || width;

    let pathList = [];
    let startPointPathPart = ["M", origin.X, origin.Y];

    let i, widthDivisor;
    for (i=1; i<=n; i++) {
        pathList.push(startPointPathPart);
        widthDivisor = Math.pow(2, i);
        pathList.push(["h", width/widthDivisor]);
        pathList.push(["v", (-1)*height]);
        pathList.push(["Z"]);
    }
    return pathList;
}
var trianglePath = trianglesPath.bind(this, 1);
var trianglesPath2 = trianglesPath.bind(this, 2);
var trianglesPath3 = trianglesPath.bind(this, 3);



/*** Utility functions ***/


/*
Returns random number between min and max
Used because native Math.random() does not take a range.
*/
function getRandomNumber(min, max) {
    return (Math.random() * (max - min)) + min;
}

/*
Returns random integer between min and max
Range is inclusive of max.
Used because native Math.random() does not take a range.
*/
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min + 1;
}
