/**
Draws shape in the center of the canvas.
Optionally draws text below.  Uses passed in function to draw the shape.

@param {Object} paper to draw on
@param {function} function to draw with
        function should have interface:
            paper, origin, size, options, isRedraw

@param {object} options
                {string} text: text to draw below shape
                {number} autoRotateDegrees: defaults to none.
                        When set, shape automatically rotates every so often by this amount in animation
                {number} margin: margin to keep within sides of canvas and shape
                {boolean} tapRedraw: whether to redraw upon click-like event.
                {number} tapRotate: number of degrees to rotate upon tap.  Must be between 0 and 360.
                        Only one of tapRedraw and tapRotate can be used.
                {string ("V"|"H")} mirror: option to reflect vertically or horizontally across center of canvas.

@returns {pathSet: object, origin: {X: number, Y: number}}
*/
function drawInCanvasCenter(paper, drawFunction, functionOptions, options) {
    functionOptions = functionOptions || {};
    options = options || {};

    var width = paper.getSize().width;
    var height = paper.getSize().height;

    var margin = options.margin || 10;

    // if want to draw text below, leave margin below the shape for it
    var bottomMargin = options.text ? 15 : 0;

    // total desired size := minumum boundary minus bottom margin
    var size = Math.min(width, height - Math.max(bottomMargin, margin));
    var origin = getCanvasCenter(paper);
    // shift origin to accommodate bottom margin
    origin.Y = origin.Y - (bottomMargin/2);

    // initialize the pathSet that will be returned
    var pathSet = paper.set();
    if (options.inscribed) {
        // Inscribe shape within another shape.
        // Inscribing shape drawn first so that shape sits on top.
        let inscribingShapePath = drawInscribingShape(paper, origin, size, options.inscribed);
        pathSet.push(styleInscribingShape(inscribingShapePath));
    }

    // Draw the main shape
    // The returned pathSet is either a path or a set of paths
    let mainPath = drawFunction(paper, origin, size, functionOptions, false);
    //styleShapePath(drawFunction(paper, origin, size, functionOptions, false));
    pathSet.push(mainPath);

    // if there is text to draw, draw it underneath
    if (options.text)
        paper.text(origin.X, origin.Y + size/2 + bottomMargin/2, options.text);

    // Optionally have shape initially rotated
    if (options.initialRotation && !isNaN(parseFloat(options.initialRotation)))
        setInitialRotation(pathSet, origin, options.initialRotation);

    // Optionally rotate on interval
    if (options.autoRotateDegrees)
        setAutoRotate(pathSet, origin, options.autoRotateDegrees);

    // optionally redraw or rotate on click/mouseup/tap
    if (options.tapRedraw) {
        paper.canvas.addEventListener('mouseup', function() {
            paper.clear();
            drawFunction(paper, origin, size, functionOptions, true);
        });
    } else if (options.tapRotate) {
        setTapRotate(paper, pathSet, origin, options.tapRotate);
    }

    if (options.mirror)
        setMirror(pathSet, origin, options.mirror);

    return {
        pathSet: pathSet,
        origin: origin,
    };
}


function getCanvasCenter(paper) {
    return {
        X: paper.getSize().width/2,
        Y: paper.getSize().height/2
    };  
}

/**
Reflect the pathSet across the center on either a vertical or horizontal mirror.
**/
function setMirror(pathSet, origin, mirror) {
    let mirrorOptions = {centeredMirror: true};
    let transformString;

    if (mirror === "V")
        transformString = ("..." + getMirrorV(pathSet, mirrorOptions));
    else if (mirror === "H")
        transformString = ("..." + getMirrorH(pathSet, mirrorOptions));
    else
        return;

    pathSet.transform(transformString)
}

function setInitialRotation(pathSet, origin, rotation) {
    pathSet.transform([
        "...R" + String(rotation),
        String(origin.X),
        String(origin.Y),
    ].join(","));   
}

function setTapRotate(paper, pathSet, origin, rotateDegrees) {
    if (!isValidRotateDeegrees(rotateDegrees))
        return;

    var animationLength = 2000;
    var transformString = getRotateDegreesTransformString(origin, rotateDegrees);
    paper.canvas.addEventListener('mouseup', function() {
        if (pathSet.isRotating)
            return; // avoid rotating if already rotating

        pathSet.isRotating = true;
        pathSet.animate({transform: transformString}, animationLength, function() {
            pathSet.isRotating = false;
        });
    });
}

function setAutoRotate(pathSet, origin, autoRotateDegrees) {
    if (!isValidRotateDeegrees(autoRotateDegrees))
        return;

    var interval = 12000;
    var animationLength = 2000;
    var transformString = getRotateDegreesTransformString(origin, autoRotateDegrees);

    setInterval(function(){
        pathSet.animate({transform: transformString}, animationLength);
    }, interval);
}


/* ------------------
Wrappers around draw functions
These are called by the drawInCanvasCenter function
They draw the desired shape around the origin/centerPoint
*/



/*
Handle drawing path from the arbitrary pathList functions in the paths.js file.

These functions start drawing from the bottom left of the origin,
so need to provide that point, and take a width and height.
**/
function drawQuarterEllipse(paper, centerPoint, size) {
    // function uses origin at bottom left
    let origin = {
        X: centerPoint.X - (1/2)*size,
        Y: centerPoint.Y + (1/2)*size,
    };

    let pathList = quarterEllipse(origin, size, size);
    let path = paper.path(pathList);
    return paper.set().push(path);
}

