/*

*/

const DEFAULT_STROKE_COLOR = 'black';
const DEFAULT_STROKE_WIDTH = 2;


class FriezePattern {

    /**
    @param {object} paper on which to draw
    @param {array|string} fundamentalDomainPath
    @param {array} generatorGetters: List of functions that transform the fundamental domain
    @param {object} options
    */
    constructor(paper, fundamentalDomainPath, generatorGetters, options) {
        this.paper = paper;
        this.paperSet = this.paper.set();
        this.fundamentalDomainPath = fundamentalDomainPath;
        this.generatorGetters = generatorGetters;

        // handle options
        this.options = options || {};
        this.id = options.id || 'anonymous';
        this.maxIterationsH = this.options.maxIterationsH;
        // add styling options
        this.stroke = options.stroke || DEFAULT_STROKE_COLOR;
        this.strokeWidth = options.strokeWidth || DEFAULT_STROKE_WIDTH;
        this.fill = options.fill || 'white';

        this.draw();
    }


    paperSetItemMouseOver() {
        // 'this' is the element which the event is being called on
        this.attr({opacity: 0.5});
    }
    paperSetItemMouseUp(index) {
        // 'this' should be bound to FreizePattern object
        // remove element and all items after
        let itemsAfter = this.paperSet.items.splice(index, this.paperSet.items.length);
        itemsAfter.forEach(function(itemAfter) {
            itemAfter.remove();
        });
        // create a *NEW* paper Set with the items left
        let newPaperSet = this.paper.set();
        this.paperSet.items.forEach(function(item) {
            newPaperSet.push(item);
        });
        this.paperSet = newPaperSet;
        // redraw the removed items
        this.redraw();
    }

    /*
    Make paperSet 'clickable'
    */

    addFill() {
        // always adding fill, even when none specified -- using white
        // this is so that handlers are not just on the lines, but also the space within
        this.paperSet.attr({ 'fill': this.fill });
    }

    addPaperSetHandlers() {
        let self = this;

        self.paperSet.forEach(function(elt, index) {
            let mouseUpHandler = self.paperSetItemMouseUp.bind(self, index);
            elt.mouseover(self.paperSetItemMouseOver);
            elt.mouseout(function() { elt.attr({opacity: 1}); });
            elt.mouseup(mouseUpHandler);
        });

        self.paperSet.attr({ 'cursor': 'pointer' });
    }

    /*
    Make paperSet 'UN-clickable' -- important for redrawing
    */
    removePaperSetHandlers() {
        this.paperSet.attr({ 'cursor': 'default' });
        this.paperSet.forEach(function(elt, index) {
            elt.unmouseover();
            elt.unmouseout();
            elt.unmouseup();
        });
    }

    redraw() {
        // while redrawing, remove the opacity attribute and 'clickable-ness'
        this.removePaperSetHandlers();
        let offsetX = ((this.paperSet.getBBox().x2) > 0) ? this.paperSet.getBBox().x2 : 0;
        this.draw(offsetX);
        trackRedraw('FriezePattern');
    }

    // draws itself starting at offsetX (default=0)
    draw(offsetX) {
        offsetX = offsetX || 0;
        
        // draw the pattern starting at offsetX:
        // copy the fundamentalDomain
        // transform it to live at spot
        let basePath = this.paper.path(this.fundamentalDomainPath);

        // translate it to the xOffset (so that shape doesn't get mangled)
        let transformString = "...T" + String(offsetX) + ",0";
        basePath.transform(transformString);

        // apply styling attributes
        basePath.attr({
            'stroke': this.stroke,
            'stroke-width': this.strokeWidth,
        });

        // The following callback gets passed along alot -- create self to refer to within it
        let pattenSelf = this;
        // copy the path
        // transform it to be at offsetX
        // apply generators to get the Set to translate
        // Translate until at end of page
        // add color + interactions
        let _drawCallback = function(paperSet) {
            // needed for both adding color & interactive behavior
            paperSet.forEach(function(elt, index) {
                pattenSelf.paperSet.push(elt);
            });
            // add coloring/fill
            pattenSelf.addFill();
            // add interactive behavior
            if (!DISABLE_ANIMATIONS)
                pattenSelf.addPaperSetHandlers();
        };
        this.applyGenerators(basePath, {
            animate: (!DISABLE_ANIMATIONS),
            callback: _drawCallback,
            maxTranslations: this.options.maxTranslations
        });
    }

    applyGenerators(basePath, options) {
        // apply the generators and then translateH...
        // TODO: shuffle the generatorGetters?
        let self = this;
        let animateMs = (!!options.animate) ? 1000 : 0;
        let workingSet = this.paper.set().push(basePath);

        function transformNext(i) {
            if (i >= self.generatorGetters.length)
                return recursiveTranslateH(self.paper, workingSet, options);

            let transformGetter = self.generatorGetters[i];
            let transformString = "..." + transformGetter(workingSet, self.options);
            let clonedSet = workingSet.clone();
            let animateCallback = function() {
                workingSet = self.paper.set().push(workingSet).push(clonedSet);
                transformNext(i + 1);
            };
            clonedSet.animate({transform: transformString}, animateMs, "<", animateCallback);
        }
        transformNext(0);
    }
}
