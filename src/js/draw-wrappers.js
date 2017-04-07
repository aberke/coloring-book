/**
Draws shape in the center of the canvas.
Optionally draws text below.  Uses passed in function to draw the shape.

@param {Object} paper to draw on
@param {function} function to draw with
        function should have interface:
            paper, origin, size, options

@param {object} options
                {string} text to draw below shape
                {number} autoRotateDegrees - defaults to none.
                        When set, shape automatically rotates every so often by this amount in animation
                {number} margin to keep within sides of canvas and shape

@returns {pathSet: object, origin: {X: number, Y: number}}
*/
function drawInCanvasCenter(paper, drawFunction, functionOptions, options) {
    functionOptions = functionOptions || {};
    options = options || {};

    var width = paper.getSize().width;
    var height = paper.getSize().height;

    var margin = options.margin || 0;

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
    pathSet.push(drawFunction(paper, origin, size, functionOptions));


    // if there is text to draw, draw it underneath
    if (options.text)
        paper.text(origin.X, origin.Y + size/2 + bottomMargin/2, options.text);

    // Optionally have shape initially rotated
    if (options.initialRotation && !isNaN(parseFloat(options.initialRotation)))
        setInitialRotation(pathSet, origin, options.initialRotation);

    // Optionally rotate on interval
    if (options.autoRotateDegrees)
        setAutoRotate(pathSet, origin, options.autoRotateDegrees);

    return {
        pathSet: pathSet,
        origin: origin,
    }
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

function setAutoRotate(pathSet, origin, autoRotateDegrees) {
    var interval = 12000;
    var animationLength = 2000;
    var transformString = [
        "...R" + String(autoRotateDegrees),
        origin.X,
        origin.Y,
    ].join(",");

    setInterval(function(){
        pathSet.animate({transform: transformString}, animationLength);
    }, interval);
}


/* ------------------
Wrappers around draw functions
These are called by the drawInCanvasCenter function
They draw the desired shape around the origin/centerPoint
*/


function drawSierpinskiTriangle(paper, centerPoint, size, options) {
    var pathSet = getSierpinskiTriangle(centerPoint, size, options);
    paper.path(pathSet);
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






