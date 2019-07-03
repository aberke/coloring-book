/*
Collection of SVG Path generating functions
*/


/**
Draws the mirrors for a D2N shape.

@param mirrors can be either an array of integers or an integer.
    mirror as array:
        0's indicate to skip a mirror line
        i.e [0,1,0,0] will draw the first diagonal of a D4 shape
    mirrors as integer:
        The number of mirrors drawn will match the integer.
        This equivalent to passing an array of 1's the length of the integer.

@returns pathSet
**/
function drawMirrorLines(paper, centerPoint, mirrors, size) {
    // Implementation detail:
    // - Draw mirrors as spokes from the center of length size/2
    // - That means drawing 2N lines
    size = size || Math.min(paper.getSize().width, paper.getSize().height);

    if (!mirrors || !size || size <= 0)
        return;

    let mirrorsArray, N;
    if (mirrors.constructor === Array) {
        mirrorsArray = mirrors;
        N = mirrors.length;
    } else {
        N = Number(mirrors);
        if (N <= 0 || isNaN(N))
            return;
        mirrorsArray = new Array(N).fill(1);
    }

    let halfRotationRadians = Math.PI/N;
    let halfSize = (1/2)*size;

    let pathList = [];
    let r, p1, p2;
    for (r=0; r<N; r++) {
        if (!mirrorsArray[r])
            continue;

        p1 = {
            X: centerPoint.X + (halfSize*Math.sin(r*halfRotationRadians)),
            Y: centerPoint.Y + (halfSize*Math.cos(r*halfRotationRadians))
        };
        p2 = {
            X: centerPoint.X + (halfSize*Math.sin(Math.PI + r*halfRotationRadians)),
            Y: centerPoint.Y + (halfSize*Math.cos(Math.PI + r*halfRotationRadians))
        };
        pathList += [
            // center point to end of mirror
            ["M", centerPoint.X, centerPoint.Y],
            ["L", p1.X, p1.Y],
            // center point to opposite end of mirror
            ["M", centerPoint.X, centerPoint.Y],
            ["L", p2.X, p2.Y]
        ];
    }
    let path = paper.path(pathList).attr({
        "stroke-width": 1,
        // 'stroke' styled based on .mirror-line class in CSS
        "class": "mirror-line"
    });
    return paper.set().push(path);
}


