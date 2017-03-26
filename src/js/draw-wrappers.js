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

@returns {pathSet: object, origin: {X: number, Y: number}}
*/
function drawInCanvasCenter(paper, drawFunction, functionOptions, options) {
    options = options || {};

    let width = paper.getSize().width;
    let height = paper.getSize().height;

    // if want to draw text below, leave margin below the shape for it
    let bottomMargin = options.text ? 15 : 0;

    // total desired size := minumum boundary minus bottom margin
    let size = Math.min(width, height - bottomMargin);
    let origin = getCanvasCenter(paper);
    // shift origin to accommodate bottom margin
    origin.Y = origin.Y - (bottomMargin/2);

    // Draw the main shape
    // The returned pathSet is either a path or a set of paths
    let pathSet = drawFunction(paper, origin, size, functionOptions);

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


function drawInscribedRegularNGon(paper, centerPoint, size, options) {
    
    let pathSet = paper.set();
    
    // draw inscribing circle first so that polygon path sits on top
    let circlePath = drawInscribingCircle(paper, centerPoint, size);
    pathSet.push(circlePath);

    let nGonPathSet = drawRegularNGon(paper, centerPoint, size, options)
    pathSet.push(nGonPathSet);

    return pathSet;
}

function drawRegularNGon(paper, centerPoint, size, options) {
    let N = options.N;
    let regularNGon = new RegularNGon(paper, centerPoint, size, N, options);
    let pathSet = regularNGon.pathSet;
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


function drawRectangle(paper, centerPoint, size, options) {
    // TODO: use options to check if should draw sides different strokes
    let width = size;
    let height = size/2;
    let path = paper.rect(origin.X - width/2, origin.Y - height/2, width, height);
    styleShapePath(path);
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






