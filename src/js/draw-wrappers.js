"use-strict";


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
    options = options || {};

    let width = paper.getSize().width;
    let height = paper.getSize().height;

    let margin = options.margin || 0;

    // if want to draw text below, leave margin below the shape for it
    let bottomMargin = options.text ? 15 : 0;

    // total desired size := minumum boundary minus bottom margin
    let size = Math.min(width, height - Math.max(bottomMargin, margin));
    let origin = getCanvasCenter(paper);
    // shift origin to accommodate bottom margin
    origin.Y = origin.Y - (bottomMargin/2);

    // initialize the pathSet that will be returned
    let pathSet = paper.set();
    if (options.inscribed) {
        // Inscribe shape within circle.
        // Inscribing circle drawn first so that shape sits on top.
        let circlePath = drawInscribingCircle(paper, origin, size);
        pathSet.push(circlePath);
    }

    // Draw the main shape
    // The returned pathSet is either a path or a set of paths
    pathSet.push(drawFunction(paper, origin, size, functionOptions));


    // if there is text to draw, draw it underneath
    if (options.text)
        paper.text(origin.X, origin.Y + size/2 + bottomMargin/2, options.text);

    // Optionally rotate on interval
    if (options.autoRotateDegrees)
        setAutoRotate(pathSet, origin, options.autoRotateDegrees);

    return {
        pathSet: pathSet,
        origin: origin,
    }
}


function getCanvasCenter(paper) {
    return origin = {
        X: paper.getSize().width/2,
        Y: paper.getSize().height/2
    };  
}

function setAutoRotate(pathSet, origin, autoRotateDegrees) {
    let interval = 12000;
    let animationLength = 2000;
    let transformString = [
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

function drawCyclicShape(paper, centerPoint, size, options) {
    let cyclicShape = new CyclicShape(paper, centerPoint, size, options);
    let pathSet = cyclicShape.pathSet;
    styleShapePath(pathSet);
    return pathSet;
}

function drawDihedralShape(paper, centerPoint, size, options) {
    let dihedralShape = new DihedralShape(paper, centerPoint, size, options);
    let pathSet = dihedralShape.pathSet;
    styleShapePath(pathSet);
    return pathSet;
}


function drawRegularPolygon(paper, centerPoint, size, options) {
    let regularNGon = new RegularPolygon(paper, centerPoint, size, options);
    let pathSet = regularNGon.pathSet;
    styleShapePath(pathSet);
    return pathSet;
}

function drawRectangle(paper, centerPoint, size, options) {
	let rectangle = new Rectangle(paper, centerPoint, size, options);
	let pathSet = rectangle.pathSet;
    styleShapePath(pathSet);
    return pathSet;
}


function drawInscribingCircle(paper, centerPoint, size) {
    let path = paper.circle(centerPoint.X, centerPoint.Y, size/2);
    path.attr({
        'stroke': COLORS.LIGHT_GRAY,
        'stroke-width': 1,
    });
    return path;
}


function drawSquare(paper, centerPoint, size) {
    let path = paper.rect(origin.X - size/2, origin.Y - size/2, size, size);
    styleShapePath(path);
    return path;
}


function styleShapePath(pathSet) {
    pathSet.attr({
        'stroke-width': 2,
    });
}






