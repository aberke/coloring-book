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


    The fundamentalDomainPath outlines the underlying grid of the pattern.  It is transformed,
    but remains invisible.
    The patternDesignPath is what is seen.  It lies on top of the fundamentalDomainPath and
    copies each of the transformations of the fundamentalDomainPath.

    */
    constructor(paper, fundamentalDomainPath, patternDesignPath, transforms, transformOptions={}, drawOptions={}) {
        
        if (this.constructor === LineGroupPattern) {
            throw new TypeError('Abstract class "LineGroupPattern" cannot be instantiated directly.'); 
        }

        this.paper = paper;
        
        this.fundamentalDomainPath = fundamentalDomainPath;
        this.patternDesignPath = patternDesignPath;

        this.paperSet = this.paper.set();
        this.fdPathSet = this.paper.set(); // Path set for the fundamental domain.
        this.pdPathSet = this.paper.set(); // Path set for the pattern design.

        this.transforms = transforms;
        // handle options
        this.transformOptions = transformOptions;
        this.drawOptions = drawOptions;
        this.id = drawOptions.id || 'anonymous';
        // add styling options
        this.fill = drawOptions.fill || DEFAULT_FILL;
        this.strokeWidth = drawOptions.strokeWidth || DEFAULT_STROKE_WIDTH;

        this.animateMs = (!DISABLE_ANIMATIONS) ? 700 : 0;

        this.draw();
    }

    addPathSetStyle(fdPathSet, pdPathSet) {
        fdPathSet.attr({ "stroke": "transparent" });
        if (!!DEBUG)
            fdPathSet.attr({
                "stroke": "gray",
                "stroke-width": this.strokeWidth
            });
        
        pdPathSet.attr({
            "stroke": DEFAULT_STROKE_COLOR,
            "stroke-width": this.strokeWidth,
            // Make paperSet 'clickable' by filling it in.
            "fill": 'transparent',
        });
    }

    paperSetItemMouseOver() {
        this.attr({stroke: 'gray'}); // 'this' is path element.
    }
    paperSetMouseOut() {
        this.attr({stroke: DEFAULT_STROKE_COLOR}); // 'this' is path element.
    }

    paperSetItemMouseUp(index) {
        // Remove mouse-up element and all items after index.
        let fdItemsAfter = this.fdPathSet.items.splice(index, this.fdPathSet.items.length);
        fdItemsAfter.forEach((itemAfter) => itemAfter.remove());
        let pdItemsAfter = this.pdPathSet.items.splice(index, this.pdPathSet.items.length);
        pdItemsAfter.forEach((itemAfter) => itemAfter.remove());
        // Create *NEW* paper Set with the items left.
        let newFdPathSet = this.paper.set();
        let newPdPathSet = this.paper.set();
        this.fdPathSet.items.forEach((item) => newFdPathSet.push(item));
        this.pdPathSet.items.forEach((item) => newPdPathSet.push(item));
        this.fdPathSet = newFdPathSet;
        this.pdPathSet = newPdPathSet;
        // Redraw the removed items.
        this.redraw();
    }

    /*
    Handlers are added to the pattern design path set.
    */
    addPaperSetHandlers() {
        this.pdPathSet.forEach((elt, index) => {
            let mouseUpHandler = this.paperSetItemMouseUp.bind(this, index);
            elt.mouseover(this.paperSetItemMouseOver);
            elt.mouseout(this.paperSetMouseOut);
            elt.mouseup(mouseUpHandler);
        });
        this.pdPathSet.attr({ 'cursor': 'pointer' });
    }

    /*
    Make paperSet 'UN-clickable' -- important for redrawing
    */
    removePaperSetHandlers() {
        this.pdPathSet.attr({ 'cursor': 'default' });
        this.pdPathSet.forEach((elt) => {
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
    transformFundamentalDomain(fdPathSet, pdPathSet, callback) {
        let fdTransforms = this.transforms.FundamentalDomain || [];
        let transformOptions = this.transformOptions.FundamentalDomain;
        let animateOptions = {animateMs: this.animateMs};

        let transformNext = function(i, fdPathSet, pdPathSet) {
            if (i == fdTransforms.length)
                return callback(fdPathSet, pdPathSet);

            // The returned transformed path set is a transformed clone of the
            // original pathSet. 
            let transform = fdTransforms[i];
            let options = (transformOptions && transformOptions.length > i) ? transformOptions[i] : {};
            options = Object.assign(options, animateOptions);
            let transformCallback = function(transformedFdPathSet, transformedPdPathSet) {
                // keep the path set flat - i.e. avoid sets within sets.
                let flatTransformedFdPathSet = util.flattenedList(transformedFdPathSet);
                let flatTransformedPdPathSet = util.flattenedList(transformedPdPathSet);
                flatTransformedFdPathSet.forEach((elt) => { fdPathSet.push(elt); });
                flatTransformedPdPathSet.forEach((elt) => { pdPathSet.push(elt); });
                transformNext(i + 1, fdPathSet, pdPathSet);
            };
            let fdPathSetClone = fdPathSet.clone();
            let pdPathSetClone = pdPathSet.clone();
            transform(fdPathSetClone, pdPathSetClone, transformCallback, options);
        };
        transformNext(0, fdPathSet, pdPathSet);
    }

    transformX(fdPathSet, pdPathSet, callback) {
        let terminateCheck = this.stopTransformX.bind(this);
        let transforms = this.transforms.X;
        let transformOptions = Object.assign(this.transformOptions.X || {}, {animateMs: this.animateMs});
        return this.transformAlongAxis(fdPathSet, pdPathSet, transforms, transformOptions, terminateCheck, callback);
    }
    // transformY(workingSet, callback) {
    transformY(fdPathSet, pdPathSet, callback) {
        let terminateCheck = this.stopTransformY.bind(this);
        let transforms = this.transforms.Y;
        let transformOptions = Object.assign(this.transformOptions.Y || {}, {animateMs: this.animateMs});
        return this.transformAlongAxis(fdPathSet, pdPathSet, transforms, transformOptions, terminateCheck, callback);
    }
    /*
    Transforms path set across paper
    @workingSet: set of paths to transform
    @transform: function to get transformation for the path set
    @options: object of options for transform function
    @terminateCheck: function that returns boolean indicating whether to terminate recursion
    @terminateCallback: function called with final path set when done transforming - i.e. terminationCheck/base case met
    */
    // transformAlongAxis(workingSet, transform, options, terminateCheck, terminateCallback) {
    transformAlongAxis(fdPathSet, pdPathSet, transform, options, terminateCheck, terminateCallback) {
        // Iteratively get the last item, clone it, and tranform it
        let transformFdSet = this.paper.set().push(fdPathSet);
        let transformPdSet = this.paper.set().push(pdPathSet);
        let drawNext = function(i, transformFdSet, transformPdSet) {
            if (terminateCheck(transformFdSet))
                return terminateCallback(transformFdSet, transformPdSet);

            let lastFdItem = transformFdSet[transformFdSet.length - 1];
            let lastPdItem = transformPdSet[transformPdSet.length - 1];
            let nextFdItem = lastFdItem.clone();
            let nextPdItem = lastPdItem.clone();
            let transformCallback = function() {
                drawNext(i + 1, transformFdSet.push(nextFdItem), transformPdSet.push(nextPdItem));
            };
            transform(nextFdItem, nextPdItem, transformCallback, options);
        };
        drawNext(0, transformFdSet, transformPdSet);
    }

    drawCallback(fdPathSet, pdPathSet) {
        // needed for both adding color & interactive behavior
        fdPathSet.forEach(elt => this.fdPathSet.push(elt) );
        pdPathSet.forEach(elt => this.pdPathSet.push(elt) );
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
        let baseFdPath = this.paper.path(this.fundamentalDomainPath);
        let basePdPath = this.paper.path(this.patternDesignPath);
        this.maxWidth = this.maxTransformWidth(baseFdPath);
        let transformString = [
            "T",
            String((offsetX > this.maxWidth) ? 0 : offsetX),
            ",",
            String(offsetY)
        ].join();
        baseFdPath.transform(transformString);
        basePdPath.transform(transformString);
        let fdSet = this.paper.set().push(baseFdPath);
        let pdSet = this.paper.set().push(basePdPath);

        // Apply styling attributes to make paths visible.
        this.addPathSetStyle(fdSet, pdSet);

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
            transformXCallback = (function(fdSet, pdSet) { this.transformY(fdSet, pdSet, finalCallback); }).bind(this);
        
        let transformFDCallback = (function(fdSet, pdSet) {
            this.transformX(fdSet, pdSet, transformXCallback);
        }).bind(this);
        // Apply the transforms.
        // Add color + interactions afterwards.
        this.transformFundamentalDomain(fdSet, pdSet, transformFDCallback);
    }
}


class FriezePattern extends LineGroupPattern {

    redraw() {
        // TODO
        // While redrawing, remove the opacity attribute and 'clickable-ness'.
        this.removePaperSetHandlers();
        let bbox = this.fdPathSet.getBBox();
        let offsetX = (bbox.x2 > 0) ? bbox.x2 : 0;
        this.draw(offsetX);
        analytics.trackRedraw('FriezePattern');
    }
}

class WallpaperPattern extends LineGroupPattern {

    redraw() {
        // While redrawing, remove the opacity attribute and 'clickable-ness'.
        this.removePaperSetHandlers();
        // Compute offsets.
        let bbox = this.fdPathSet.getBBox();
        let offsetX = (bbox.x2 > 0) ? bbox.x2 : 0;
        let offsetY = (bbox.y2 > 0) ? bbox.y2 : 0;

        // TODO: Fix how doing transforms -- this is a hack
        // If this was a lower row of the transform, take upper row and
        // use transformY.
        if (!!this.fdPathSet.length && (offsetX > this.maxWidth))
            this.transformY(this.fdPathSet.pop(), this.pdPathSet.pop(), this.drawCallback.bind(this));
        else
            this.draw(offsetX, offsetY); // TODO: Remove use of offsetY if not using with above hack
        
        analytics.trackRedraw('WallpaperPattern');
    }
}
