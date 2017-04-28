/**
Draws shape in the center of the canvas.
Optionally draws text below.  Uses passed in function to draw the shape.

@param {Object} paper to draw on
@param {function} function to draw with
        function should have interface:
            paper, origin, size, options, isRedraw

@param {object} options
                {string} text to draw below shape
                {number} autoRotateDegrees - defaults to none.
                        When set, shape automatically rotates every so often by this amount in animation
                {number} margin to keep within sides of canvas and shape
                {boolean} tapRedraw -- whether to redraw upon click-like event.
                {number} tapRotate as number of degrees to rotate upon tap.  Must be between 0 and 360.
                        Only one of tapRedraw and tapRotate can be used.

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
        // Inscribe shape within circle.
        // Inscribing circle drawn first so that shape sits on top.
        var circlePath = drawInscribingCircle(paper, origin, size);
        pathSet.push(circlePath);
    }

    // Draw the main shape
    // The returned pathSet is either a path or a set of paths
    pathSet.push(drawFunction(paper, origin, size, functionOptions, false));

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


function drawCircularTessellation(paper, centerPoint, size, options) {
    var circularTessellation = new CircularTessellation(paper, centerPoint, size, options);
    var pathSet = circularTessellation.pathSet;
    styleShapePath(pathSet);
    return pathSet;
}


function drawCyclicShape(paper, centerPoint, size, options) {
    var cyclicShape = new CyclicShape(paper, centerPoint, size, options);
    var pathSet = cyclicShape.pathSet;
    styleShapePath(pathSet);
    return pathSet;
}

function drawDihedralShape(paper, centerPoint, size, options) {
    var dihedralShape = new DihedralShape(paper, centerPoint, size, options);
    var pathSet = dihedralShape.pathSet;
    styleShapePath(pathSet);
    return pathSet;
}


function drawRegularPolygon(paper, centerPoint, size, options) {
    var regularNGon = new RegularPolygon(paper, centerPoint, size, options);
    var pathSet = regularNGon.pathSet;
    styleShapePath(pathSet);
    return pathSet;
}

function drawRectangle(paper, centerPoint, size, options) {
	var rectangle = new Rectangle(paper, centerPoint, size, options);
	var pathSet = rectangle.pathSet;
    styleShapePath(pathSet);
    return pathSet;
}


function drawInscribingCircle(paper, centerPoint, size) {
    var path = drawCircle(paper, centerPoint, size);
    path.attr({
        'stroke': COLORS.LIGHT_GRAY,
        'stroke-width': 1,
    });
    return path;
}

function drawCircle(paper, centerPoint, size) {
    var pathSet = paper.circle(centerPoint.X, centerPoint.Y, size/2);
    styleShapePath(pathSet);
    return pathSet;
}


function drawSquare(paper, centerPoint, size) {
    var path = paper.rect(centerPoint.X - size/2, centerPoint.Y - size/2, size, size);
    styleShapePath(path);
    return path;
}


function styleShapePath(pathSet) {
    pathSet.attr({
        'stroke-width': 2,
    });
}