/**
Creates a path of random slices slanted from the bottom-left corner
towards the opposite corner.

@param {X: number, Y: number} origin representing top left corner
@param {number} width of enclosed path
@param {number} height enclosing path
@param {object} options
                {number} levels of slices to create
                {number} pathsPerLevel
                {boolean} allowCurved (default: false) -- when false slices will not be curved

@returns {array} pathList

Pathlist fits within containing box:
    X1 is the leftmost width of the allowed box
    X2 is the rightmost width of the allowed box
    Y1 is the topmost height of the containing box
    Y2 is the bottommost height

    (X1=origin.X, origin.Y)-----------(X2=origin.X+width, Y1=origin.Y)
    |                                |
    (X1=origin.X, origin.Y+height)----(X2=origin.X+width, Y2=origin.Y+height)
**/
function slantedSlices(origin, width, height, options={}) {
    // levels can be passed in as an option with a default of 3
    // and must be within range of minLevels and maxLevels
    const minLevels = 1;
    const maxLevels = 3;
    const levels = Math.max(minLevels, Math.min(options.levels || 2, maxLevels));

    const pathsPerLevel = options.pathsPerLevel || 2;

    const allowCurved = (!!options.allowCurved && options.allowCurved !== "false");
    // function to randomly decide if a path is curved or not
    function chooseIsCurved() {
        return (allowCurved && Math.random() > 0.4) ? true : false;
    }

    let pathList = [];

    const containingBox = {
        X1: origin.X,
        X2: origin.X + width,
        Y1: origin.Y,
        Y2: origin.Y + height,
    };

    const startPoint = {
        X: origin.X,
        Y: origin.Y + height,
    };
    const midPoint = {
        X: origin.X + (1/2)*width,
        Y: origin.Y + (1/2)*height,
    };
    const endPoint = {
        X: origin.X + width,
        Y: origin.Y
    };
    const centerStartPoint = {
        X: origin.X + (1/4)*width,
        Y: origin.Y + (3/4)*height,
    };
    const centerEndPoint = {
        X: origin.X + (3/4)*width,
        Y: origin.Y + (1/4)*height,
    };

    let p;
    for (p=1; p <= pathsPerLevel; p++) {
        
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

/*
Returns a random pathList representing a closed set of
curves or lines around a 45 degree diagonal line / .
The curves/lines should fit within the containing box boundaries.

X1 is the leftmost width of the allowed box
X2 is the rightmost width of the allowed box
Y1 is the topmost height of the containing box
Y2 is the bottommost height
Box:

(X1, Y1)----(X2, Y2)
|           |
(X1, Y2)----(X2, Y2)
**/
function slantedClosedPathWithinBox(fromPoint, toPoint, containingBox, isCurved) {
    let boxX1 = containingBox.X1;
    let boxX2 = containingBox.X2;
    let boxY1 = containingBox.Y1;
    let boxY2 = containingBox.Y2;

    // slope line that cuts from corner to corner of the box
    let slope = (boxY1 - boxY2)/(boxX2 - boxX1);
    let buffer = 15; // buffer from the vertical sides of the containing box and from the line

    // side 1
    let cX1 = getRandomNumber(boxX1, boxX2 - buffer),
    // make sure Y is above the slope line
    // neex a y that is between the y of the line and boxY2
        cY1 = getRandomNumber(boxY1, slope*cX1 + boxY2 - buffer),

    // side 2
        cX2 = getRandomNumber(boxX1 + buffer, boxX2),
    // make sure Y is below the slope line
    // neex a y that is between boxY1 and the y of the line (a buffer amount above line)
        cY2 = getRandomNumber(slope*cX2 + boxY2 + buffer, boxY2);

    // push the path
    const startPointPathPart = ["M", fromPoint.X, fromPoint.Y];
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
        const lineToEndPoint = ["L", toPoint.X, toPoint.Y];
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
    let pathList = [];
    pathList += petalEllipse(origin, width, height, {maxLoops: getRandomInt(1, 2)});
    pathList += slantedDiamond(origin, width, height);
    return pathList;
}


/**
Draw series of connected curves of diminishing height where axis length = offset
@return {array} for a pathList
**/
function petalEllipse(origin, width, height, options={}) {
    // Height defaults to width.
    height = height || width;

    let pathList = [];
    let startPointPathPart = ["M", origin.X, origin.Y + height];

    // add the curve a few times, always starting and ending in the same place
    let aX = origin.X + width;
    let aY = height;

    let i = 0;
    let maxLoops = options.maxLoops || 3;
    let angle = -10;
    let heightChange = (-1)*(height/maxLoops);
    while (i <= maxLoops && aY > 1) {
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
    const fromPoint = {
        X: origin.X,
        Y: origin.Y + height,
    };
    const toPoint = {
        X: origin.X + width,
        Y: origin.Y,
    };
    const containingBox = {
        X1: origin.X,
        X2: origin.X + width,
        Y1: origin.Y,
        Y2: origin.Y + height,
    };
    return slantedClosedPathWithinBox(fromPoint, toPoint, containingBox, false);
}


function curves(n, origin, width, height) {
    // Set default n.
    n = n || 4;

    // Draw the path with start at bottom left corner.
    let pathList = [];
    let startPointPathPart = ["M", origin.X, origin.Y + height];

    // add the curve a few times, always starting and ending in the same place
    let endX = width;
    let endY = -1*(height/2);
    let controlX = width/2;
    let controlY = (-1)*(1.8*height);
    let i = 0;
    let heightChange = height/n;
    while (i < n && endY < origin.Y) {
        i += 1;
        pathList.push(startPointPathPart);
        controlY += heightChange;
        pathList.push(["q", controlX, controlY, endX, endY]);
    }
    return pathList;
}
function curves2(o, w, h) { return curves(2, o, w, h); }
function curves3(o, w, h) { return curves(3, o, w, h); }
function curves4(o, w, h) { return curves(4, o, w, h); }
function curves5(o, w, h) { return curves(5, o, w, h); }


/***
Generates path for triangles: n triangles placed within eachother
@return {array} for a pathList for n triangles, placed within eachother

Pathlist fits within containing box:
    X1 is the leftmost width of the allowed box
    X2 is the rightmost width of the allowed box
    Y1 is the topmost height of the containing box
    Y2 is the bottommost height

    (origin.X, origin.Y)-----------(origin.X+width, origin.Y)
    |                                |
    (origin.X, origin.Y+height)----(origin.X+width, origin.Y+height)
**/
function trianglesPath(n, origin, width, height, symmetrical) {
    n = n || 1;
    // Redeclare the variables in order to modify them without downstream effects.
    let x = origin.X,
        y = origin.Y,
        w = width,
        h = (height || width); // Default height = width.

    if (!symmetrical && n == 1 && width == h) {
        // Make the bottom of the triangle end up where it would with the original height.
        // This makes a gap at the top of the containing box instead of the bottom.
        y += (1/3)*h;
        h = (2/3)*h;
    }
    let pathList = [];
    let startPointPathPart = ["M", x, y + h];
    let i;
    for (i=0; i<n; i++) {
        pathList += [
            [startPointPathPart],
            ["h", width/Math.pow(2, i)],
            ["v", (-1)*h],
            ["Z"]
        ];
    }
    return pathList;
}
function symmetricalTrianglePath(o, w) { return trianglesPath(1, o, w, w, true); }
// trianglePath is asymmetrical.
function trianglePath(o, w, h) { return trianglesPath(1, o, w, h); }
function trianglesPath2(o, w, h) { return trianglesPath(2, o, w, h); }
function trianglesPath3(o, w, h) { return trianglesPath(3, o, w, h); }
function trianglesPath4(o, w, h) { return trianglesPath(4, o, w, h); }



function hexagon(origin, width, height, options) {
    let sideLength = width/2;
    // Note: the height and width will not be the same
    origin = {
        X: origin.X + sideLength,
        Y: origin.Y + (1/2)*height
    };
    let pathList = [];
    let r, currentRotationRadians, nextRotationRadians;
    let p1, p2;
    for (r=0; r<6; r++) {
        currentRotationRadians = (r/6)*(2*Math.PI);
        nextRotationRadians = ((r+1)/6)*(2*Math.PI);
        p1 = {
            X: origin.X + sideLength*Math.cos(currentRotationRadians),
            Y: origin.Y + sideLength*Math.sin(currentRotationRadians)
        };
        p2 = {
            X: origin.X + sideLength*Math.cos(nextRotationRadians),
            Y: origin.Y + sideLength*Math.sin(nextRotationRadians)
        };
        pathList += [
            ["M", p1.X, p1.Y],
            ["L", p2.X, p2.Y]
        ];
    }
    return pathList;
}

function triangleGridHexagon(origin, width, height, options) {
    let sideLength = width/2;
    // Note: the height and width will not be the same
    origin = {
        X: origin.X + sideLength,
        Y: origin.Y + (1/2)*height
    };
    let pathList = [];
    let r, currentRotationRadians, nextRotationRadians;
    let p1, p2;
    for (r=0; r<6; r++) {
        currentRotationRadians = (r/6)*(2*Math.PI);
        nextRotationRadians = ((r+1)/6)*(2*Math.PI);
        p1 = {
            X: origin.X + sideLength*Math.cos(currentRotationRadians),
            Y: origin.Y + sideLength*Math.sin(currentRotationRadians)
        };
        p2 = {
            X: origin.X + sideLength*Math.cos(nextRotationRadians),
            Y: origin.Y + sideLength*Math.sin(nextRotationRadians)
        };
        pathList += [
            ["M", origin.X, origin.Y],
            ["L", p1.X, p1.Y],
            ["L", p2.X, p2.Y]
        ];
    }
    return pathList;
}


/**
Creates path of slices along a line, contained within
(width, height) and oriented with line on the right.
Path is randomly generated.
(Used by CircularPattern)

@param {X: number, Y: number} origin to start drawing along line
@param {number} width of the slice
@param {number} height of the slice
@param {number} slicesCount as number of slices to draw along line
@param {boolean} withReflection whether or not slices should be symmetric

@returns {array} pathList
*/
function getFundamentalDomainLineSlices(origin, width, height, options={}) {
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

/*
Draws a series of connected curves of diminishing height.

Returns {array} pathList.
*/
function quarterEllipse(origin, width, height) {
    // Draw the path with start at bottom left corner.
    let pathList = [];
    let startingSpotString = ["M", origin.X, + origin.Y + height];
    
    // Add the curve a few times, always starting and ending in the same place
    let aX = width,
        aY = height;

    let i = 0,
        maxLoops = 4,
        angle = 0,
        heightChange = (-1)*(height/maxLoops);
    while (i <= maxLoops && aY > 0) {
        pathList += startingSpotString;
        pathList += ["a", aX, aY, angle, 0, 1, aX, (-1)*aY];
        // draw vertical line connecting to previous curve
        if (i > 0)
        	pathList += ["l", 0, heightChange];

        aY += heightChange;
        i += 1;
    }
    return pathList;
}
/*
Draws curved paths starting from bottom left corner to right side.
The right side is a solid straight line.
It looks similar to this but with closed curves:
   /|
 ///|
//  |

About drawing elliptical arcs:
https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
A (absolute)
a (relative)
(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
*/
function curvesToStraightSide(origin, width, height) {
    // Draw the path with start at bottom left corner.
    let pathList = [];
    let startingSpotString = ["M", origin.X, + origin.Y + height];
    
    let x = width,
        y = height,
        rx = x,
        ry = y;

    let curves = 4;

    let angle = 0,
        heightChange = (-1/(curves - 1))*height,
        rxChange = (-1)*(width/(curves*2));

    while (curves >= 0 && y >= 0) {
        pathList += startingSpotString;
        pathList += ["a", rx, ry, angle, 0, 1, x, (-1)*y];
        // Draw vertical line down to connect to the next curve.
        if (curves > 1)
            pathList += ["l", 0, (-1)*heightChange];

        rx += rxChange;
        ry += (1/2)*heightChange;
        y += heightChange;
        curves -= 1;
    }

    return pathList;
}

function curvedTriangle(origin, width, height) {
    // Draw the path with start at bottom left corner.
    let pathList = [];
    let startingSpotString = ["M", origin.X, + origin.Y + height];
    
    let rx1 = width,
        ry1 = height,
        rx2 = rx1 + (-1/3)*width,
        ry2 = ry1 + (-1/2)*height;

    const angle = 0;

    pathList += startingSpotString;
    pathList += ["a", rx1, ry1, angle, 0, 1, width, (-1)*height];
    pathList += ["Z"];

    pathList += startingSpotString;
    pathList += ["a", rx2, ry2, angle, 0, 1, width, 0];
    pathList += ["l", 0, (-1)*height];

    return pathList;
}

/************************************************
Underlying Fundamental Domain grid pieces
************************************************/

/*
Returns the path for a 60-60-60 triangle that is the building block
for a triangular grid underlay for a fundamental domain.
^    x
|    xxx
|    xxxxxx
h    xxxxxxxx
|    xxxxxx
|    xxx
v    x
<---- w ----->

w = (h/2)*sqrt(3)

NOTE: This is not used by line groups
*/
function triangularGridFundamentalDomainFull(origin, size) {
    // Origin is top left corner
    let height = size;
    let width = (height/2)*Math.sqrt(3);
    return [
        ["M", origin.X, origin.Y],
        ["v", height],
        ["l", width, (-1/2)*height],
        ["Z"]
    ];
}

/*
Returns the path for a 30-60-90 triangle.
height of triangle = sqrt(3)*width
|\
|_\
This is the top half of a 30-30-120 triangle
|\
| \
| /  
|/
This triangle is 1/3 of a 60-60-60 triangle that is the building block
for a triangular grid underlay for a fundamental domain.
*/
function triangularGridFundamentalDomainSixth(origin, size) {
    let width = size;
    let height = width*Math.sqrt(3);
    return [
        ["M", origin.X, origin.Y],
        ["v", height],
        ["h", width],
        ["Z"]
    ];
}


/*
The triangle sits like this:
size is the side length, which is also the effective width.

 /\
/  \
----

Triangle should sit at the bottom of the cell so that it aligns with design.
*/
function regularTriangularGridFundamentalDomain(origin, width, height) {
    let size = Math.max(width, height);
    let h = (size/2)*Math.sqrt(3);
    // Move the origin over to be the bottom left.
    return [
        ["M", origin.X, origin.Y + size],
        ["h", size],
        ["l", (-1/2)*size, (-1)*h],
        ["Z"]
    ];
}


/*
Returns the path for a rectangle that is the building block for a rectangular grid
underlay for a fundamental domain.
*/
function rectangleGridFundamentalDomain(origin, width, height) {
    // Origin is top left corner.
    return [
        ["M", origin.X, origin.Y],
        ["v", height],
        ["h", width],
        ["v", (-1)*height],
        ["Z"]
    ];
}
/*
Returns the path for a square that is the building block for a square grid
underlay for a fundamental domain.
*/
function squareGridFundamentalDomain(origin, size) {
    // Origin is top left corner.
    return [
        ["M", origin.X, origin.Y],
        ["v", size],
        ["h", size],
        ["v", (-1)*size],
        ["Z"]
    ];
}


/************************************************
Utility functions
************************************************/

function getCatmullRomPath(fromPoint, toPoint, centerPoint, multiplierX, multiplierY) {
    const differenceX = (centerPoint.X - fromPoint.X);
    const differenceY = (centerPoint.Y - fromPoint.Y);
    return ["R", fromPoint.X + multiplierX*differenceX, fromPoint.Y + multiplierY*differenceY, toPoint.X, toPoint.Y];
}

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