function drawCurves(paper, centerPoint, size, options) {
    // triangles function uses origin at bottom left
    let origin = {
        X: centerPoint.X - (1/2)*size,
        Y: centerPoint.Y + (1/2)*size,
    };

    let pathList = curves(options.n, origin, size, size);
    let path = paper.path(pathList);
    return paper.set().push(path);
}

function drawTriangles(paper, centerPoint, size, options) {
    let n = options.N || 3;

    // triangles function uses origin at bottom left
    let origin = {
        X: centerPoint.X - (1/2)*size,
        Y: centerPoint.Y + (1/2)*size,
    };

    let pathList = trianglesPath(n, origin, size, size);
    let path = paper.path(pathList);
    return paper.set().push(path);
}


function drawPetalEllipse(paper, centerPoint, size, options) {
    // uses origin at bottom left
    let origin = {
        X: centerPoint.X - (1/2)*size,
        Y: centerPoint.Y + (1/2)*size,
    };

    let pathList = petalEllipse(origin, size, size);
    let path = paper.path(pathList);
    return paper.set().push(path);
}


/*
Draws a horizontal arrow that is vertically aligned in the middle of the canvas,
from one side of the canvas to the other.
Can optionally pass in options.textAbove to write above arrow.
*/
function drawArrow(paper, centerPoint, size, options) {
    let pathSet = paper.set();

    if (options.textAbove)
        pathSet.push(paper.text(centerPoint.X, centerPoint.Y - 15, options.textAbove));

    let arrowPath = paper.path([
        ["M", centerPoint.X - (1/2)*size, centerPoint.Y],
        ["H", size]
    ]).attr({
        "arrow-end": "block-medium-short",
        "stroke-width": 4,
    });
    pathSet.push(arrowPath);
    return pathSet;
}

function drawSierpinskiTriangleFlower(paper, centerPoint, size, options) {
    return sierpinskiTriangle.drawSierpinskiTriangleFlower(paper, centerPoint, size, options.level);
}

function drawSierpinskiTriangle(paper, centerPoint, size, options, isRedraw) {
    let pathList = sierpinskiTriangle.getSierpinskiTriangle(centerPoint, size, options);
    let pathSet = paper.set();

    // for redrawing, draw path by path, otherwise put directly on paper
    if (isRedraw) 
        pathSet.push(fractalsUtil.drawPathByPath(paper, pathList, {stroke: 'black', 'stroke-width': 1}));
    else
        pathSet.push(paper.path(pathList));

    // rotate it 30 degrees around top left corner to 'faceRight'
    if (options.faceRight)
        pathSet.transform([
            "R30",
            String(centerPoint.X - (1/2)*size + 40),
            String(centerPoint.Y - (1/2)*size + 15),
        ].join(","));
    // rotate it -30 degrees around top right corner to 'faceLeft'
    else if (options.faceLeft)
        pathSet.transform([
            "R-30",
            String(centerPoint.X + (1/2)*size - 40),
            String(centerPoint.Y - (1/2)*size + 15),
        ].join(","));

    return pathSet;
}


/*
Returns the path set of the inscribing shape.
**/
function drawInscribingShape(paper, centerPoint, size, shapeName) {
    if (shapeName === "circle")
        return drawCircle(paper, centerPoint, size);
    else if (shapeName == "square")
        return drawSquare(paper, centerPoint, size);
    else if (shapeName === "triangle")
        return drawTriangle(paper, centerPoint, size);
    else // shapeName not recognized, return an empty path
        return paper.set();
}

function drawCircularTessellation(paper, centerPoint, size, options) {
    return new CircularTessellation(paper, centerPoint, size, options).pathSet;
}


function drawCyclicShape(paper, centerPoint, size, options) {
    return new CyclicShape(paper, centerPoint, size, options).pathSet;
}

function drawDihedralShape(paper, centerPoint, size, options) {
    let dihedralShape = new DihedralShape(paper, centerPoint, size, options);
    return dihedralShape.pathSet;
}


function drawRegularPolygon(paper, centerPoint, size, options) {
    return new RegularPolygon(paper, centerPoint, size, options).pathSet;
}

function drawTriangle(paper, centerPoint, size, options) {
    return drawRegularPolygon(paper, centerPoint, size, {"N": 3});
}

/*
DrawSquare uses drawRectangle so that two sides can be drawn at once,
and therefore path can be filled in.
(Cannot use 'fill' when there is only one straight line)
**/
function drawSquare(paper, centerPoint, size, options = {}) {
    let sideMultiplier = (3/4);
    options.width = sideMultiplier*size;
    options.height = sideMultiplier*size;
    return new Rectangle(paper, centerPoint, size, options).pathSet;
}

function drawRectangle(paper, centerPoint, size, options = {}) {
    return new Rectangle(paper, centerPoint, size, options).pathSet;
}

function drawCircle(paper, centerPoint, size) {
    return paper.circle(centerPoint.X, centerPoint.Y, size/2);
}


function styleInscribingShape(pathSet, options = {}) {
   return pathSet.attr({
        'stroke': COLORS.LIGHT_GRAY,
        'stroke-width': 1,
    });
}
