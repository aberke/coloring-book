/*
	Collection of helper functions


*/

const SYMMETRY_STROKE_WIDTH = 5;


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
Constructor for glide reflection transformation string
@pathSet: (Paper.path | Paper.set) to construct transformation from
@options: (Object) dictionary of arguments:
    @mirrorOffset: (Number) distance from bottom of pathset to create H mirror
    @gap: (Number) distance to translate past the width of the pathSet
Returns (String) transformation
*/
function getGlideH(pathSet, options = {}) {
    const mirrorOffset = options.mirrorOffset || 0;
    const gap = options.gap || 0;

    let bbox = pathSet.getBBox();
    let mirrorX = bbox.x;  // could be either x or x2
    let mirrorY = bbox.y2;

    let transformString = "";
    // add mirror portion
    transformString += ("S1,-1," + String(mirrorX) + "," + String(mirrorY - mirrorOffset));
    // add translation
    transformString += getTranslationH(pathSet, gap);
    return transformString;
}

/*
Returns transformation string for order-2 rotation that extends pathSet
in the horizontal direction.
@pathSet: (Paper.path | Paper.set) to construct transformation from
@options: Dict of optional items:

Returns (String) transformation
*/
function getOrder2RotationH(pathSet, options) {
    options = options || {};

    let bbox = pathSet.getBBox();

    let rotationOffsetX = options.rotationOffsetX || 0;
    let rotationOffsetY = options.rotationOffsetY || 0;
    let transformString = "R180," + String(bbox.x2 - rotationOffsetX) + "," + String(bbox.y2 - rotationOffsetY);

    return transformString;
}


/*
Constructor for horizontal mirror transformation string.
By default the mirror is on the bottom of the shape,
not through the center.  

@pathSet: (Paper.path | Paper.set) to construct transformation from
@options:
    {boolean} centeredMirror - defaults to false.
Returns (String) transformation
*/
function getMirrorH(pathSet, options = {}) {
    let centered = !!options.centeredMirror;

    let bbox = pathSet.getBBox();

    let mirrorX = bbox.x;  // could be either x or x2
    let mirrorY = centered ? (bbox.y1 + (1/2)*bbox.height) : bbox.y2;

    return "S1,-1," + String(mirrorX) + "," + String(mirrorY);
}

/*
Constructor for vertical mirror transform string.
By default the mirror is on the side of the shape,
not through the center. 

@pathSet: (Paper.path | Paper.set) to construct transformation from
@options:
    {boolean} centeredMirror - defaults to false.
Returns (String) transform
*/
function getMirrorV(pathSet, options = {}) {
    let centered = !!options.centeredMirror;
    let bbox = pathSet.getBBox();

    let mirrorY = bbox.y; // same as either y or y2
    let mirrorX = centered ? (bbox.x1 + (1/2)*bbox.width) : bbox.x2;

    return "S-1,1," + String(mirrorX) + "," + String(mirrorY);
}

/*
Constructor for horizontal translation transform string
@pathSet: (Paper.path | Paper.set) to construct transformation from
@gap: [optional] (Int) integer value to separate translated objects by
Returns (String) transform
*/
function getTranslationH(pathSet, gap) {
    // TODO: generalize for translations in arbitrary directions?
    let bbox = pathSet.getBBox();
    let transformX = bbox.width + (gap || 0);
    return "T" + String(transformX) + ",0"; // must use uppercase T
}

/*
Translates fundamental domain across paper
@paper: Raphael object to draw on
@translateObject: fundamental domain to translate
@options: Dict of optional items:
    @gap: (Number) gap to leave between copies of translated fundamental regions
    @animate: (Boolean)
    @callback: (Function) called with final paperSet of translations when done translating
    @contain: (Boolean) Whether to stop drawing pattern before boundary of container hit
    @maxTranslations (Number) Upper bound on the number of translations
*/
function recursiveTranslateH(paper, translateObject, options) {
    // Always get the last item, clone it, and translate it
    // Add translations to new set: translationSet =: [paperSet]
    let animateMs = (!!options.animate) ? 500 : 0;
    let gap = options.gap || 0;
    let callback = options.callback || function() {};

    let translateSet = paper.set().push(translateObject);
    let transformString = "..." + getTranslationH(translateObject, gap);

    let width = paper.getSize().width;
    let objectWidth = translateObject.getBBox().width;
    // Allow the option to avoid drawing past the boundary of the containing div:
    // If contained is true, stop drawing before hit boundary of the containing div
    let contain = options.contain || false;
    let maxDrawWidth = contain ? (width - objectWidth) : width;
    // Allow there be an upper bound on the number of translations
    let maxTranslations = options.maxTranslations || Number.MAX_SAFE_INTEGER;

    function drawNext(i, translateSet) {
        if (translateSet.getBBox().x2 > maxDrawWidth || i >= maxTranslations)
            return callback(translateSet);

        let lastItem = translateSet[translateSet.length - 1];
        let nextItem = lastItem.clone();
        nextItem.animate({transform: transformString}, animateMs);
        setTimeout(function() { 
            drawNext(i + 1, translateSet.push(nextItem));
        }, animateMs);
    }
    drawNext(0, translateSet);
}
