/*
TODO: Use chaining of promises instead of these ugly callbacks.
*/

const DEFAULT_FILL = 'transparent';
const DEFAULT_STROKE_COLOR = 'black';
const DEFAULT_STROKE_WIDTH = 2;


/*
LineGroupPattern is an abstract class for FriezePattern and WallpaperPattern
to inherit from and implement.
*/
class LineGroupPattern {
    /**
    @param {object} paper on which to draw
    @param {array|string} fundamentalDomainPath
    @param {object} transforms
        Map of functions that transform the fundamental domain for a central set,
        and along the X and Y axes:
        {
            FundamentalDomain: (optional) [list of (function) transforms]
            X: (function) transform
            Y: (optional) (function) transform
        }
    @param (optional) {object} transformOptions
        Map of functions that transform the fundamental domain for a central set,
        and along the X and Y axes:
        {
            FundamentalDomain: [list of {options} objects for each FundamentalDomain transform]
            X: {options} object for X transform
            Y: {options} object for Y transform
        }
    @param (optional) {object} drawOptions
    */
    constructor(paper, fundamentalDomainPath, transforms, transformOptions={}, drawOptions={}) {
        
        if (this.constructor === LineGroupPattern) {
            throw new TypeError('Abstract class "LineGroupPattern" cannot be instantiated directly.'); 
        }

        this.paper = paper;
        this.paperSet = this.paper.set();
        this.fundamentalDomainPath = fundamentalDomainPath;
        this.transforms = transforms;

        // handle options
        this.transformOptions = transformOptions;
        this.drawOptions = drawOptions;
        this.id = drawOptions.id || 'anonymous';
        // add styling options
        this.fill = drawOptions.fill || DEFAULT_FILL;
        this.stroke = drawOptions.stroke || DEFAULT_STROKE_COLOR;
        this.strokeWidth = drawOptions.strokeWidth || DEFAULT_STROKE_WIDTH;

        this.animateMs = (!DISABLE_ANIMATIONS) ? 700 : 0;

        this.draw();
    }

    /*
    Make paperSet 'clickable'
    */
    addFill() {
        // Always adding fill, even when none specified -- using 'transparent'.
        // This way handlers are not just on the lines, but also the space within.
        this.paperSet.attr({ 'fill': this.fill });
    }


    paperSetItemMouseOver() {
        // 'this' is the element which the event is being called on
        this.attr({opacity: 0.5});
    }
    paperSetItemMouseUp(index) {
        // remove element and all items after index
        let itemsAfter = this.paperSet.items.splice(index, this.paperSet.items.length);
        itemsAfter.forEach((itemAfter) => itemAfter.remove());
        // create a *NEW* paper Set with the items left
        let newPaperSet = this.paper.set();
        this.paperSet.items.forEach((item) => newPaperSet.push(item));
        this.paperSet = newPaperSet;
        // redraw the removed items
        this.redraw();
    }

    addPaperSetHandlers() {
        this.paperSet.forEach((elt, index) => {
            let mouseUpHandler = this.paperSetItemMouseUp.bind(this, index);
            elt.mouseover(this.paperSetItemMouseOver);
            elt.mouseout(function() { elt.attr({opacity: 1}); });
            elt.mouseup(mouseUpHandler);
        });
        this.paperSet.attr({ 'cursor': 'pointer' });
    }

    /*
    Make paperSet 'UN-clickable' -- important for redrawing
    */
    removePaperSetHandlers() {
        this.paperSet.attr({ 'cursor': 'default' });
        this.paperSet.forEach((elt, index) => {
            elt.unmouseover();
            elt.unmouseout();
            elt.unmouseup();
        });
    }

    maxTransformWidth(transformObject) {
        let objectWidth = transformObject.getBBox().width;
        let width = this.paper.getSize().width;

        // Allow the option to avoid drawing past the boundary of the containing div:
        // If contained is true, stop drawing before hit boundary of the containing div
        let contain = this.drawOptions.contain || false;
        // Need buffer room in the containing bounds because these dimensions are not precise
        // and without buffer pattern will stop prematurely.
        let containerBuffer = 5;
        return containerBuffer + (contain ? (width - objectWidth) : width);
    }

