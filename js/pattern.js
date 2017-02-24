/*


Plan:
Pattern(paper, path, [generatorFunction, generatorFunction,...])

*/
'use strict';

var DEFAULT_STROKE_COLOR = 'black'; // 'darkmagenta';
var DEFAULT_STROKE_WIDTH = 2;

class FriezePattern {

	constructor(paper, fundamentalDomainStringFactory, generatorGetters, options) {
		this.paper = paper;
		this.paperSet = this.paper.set();
		this.fundamentalDomainStringFactory = fundamentalDomainStringFactory;
		this.generatorGetters = generatorGetters;

		// handle options
		options = options || {};
		this.id = options.id || 'anonymous';
		// add styling options
		this.stroke = options.stroke || DEFAULT_STROKE_COLOR;
		this.strokeWidth = options.strokeWidth || DEFAULT_STROKE_WIDTH;

		this.draw();
	}


	paperSetItemMouseOver() {
		// 'this' is the element which the event is being called on
		this.attr({opacity: 0.5});
	}
	paperSetItemMouseUp(index) {
		// 'this' should be bound to FreizePattern object
        // remove element and all items after
        var itemsAfter = this.paperSet.items.splice(index, this.paperSet.items.length);
        itemsAfter.forEach(function(itemAfter) {
            itemAfter.remove();
        });
        // create a *NEW* paper Set with the items left
        var newPaperSet = this.paper.set();
        this.paperSet.items.forEach(function(item) {
        	newPaperSet.push(item);
        });
        this.paperSet = newPaperSet;
        // redraw the removed items
        console.log('this.redraw 0 with:', this.id);
        this.redraw();
	}

	/*
	Make paperSet 'clickable'
	*/
	addPaperSetHandlers() {
		var self = this;
		self.paperSet.attr({ 'cursor': 'pointer'});
        self.paperSet.forEach(function(elt, index) {
			var mouseUpHandler = self.paperSetItemMouseUp.bind(self, index);
            elt.mouseover(self.paperSetItemMouseOver);
            elt.mouseout(function() { elt.attr({opacity: 1}); });
            elt.mouseup(mouseUpHandler);
        });
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
        console.log('this.redraw 1 with this.id:', this.id);
    	// while redrawing, remove the opacity attribute and 'clickable-ness'
		this.removePaperSetHandlers();
		var offsetX = ((this.paperSet.getBBox().x2) > 0) ? this.paperSet.getBBox().x2 : 0;
		this.draw(offsetX);
	}

	// draws itself starting at offsetX (default=0)
	draw(offsetX) {
		var self = this;
		offsetX = offsetX || 0;
		
		// draw the pattern starting at offsetX:
		// copy the fundamentalDomain
		// transform it to live at spot
		var basePathString = this.fundamentalDomainStringFactory(0);

		var basePath = this.paper.path(basePathString);
		// translate it to the xOffset (so that shape doesn't get mangled)
		var transformString = "T" + String(offsetX) + ",0";
		basePath.transform(transformString);

		// apply styling attributes
		basePath.attr({
			'stroke': self.stroke,
			'stroke-width': self.strokeWidth,
		});

		// copy the path
		// transform it to be at offsetX
		// apply generators to get the Set to translate
		// Translate until at end of page
		var _drawCallback = function(paperSet) {
			paperSet.forEach(function(elt, index) {
				self.paperSet.push(elt);
			});
			self.addPaperSetHandlers();
		}
		this.applyGenerators(basePath, {
			animate: true,
			callback: _drawCallback,
		});
	}

	applyGenerators(basePath, options) {
		// apply the generators and then translateH...
		// TODO: shuffle the generatorGetters?
		var self = this;
        var animateMs = (!!options.animate) ? 1000 : 0;
        var callback = options.callback || function() {};
        var workingSet = this.paper.set().push(basePath);


        function transformNext(i) {
            if (i >= self.generatorGetters.length) {
                return recursiveTranslateH(self.paper, workingSet, options);
            }
            var transformGetter = self.generatorGetters[i];
            var transformString = "..." + transformGetter(workingSet);
            var clonedSet = workingSet.clone();
            var animateCallback = function() {
                workingSet = self.paper.set().push(workingSet).push(clonedSet);
                transformNext(i + 1);
            }
            clonedSet.animate({transform: transformString}, animateMs, "<", animateCallback);
        }
        transformNext(0);
	}
}


class P1 extends FriezePattern {
	// TODO


	constructor(paper, fundamentalDomainPath) {
		let generatorFunctions = [Translation];
		super(paper, fundamentalDomainPath, generatorFunctions);

		this.name = 'P1';
	}

}


