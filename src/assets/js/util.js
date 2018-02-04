/*
	Collection of helper functions


*/

const SYMMETRY_STROKE_WIDTH = 5;
const DEFAULT_ANIMATE = 500; // Default animation interval in ms.


/*
Checks if passed in rotational degrees are valid

@param {string | number} degrees
@returns {boolean}
**/
function isValidRotateDeegrees(rotateDegrees) {
    return (0 <= Number(rotateDegrees) && Number(rotateDegrees));
}


function getRotateDegreesTransformString(origin, rotateDegrees) {
    return [
        "...R" + String(rotateDegrees),
        origin.X,
        origin.Y,
    ].join(",");
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Shows the symmetrySet upon hover with styles
 * @param {set} paper.Set to apply properties to
 * @param {styles} dictionary of styles to show upon hover
**/
function addSymmetrySetProperties(set, styles) {
    styles = styles || {};
    styles['stroke-width'] = SYMMETRY_STROKE_WIDTH;
    set.attr(styles);

    // initially hide the symmetry set and show upon hover
    set.attr({opacity: 0});
    set.mouseover(function() { set.attr({opacity: 0.6}); });
    set.mouseout(function() { set.attr({opacity: 0}); });
}

/**
Draws a diamond to represent the order-2 rotation point.

@param {Paper} paper to draw on
@param {X: Number, Y: Number} point to draw around
@param {Number} size (width) of point to draw

@returns {paper.path} path of drawn diamond.
**/
function drawOrder2RotationPoint(paper, point, size=1) {
    let pathList = [
        ["M", point.X - size, point.Y],
        ["L", point.X, point.Y - 2*size],
        ["L", point.X + size, point.Y],
        ["L", point.X, point.Y + 2*size],
        ["Z"]
    ];
    return paper.path(pathList);
}


/**
Draws set of order-2 rotations.

@param {Paper} paper to draw on
@param {X: Number, Y: Number} startPoint to draw around
@param {Number} gapX as horizontal distance between points drawn
@param {Number} gapY as vertical distance between points drawn
    - TODO: Use for wallpaper patterns

@returns {paper.set()} set of drawn points.
**/
function drawOrder2RotationPointSet(paper, startPoint, gapX, gapY=0, maxIterationsX=null, maxIterationsY=null) {    
    let set = paper.set();

    let canvasSize = paper.getSize().height,
        canvasWidth = paper.getSize().width;
    let point = startPoint;
    let i = 0;
    while (point.X < canvasWidth) {
        if (maxIterationsX && i >= maxIterationsX)
            break;

        set.push(drawOrder2RotationPoint(paper, point));
        
        point.X += gapX;
        i += 1;
    }
    return set;
}


/**
 * Draws set of Y-Axes of the same type
 * @param {Paper} paper to draw on
 * @param {number} starting X coordinate
 * @param {number} gap between axes
 * @returns {paper.Set} set of paths
**/
function drawYAxesSet(paper, startX, gap) {
    let canvasHeight = paper.getSize().height;
    let set = paper.set();
    let X = startX;
    while (X < paper.getSize().width) {
        let pathString = 'M' + String(X) + ',0 v' + String(canvasHeight);
        let path = paper.path(pathString);
        set.push(path);

        X += gap;
    }
    return set;
}

/**
 * Draws set of X-Axes of the same type
 * @param {Paper} paper to draw on
 * @param {number} starting Y coordinate
 * @param {number} gap between axes
 * @param {number} count: number of axes to draw -- defaults to 1
 * @returns {paper.Set} set of paths
**/
function drawXAxesSet(paper, startY, gap, count) {
    count = count || 1;
    let canvasWidth = paper.getSize().width;
    let set = paper.set();
    let Y = startY;

    for (let i=0; i<count; i++) {
        let pathString = 'M0,' + String(Y) + ' h' + String(canvasWidth);
        let path = paper.path(pathString);
        set.push(path);
        Y += gap;
    }
    return set;
}

/**
 * Draws X-axis
 * @param {Paper} paper to draw on
 * @param {number} starting Y coordinate
 * @returns {paper.Path}
**/
function drawXaxis(paper, y, color) {
    let paperWidth = paper.getSize().width;
    let xAxisPathString = "M0," + String(y) + " l" + String(paperWidth) + ",0";
    let xAxisPath = paper.path(xAxisPathString)
        .attr({
            "stroke-width": SYMMETRY_STROKE_WIDTH,
            "stroke": color || "lightgray"
        });
    return xAxisPath;
}

/*
Transforms fundamental domain across paper
@paper: Raphael object to draw on
@transformGetter: function to get transformation for the transformObject
@transormObject: fundamental domain to transform
@options: Dict of optional items:
    @animate: (Boolean)
    @callback: (Function) called with final paperSet of translations when done translating
    @contain: (Boolean) Whether to stop drawing pattern before boundary of container hit
    ... and more to be carried to transformGetter
*/
function recursiveTransform(paper, transformGetter, transformObject, options) {
    // Always get the last item, clone it, and translate it
    // Add translations to new set: translationSet =: [paperSet]

    // Note about animation: Where shapes land is more accurate
    // without animation/when animateMs = 0;
    let animateMs = (!!options.animate) ? DEFAULT_ANIMATE : 0;
    let callback = options.callback || function() {};

    let transformSet = paper.set().push(transformObject);

    let width = paper.getSize().width;
    let objectWidth = transformObject.getBBox().width;
    let height = paper.getSize().height;
    let objectHeight = transformObject.getBBox().height;
    
    // Allow the option to avoid drawing past the boundary of the containing div:
    // If contained is true, stop drawing before hit boundary of the containing div
    let contain = options.contain || false;
    // Need some buffer room in the containing bounds because these dimensions are not precise
    // and without buffer pattern will stop prematurely.
    let containerBuffer = 5;
    let maxDrawWidth = containerBuffer + (contain ? (width - objectWidth) : width);
    let maxDrawHeight = containerBuffer + height;

    function drawNext(i, transformSet) {
        if (transformSet.getBBox().x2 > maxDrawWidth || transformSet.getBBox().y2 > maxDrawHeight)
            return callback(transformSet);

        let lastItem = transformSet[transformSet.length - 1];
        let nextItem = lastItem.clone();

        let transformString = "..." + transformGetter(nextItem, options);

        let animateCallback = function() {
            drawNext(i + 1, transformSet.push(nextItem));
        };
        nextItem.animate({transform: transformString}, animateMs, "<", animateCallback);
    }
    drawNext(0, transformSet);
}