    /*
    Returns boolean: whether pattern has reached containing bounds
    in the X direction.
    */
    stopTransformX(transformSet) {
        if (transformSet.length < 1)
            return false;

        let transformObject = transformSet[transformSet.length - 1];
        let maxWidth = this.maxTransformWidth(transformObject);

        return (transformSet.getBBox().x2 > maxWidth);
    }

    /*
    Returns boolean: whether pattern has reached containing bounds
    in the Y direction.
    */
    stopTransformY(transformSet) {
        if (transformSet.length < 1)
            return false;

        let transformObject = transformSet[transformSet.length - 1];
        let objectHeight = transformObject.getBBox().height;
        let height = this.paper.getSize().height;

        // Allow the option to avoid drawing past the boundary of the containing div:
        // If contained is true, stop drawing before hit boundary of the containing div
        let contain = this.drawOptions.contain || false;
        // Need some buffer room in the containing bounds because these dimensions are not precise
        // and without buffer pattern will stop prematurely.
        let containerBuffer = 5;
        let maxDrawHeight = containerBuffer + (contain ? (height - objectHeight) : height);
        return (transformSet.getBBox().y2 > maxDrawHeight);
    }

    /*
    The transformations of the fundamental domain is maintained as a FLAT path set.
    This function iteratively appends paths to the path set.  For each fundamental domain
    transform function, it takes the current working path set and passes it to
    the transform function with returns a transformed clone of the original path set.
    Each of the paths in that transformed path set are appended to the original path set.

    E.g. For transforms.FundamentalDomain: [t1, t2]
    Working pathSet:  [{fd=fundamentalDomain}]
                      [{fd=fundamentalDomain}, {t1(fd)}]
                      [{fd=fundamentalDomain}, {t1(fd)}, {t2(fd)}, {t2(t1(fd))}]
    */
    transformFundamentalDomain(pathSet, callback) {
        let fdTransforms = this.transforms.FundamentalDomain || [];
        let transformOptions = this.transformOptions.FundamentalDomain;
        let animateOptions = {animateMs: this.animateMs};

        let transformNext = function(i, pathSet) {
            if (i == fdTransforms.length)
                return callback(pathSet);

            // The returned transformed path set is a transformed clone of the
            // original pathSet. 
            let transform = fdTransforms[i];
            let options = (transformOptions.length > i) ? transformOptions[i] : {};
            options = Object.assign(options, animateOptions);
            let transformCallback = function(transformedPathSet) {
                // keep the path set flat - i.e. avoid sets within sets.
                let flatTransformedPathSet = util.flattenedList(transformedPathSet);
                flatTransformedPathSet.forEach((elt) => { pathSet.push(elt); });
                transformNext(i + 1, pathSet);
            };
            let pathSetClone = pathSet.clone();
            transform(pathSetClone, transformCallback, options);
        };
        transformNext(0, pathSet);
    }

    transformX(workingSet, callback) {
        let terminateCheck = this.stopTransformX.bind(this);
        let transforms = this.transforms.X;
        let transformOptions = Object.assign(this.transformOptions.X || {}, {animateMs: this.animateMs});
        return this.transformAlongAxis(workingSet, transforms, transformOptions, terminateCheck, callback);
    }
    transformY(workingSet, callback) {
        let terminateCheck = this.stopTransformY.bind(this);
        let transforms = this.transforms.Y;
        let transformOptions = Object.assign(this.transformOptions.Y || {}, {animateMs: this.animateMs});
        return this.transformAlongAxis(workingSet, transforms, transformOptions, terminateCheck, callback);
    }
    /*
    Transforms path set across paper
    @workingSet: set of paths to transform
    @transform: function to get transformation for the path set
    @options: object of options for transform function
    @terminateCheck: function that returns boolean indicating whether to terminate recursion
    @terminateCallback: function called with final path set when done transforming - i.e. terminationCheck/base case met
    */
    transformAlongAxis(workingSet, transform, options, terminateCheck, terminateCallback) {
        // Iteratively get the last item, clone it, and tranform it
        let transformSet = this.paper.set().push(workingSet);
        let drawNext = function(i, transformSet) {
            if (terminateCheck(transformSet))
                return terminateCallback(transformSet);

            let lastItem = transformSet[transformSet.length - 1];
            let nextItem = lastItem.clone();
            let transformCallback = function() {
                drawNext(i + 1, transformSet.push(nextItem));
            };
            transform(nextItem, transformCallback, options);
        };
        drawNext(0, transformSet);
    }

