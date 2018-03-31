'use strict';

// animation length must 
const ANIMATION_LENGTH = 2000;
// interval length must be a multiple of animation length
// (shape will get stuck in animation otherwise)
const INTERVAL_LENGTH = 6*ANIMATION_LENGTH;
const MAX_INTERVAL_COUNT = 5;

/**
Draws shape in the center of the canvas.
Optionally draws text below.  Uses passed in function to draw the shape.
Turns on animations that were passed in options.  Animations should not be
enabled when DISABLE_ANIMATIONS.

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
                {string ("V"|"H")} autoReflect: option to on interval across either vertical (V) or horizontal (H) mirror
                {string ("V"|"H")} mirror: option to reflect vertically or horizontally across center of canvas.

@returns {pathSet: object, origin: {X: number, Y: number}}
*/
function drawInCanvasCenter(paper, drawFunction, functionOptions={}, options={}) {
    let width = paper.getSize().width;
    let height = paper.getSize().height;

    // allow margin to be any number, including 0.  Defaults to 10.
    let margin = (options.margin >= 0) ? options.margin : 10;

    // if want to draw text below, leave margin below the shape for it
    let bottomMargin = options.text ? 15 : 0;

    // total desired size := minumum boundary minus bottom margin
    let size = Math.min(width, height - Math.max(bottomMargin, margin));
    let origin = getCanvasCenter(paper);
    // shift origin to accommodate bottom margin
    origin.Y = origin.Y - (bottomMargin/2);

    // initialize the pathSet that will be returned
    let pathSet = paper.set();
    if (options.inscribed)
        // Inscribe shape within another shape.
        // Inscribing shape drawn first so that shape sits on top.
        pathSet.push(drawInscribingShape(paper, origin, size, options.inscribed));

    if (options.mirrorLines) {
        let mirrorLinesPaths = drawMirrorLines(paper, origin, options.mirrorLines, size + (1/2)*margin);
        pathSet.push(mirrorLinesPaths);
    }

    // Draw the main shape
    // The returned pathSet is either a path or a set of paths
    let mainPath = drawFunction(paper, origin, size, functionOptions, false);
    // style the main path appropriately
    if (options['stroke-dasharray'])
        mainPath.attr({'stroke-dasharray': options['stroke-dasharray']});

    if (options.fill) // fill is an integer mapping to array index
        mainPath.attr('fill', COLORING_FILL_ARRAY[options.fill]);

    pathSet.push(mainPath);

    // if there is text to draw, draw it underneath
    if (options.text) {
        // when there are mirror lines, move the text further down to be below them.
        let bottomMarginDistanceMult = options.mirrorLines ? (3/4) : (1/2);
        paper.text(origin.X, origin.Y + size/2 + bottomMarginDistanceMult*bottomMargin, options.text);
    }

    // Optionally have shape initially rotated
    if (options.initialRotation && !isNaN(parseFloat(options.initialRotation)))
        setInitialRotation(pathSet, origin, options.initialRotation);

    if (options.mirror)
        setMirror(pathSet, origin, options.mirror, false);

    // Maybe turn on animations/interactions based on options:
    // Disable animations when DISABLE_ANIMATIONS (for better browser performance)
    if (!DISABLE_ANIMATIONS)
        setupInteractions(paper, pathSet, origin, size, drawFunction, functionOptions, options);

    return {
        pathSet: pathSet,
        origin: origin,
    };
}

function setupInteractions(paper, pathSet, origin, size, drawFunction,
                           functionOptions, options) {
    
    // Optionally rotate on interval
    if (options.autoRotateDegrees)
        setAutoRotate(pathSet, origin, options.autoRotateDegrees);

    // optionally redraw or rotate on click/mouseup/tap
    if (options.tapRedraw)
        setTapRedraw(paper, pathSet, origin, size, drawFunction, functionOptions);
    else if (options.tapRotate)
        setTapRotate(paper, pathSet, origin, options.tapRotate);
    else if (options.tapReflect)
        setTapReflect(paper, pathSet, origin, options.tapReflect);

    if (options.autoReflect)
        setMirror(pathSet, origin, options.autoReflect, true);   
}


function getCanvasCenter(paper) {
    return {
        X: paper.getSize().width/2,
        Y: paper.getSize().height/2
    };  
}

/**
Wrap setting an interval so that all intervals are set in the same way.
Runs onIntervalFunction up to MAX_INTERVAL times and then clears interval.
*Important* to clear interval for memory/performance reasons
(Otherwise onIntervalFunction continues running on interval even after changing page)

@param {function} onIntervalFunction: function to be run on interval
**/
function setIntervalWrapper(onIntervalFunction) {
    let intervalCount = 0;

    let interval = setInterval(function(){
        intervalCount += 1;
        // run the function
        onIntervalFunction();
        // clear the interval if it has been run enough times
        if (intervalCount >= MAX_INTERVAL_COUNT)
            clearInterval(interval);

    }, INTERVAL_LENGTH);
}

