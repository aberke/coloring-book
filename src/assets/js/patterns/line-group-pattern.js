/*
TODO: Use chaining of promises instead of these ugly callbacks.
*/

const DEFAULT_FILL = 'white';
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
    @param {array} generatorGetters: List of functions that transform the fundamental domain
    @param {object} options
    */
    constructor(paper, fundamentalDomainPath, generatorGetters, options) {
        
        if (this.constructor === LineGroupPattern) {
            throw new TypeError('Abstract class "LineGroupPattern" cannot be instantiated directly.'); 
        }

        this.paper = paper;
        this.paperSet = this.paper.set();
        this.fundamentalDomainPath = fundamentalDomainPath;
        this.generatorGetters = generatorGetters;

        // handle options
        this.options = options || {};
        this.id = options.id || 'anonymous';
        // add styling options
        this.fill = options.fill || DEFAULT_FILL;
        this.stroke = options.stroke || DEFAULT_STROKE_COLOR;
        this.strokeWidth = options.strokeWidth || DEFAULT_STROKE_WIDTH;

        // The animation for the first transforms is intentionally slower than
        // the ending recursive transforms in order to better illustrate what is happening.
        this.beginAnimateMs = (!DISABLE_ANIMATIONS) ? 1000 : 0;
        this.endAnimateMs = (!DISABLE_ANIMATIONS) ? 500 : 0;

        this.draw();
    }

    /*
    Make paperSet 'clickable'
    */
    addFill() {
        // always adding fill, even when none specified -- using white
        // this is so that handlers are not just on the lines, but also the space within
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
        let contain = this.options.contain || false;
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
        let contain = this.options.contain || false;
        // Need some buffer room in the containing bounds because these dimensions are not precise
        // and without buffer pattern will stop prematurely.
        let containerBuffer = 5;
        let maxDrawHeight = containerBuffer + (contain ? (height - objectHeight) : height);
        return (transformSet.getBBox().y2 > maxDrawHeight);
    }

    transformX(workingSet, callback) {
        let terminateCheck = this.stopTransformX.bind(this);
        return this.transformAlongAxis(0, workingSet, this.generatorGetters.X, terminateCheck, callback);
    }
    transformY(workingSet, callback) {
        let terminateCheck = this.stopTransformY.bind(this);
        return this.transformAlongAxis(0, workingSet, this.generatorGetters.Y, terminateCheck, callback);
    }
    transformAlongAxis(i, workingSet, transformGetters, terminateCheck, terminateCallback) {
        let transformGetter = transformGetters[i];

        // Base case: applied all generators, repeat last one.
        if (i >= transformGetters.length - 1)
            return this.recursiveTransform(transformGetter, workingSet, terminateCheck, terminateCallback);
        
        let transformString = "..." + transformGetter(workingSet, this.options);
        let clonedSet = workingSet.clone();
        let animateCallback = (function() {
            workingSet = this.paper.set().push(workingSet).push(clonedSet);
            this.transformAlongAxis(i + 1, workingSet, transformGetters, terminateCheck, terminateCallback);
        }).bind(this);
        clonedSet.animate({transform: transformString}, this.beginAnimateMs, "<", animateCallback);
    }

    /*
    Transforms fundamental domain across paper
    @transformGetter: function to get transformation for the transformObject
    @transormObject: fundamental domain to transform
    @terminateCheck: function that returns boolean indicating whether to terminate recursion
    @terminateCallback: function called with final paperSet of translations when done transforming - i.e. termination/base case met
    */
    recursiveTransform(transformGetter, transformObject, terminateCheck, terminateCallback) {
        // Always get the last item, clone it, and translate it
        // Add translations to new set: translationSet =: [paperSet]
        let self = this;
        let transformSet = this.paper.set().push(transformObject);

        function drawNext(i, transformSet) {
            if (terminateCheck(transformSet))
                return terminateCallback(transformSet);

            let lastItem = transformSet[transformSet.length - 1];
            let nextItem = lastItem.clone();
            let transformString = "..." + transformGetter(nextItem, self.options);

            let animateCallback = function() {
                drawNext(i + 1, transformSet.push(nextItem));
            };
            nextItem.animate({transform: transformString}, self.endAnimateMs, "<", animateCallback);
        }
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

    /* Abstract class method */
    draw() {
        throw new Error('Not implemented');
    }
}


class FriezePattern extends LineGroupPattern {

    constructor(paper, fundamentalDomainPath, generatorGetters, options) {
        generatorGetters = { X: generatorGetters };
        super(paper, fundamentalDomainPath, generatorGetters, options);
    }

    redraw() {
        // while redrawing, remove the opacity attribute and 'clickable-ness'
        this.removePaperSetHandlers();
        let bBox = this.paperSet.getBBox();
        let offsetX = (bBox.x2 > 0) ? bBox.x2 : 0;
        this.draw(offsetX);
        analytics.trackRedraw('FriezePattern');
    }

    draw(offsetX=0) {
        // draw the pattern starting at offsetX:
        // copy the fundamentalDomain
        // transform it to live at spot
        let basePath = this.paper.path(this.fundamentalDomainPath);

        // translate it to the xOffset so that is where newly added fundamental domain begins.
        // (relevent for redrawing)
        basePath.transform([
            "...T",
            String(offsetX),
            ",0"
        ].join());

        // apply styling attributes
        basePath.attr({
            'stroke': this.stroke,
            'stroke-width': this.strokeWidth,
        });

        // Apply the generators in order and recursively repeat the last one.
        // Add color + interactions afterwards.
        let workingSet = this.paper.set().push(basePath);
        this.transformX(workingSet, this.drawCallback.bind(this));
    }
}

class WallpaperPattern extends LineGroupPattern {

    redraw() {
        // while redrawing, remove the opacity attribute and 'clickable-ness'
        this.removePaperSetHandlers();
        let bBox = this.paperSet.getBBox();
        let offsetX = (bBox.x2 > 0) ? bBox.x2 : 0;
        let offsetY = (bBox.y2 > 0) ? bBox.y2 : 0;
        this.draw(offsetX, offsetY);
        analytics.trackRedraw('WallpaperPattern');
    }

    draw(offsetX=0, offsetY=0) {
        // draw the pattern starting at x,y coordinate that suits offsetX, offsetY:
        // copy the fundamentalDomain
        // transform it to live at spot
        let basePath = this.paper.path(this.fundamentalDomainPath);
        let maxWidth = this.maxTransformWidth(basePath);
        let transformString = [
            "...T",
            String((offsetX > maxWidth) ? 0 : offsetX),
            ",",
            String(offsetY)
        ].join();
        basePath.transform(transformString);

        // apply styling attributes
        basePath.attr({
            "stroke": this.stroke,
            "stroke-width": this.strokeWidth,
        });

        // Apply the generators in order and recursively repeat the last one
        let workingSet = this.paper.set().push(basePath);
        // TODO: use promise?
        let transformYCallback = this.drawCallback.bind(this);
        let transformXCallback = (function(workingSet) {
            this.transformY(workingSet, transformYCallback);
        }).bind(this);
        this.transformX(workingSet, transformXCallback);
    }
}