    drawCallback(paperSet) {
        // needed for both adding color & interactive behavior
        paperSet.forEach(elt => this.paperSet.push(elt) );
        // add coloring/fill
        this.addFill();
        // add interactive behavior
        if (!DISABLE_ANIMATIONS)
            this.addPaperSetHandlers();
    }

    /* Abstract class method */
    redraw() {
        throw new Error('Not implemented');
    }

    draw(offsetX=0, offsetY=0) {
        // (offsetY only relevant for Wallpaper pattern, not Frieze).
        // draw the pattern starting at x,y coordinate that suits offsetX, offsetY:
        // copy the fundamentalDomain
        // transform it to start at offset
        let basePath = this.paper.path(this.fundamentalDomainPath);
        this.maxWidth = this.maxTransformWidth(basePath);
        let transformString = [
            "T",
            String((offsetX > this.maxWidth) ? 0 : offsetX),
            ",",
            String(offsetY)
        ].join();
        basePath.transform(transformString);

        // apply styling attributes
        basePath.attr({
            "stroke": this.stroke,
            "stroke-width": this.strokeWidth,
        });

        let workingSet = this.paper.set().push(basePath);

        // Set up the transforms & callbacks chain. TODO: use promise?
        // Frieze function calls:
        //    transformFundamentalDomain -> transformX -> drawCallback
        // Wallpaper function calls:
        //    transformFundamentalDomain -> transformX -> transformY -> drawCallback
        let finalCallback = this.drawCallback.bind(this);
        let transformXCallback;
        if (!this.transforms.Y)
            transformXCallback = finalCallback;
        else
            transformXCallback = (function(workingSet) { this.transformY(workingSet, finalCallback); }).bind(this);
        
        let transformFDCallback = (function(workingSet) {
            this.transformX(workingSet, transformXCallback);
        }).bind(this);
        // Apply the transforms.
        // Add color + interactions afterwards.
        this.transformFundamentalDomain(workingSet, transformFDCallback);
    }
}


class FriezePattern extends LineGroupPattern {

    redraw() {
        // while redrawing, remove the opacity attribute and 'clickable-ness'
        this.removePaperSetHandlers();
        let bBox = this.paperSet.getBBox();
        let offsetX = (bBox.x2 > 0) ? bBox.x2 : 0;
        this.draw(offsetX);
        analytics.trackRedraw('FriezePattern');
    }
}

class WallpaperPattern extends LineGroupPattern {

    redraw() {
        // while redrawing, remove the opacity attribute and 'clickable-ness'
        this.removePaperSetHandlers();
        let bBox = this.paperSet.getBBox();
        let offsetX = (bBox.x2 > 0) ? bBox.x2 : 0;
        let offsetY = (bBox.y2 > 0) ? bBox.y2 : 0;

        // TODO: Fix how doing transforms -- this is a hack
        // If this was a lower row of the transform, take upper row and
        // use transformY.
        if (!!this.paperSet.length && (offsetX > this.maxWidth))
            this.transformY(this.paperSet.pop(), this.drawCallback.bind(this));
        else
            this.draw(offsetX, offsetY); // TODO: Remove use of offsetY if not using with above hack
        
        analytics.trackRedraw('WallpaperPattern');
    }
}
