/*
	Collection of helper functions


*/

var SYMMETRY_STROKE_WIDTH = 5;


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

function getFundamentalDomainPathFactory(patternFunction, origin, width, height) {
    return function() {
        return patternFunction(origin, width, height);
    }
}


/**
 * Shows the symmetrySet upon hover with styles
 * @param {set} paper.Set to apply properties to
 * @param {styles} dictionary of styles to show upon hover
**/
var addSymmetrySetProperties = function(set, styles) {
    styles = styles || {};
    styles['stroke-width'] = SYMMETRY_STROKE_WIDTH;
    set.attr(styles);

    // initially hide the symmetry set and show upon hover
    set.attr({opacity: 0});
    set.mouseover(function() { set.attr({opacity: 0.6}); });
    set.mouseout(function() { set.attr({opacity: 0}); });
}

/*
Returns (Int) centered Y coordinate of paper.
*/
function getCenteredXaxisCoord(paper) {
    var paperHeight = paper.canvas.clientHeight;
    return paperHeight/2;
}

/**
 * Draws set of Y-Axes of the same type
 * @param {Paper} paper to draw on
 * @param {number} starting X coordinate
 * @param {number} gap between axes
 * @returns {paper.Set} set of paths
**/
function drawYAxesSet(paper, startX, gap) {
    var canvasHeight = paper.canvas.clientHeight;
    var set = paper.set();
    var X = startX;
    while (X < paper.canvas.clientWidth) {
        var pathString = 'M' + String(X) + ',0 v' + String(canvasHeight);
        var path = paper.path(pathString);
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
    var canvasWidth = paper.canvas.clientWidth;
    var set = paper.set();
    var Y = startY;

    for (var i=0; i<count; i++) {
        var pathString = 'M0,' + String(Y) + ' h' + String(canvasWidth);
        var path = paper.path(pathString);
        set.push(path);
        Y += gap;
    }
    return set;
}

function drawXaxis(paper, xAxisCoord, color) {
    var paperWidth = paper.canvas.clientWidth;
    var xAxisPathString = "M0," + String(xAxisCoord) + " l" + String(paperWidth) + ",0";
    var xAxisPath = paper.path(xAxisPathString)
        .attr({
            "stroke-width": 2,
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
function getGlideH(pathSet, options) {
    options = options || {};
    mirrorOffset = options.mirrorOffset || 0;
    gap = options.gap || 0;
    var bbox = pathSet.getBBox();
    var mirrorX = bbox.x;  // could be either x or x2
    var mirrorY = bbox.y2;

    var transformString = "";
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

    var bbox = pathSet.getBBox();

    var rotationOffset = options.rotationOffset || (1/2)*bbox.height;
    var transformString = "R180," + String(bbox.x2) + "," + String(bbox.y2 - rotationOffset);

    return transformString;
}


/*
Constructor for horizontal mirror transformation string
@pathSet: (Paper.path | Paper.set) to construct transformation from
Returns (String) transformation
*/
function getMirrorH(pathSet) {
    var bbox = pathSet.getBBox();
    var mirrorX = bbox.x;  // could be either x or x2
    var mirrorY = bbox.y2;
    return "S1,-1," + String(mirrorX) + "," + String(mirrorY);
}

/*
Constructor for vertical mirror transform string
@pathSet: (Paper.path | Paper.set) to construct transformation from
Returns (String) transform
*/
function getMirrorV(pathSet) {
    var bbox = pathSet.getBBox();
    var mirrorX = bbox.x2;
    var mirrorY = bbox.y; // same as either y or y2
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
    var bbox = pathSet.getBBox();
    var transformX = bbox.width + (gap || 0);
    return "T" + String(transformX) + ",0"; // must use uppercase T
}

/*
Translates fundamental domain across paper
@paper: Raphael object to draw on
@translateObject: fundamental domain to translate
@options: Dict of optional items:
    @gap: (Int) gap to leave between copies of translated fundamental regions
    @animate: (Boolean)
    @callback: (Function) called with final paperSet of translations when done translating
*/
function recursiveTranslateH(paper, translateObject, options) {
    // always get the last item, clone it, and translate it
    // add translations to new set: translationSet =: [paperSet]
    var animateMs = !!options.animate ? 500 : 0;
    var gap = options.gap || 0;
    var callback = options.callback || function() {};
    var width = paper.canvas.clientWidth;

    var translateSet = paper.set().push(translateObject);
    var transformString = "..." + getTranslationH(translateObject, gap);

    function drawNext(translateSet) {
        if (translateSet.getBBox().x2 > width) {
            return callback(translateSet);
        }

        var lastItem = translateSet[translateSet.length - 1];
        var nextItem = lastItem.clone();
        nextItem.animate({transform: transformString}, animateMs);
        setTimeout(function() { drawNext(translateSet.push(nextItem)); }, animateMs);
    }
    drawNext(translateSet);
}