/**
Reflect the pathSet across the center on either a vertical or horizontal mirror.
**/
function setMirror(pathSet, origin, mirror, onInterval=false) {
    let transformString;
    if (mirror === "V")
        transformString = "...S-1,1," + String(origin.X) + "," + String(origin.Y);
    else if (mirror === "H")
        transformString = "...S1,-1," + String(origin.X) + "," + String(origin.Y);
    else
        return;

    if (!!onInterval)
        setIntervalWrapper(function(){
            pathSet.animate({transform: transformString}, ANIMATION_LENGTH);
        });
    else
        pathSet.transform(transformString);
}

function setTapRedraw(paper, pathSet, origin, size, drawFunction, functionOptions) {
    paper.canvas.addEventListener("mouseup", function() {
        paper.clear();
        drawFunction(paper, origin, size, functionOptions, true);
        analytics.trackRedraw(drawFunction.name);
    });
    pathSet.attr({"class": "clickable"});
}

function setTapReflect(paper, pathSet, origin, mirror) {
    let transformString;
    if (mirror === "V")
        transformString = "...S-1,1," + String(origin.X) + "," + String(origin.Y);
    else if (mirror === "H")
        transformString = "...S1,-1," + String(origin.X) + "," + String(origin.Y);
    else
        return;

    paper.canvas.addEventListener("mouseup", function() {
        if (pathSet.isReflecting)
            return; // avoid reflecting if already reflecting

        pathSet.isReflecting = true;
        pathSet.animate({transform: transformString}, ANIMATION_LENGTH, function() {
            pathSet.isReflecting = false;
        });
    });
    pathSet.attr({"class": "clickable"});
}

function setInitialRotation(pathSet, origin, rotateDegrees) {
    if (rotateDegrees <= 0 || !transforms.isValidRotateDegrees(rotateDegrees))
        return;

    pathSet.transform("..." + transforms.getRotationByDegrees(origin, rotateDegrees));   
}

function setTapRotate(paper, pathSet, origin, rotateDegrees) {
    if (rotateDegrees <= 0 || !transforms.isValidRotateDegrees(rotateDegrees))
        return;

    let transformString = "..." + transforms.getRotationByDegrees(origin, rotateDegrees);
    paper.canvas.addEventListener("mouseup", function() {
        if (pathSet.isRotating)
            return; // avoid rotating if already rotating

        pathSet.isRotating = true;
        pathSet.animate({transform: transformString}, ANIMATION_LENGTH, function() {
            pathSet.isRotating = false;
        });
    });
    pathSet.attr({"class": "clickable"});
}

function setAutoRotate(pathSet, origin, rotateDegrees) {
    if (rotateDegrees <= 0 || !transforms.isValidRotateDegrees(rotateDegrees))
        return;

    let transformString = "..." + transforms.getRotationByDegrees(origin, rotateDegrees);
    let onIntervalFunction = function() {
        pathSet.animate({transform: transformString}, ANIMATION_LENGTH);
    };
    setIntervalWrapper(onIntervalFunction);
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
        Y: centerPoint.Y - (1/2)*size,
    };

    let pathList = quarterEllipse(origin, size, size);
    let path = paper.path(pathList);
    return paper.set().push(path);
}

function drawTriangles(paper, centerPoint, size, options) {
    let n = options.N || 3;

    // triangles function uses origin at bottom left
    let origin = {
        X: centerPoint.X - (1/2)*size,
        Y: centerPoint.Y - (1/2)*size,
    };

    let pathList = trianglesPath(n, origin, size, size);
    let path = paper.path(pathList);
    return paper.set().push(path);
}


function drawPetalEllipse(paper, centerPoint, size) {
    // uses origin at bottom left
    let origin = {
        X: centerPoint.X - (1/2)*size,
        Y: centerPoint.Y - (1/2)*size,
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
function drawInscribingShape(paper, centerPoint, size, shapeName, initialRotation=0) {
    let pathSet = paper.set();

    if (shapeName === "circle")
        pathSet = drawCircle(paper, centerPoint, size);
    else if (shapeName == "square")
        pathSet = drawSquare(paper, centerPoint, size);
    else if (shapeName === "triangle")
        pathSet = drawTriangle(paper, centerPoint, size);
    else // shapeName not recognized, return an empty path
        return pathSet;

    setInitialRotation(pathSet, centerPoint, initialRotation);
    // add class to inscribed shape so that it can be styled with CSS
    pathSet.attr("class", "inscribed");

    return pathSet;
}

function drawCircularPattern(paper, centerPoint, size, options) {
    return new CircularPattern(paper, centerPoint, size, options).pathSet;
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

function drawTriangle(paper, centerPoint, size) {
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
