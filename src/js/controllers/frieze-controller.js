
friezeApp.controller('friezeController', function($rootScope, $scope, $location, $routeParams, fundamentalDomainPatterns, fundamentalDomainProperties, patternsData) {

    var self = this;

	this.paper;

	// object mapping symmetryName -> Set of symmetries
	// eg, {g: paper.Set([line1, line2]), h1: paper.Set([line1, line2]), v1: paper.Set([line1, line2]), }
	this.symmetrySets = {};
	this.friezePatterns = [];

	this.patternName = $routeParams.patternName;
    this.patternData = patternsData[this.patternName];
    this.patternDescription = this.patternData['description'];

	// set PatternName on the root scope so can update <head/> title
	$rootScope.patternName = this.patternName;
	$scope.patternName = this.patternName;
	$scope.patternDescription = this.patternDescription;

    self.numPatterns = fundamentalDomainPatterns.length;

    self.fundamentalDomainWidth = fundamentalDomainProperties.width;
    self.fundamentalDomainHeight = fundamentalDomainProperties.height;

    // pixel buffer between pattern space start & fundamental domain
    self.patternBuffer = fundamentalDomainProperties.buffer;


    showSymmetrySets = function() {
    	for (var symmetrySetName in self.symmetrySets) {
    		var symmetrySet = self.symmetrySets[symmetrySetName];
    		symmetrySet.attr({opacity: 0.6});
		}
    }
    hideSymmetrySets = function() {
    	for (var symmetrySetName in self.symmetrySets) {
    		var symmetrySet = self.symmetrySets[symmetrySetName];
    		symmetrySet.attr({opacity: 0});
		}
    }

    // TODO: Move: Bad code to put this here
    addHoverDescriptionEventListeners = function() {
	    var hoverDescriptionElt = document.getElementById('hover-description');

	    hoverDescriptionElt.addEventListener('mouseover', function() {
	    	showSymmetrySets();
	    });
	    hoverDescriptionElt.addEventListener('mouseout', function() {
	    	hideSymmetrySets();
	    });

    }
    addHoverDescriptionEventListeners();

    setupPaper = function() {
        var canvasHeight = self.patternSpaceHeight*self.numPatterns;
        self.paper = new Raphael(document.getElementById('canvas'), '100%', canvasHeight);
    }

    // draws h1's
    setupH1SymmetrySet = function(h1StartY, hGap) {
        var h1Set = drawXAxesSet(self.paper, h1StartY, hGap, self.numPatterns);
        addSymmetrySetProperties(h1Set, SYMMETRY_SET_STYLES['h1']);
        self.symmetrySets['h1'] = h1Set;
    }

    drawPatterns = function() {
        var X = self.fundamentalDomainHeight + self.patternBuffer;
        for (var i=0; i<self.numPatterns; i++) {
            // draw Pattern
            var fundamentalDomainPattern = fundamentalDomainPatterns[i];
            var options = self.drawOptions || {};
            options['id'] = getPatternId(self.patternName, i);
            var fundamentalDomainStringFactory = getFundamentalDomainStringFactory(fundamentalDomainPattern, X, self.fundamentalDomainWidth, self.fundamentalDomainHeight);
            var friezePattern = new FriezePattern(self.paper, fundamentalDomainStringFactory, self.generatorGetters, options);
            self.friezePatterns.push(friezePattern);

            X += self.patternSpaceHeight;
        }
    }


    p1Handler = function() {
        self.generatorGetters = [];
        self.patternSpaceHeight = (self.fundamentalDomainHeight + self.patternBuffer);

        setupPaper();
        drawPatterns();
    }

    p11mHandler = function() {

        self.generatorGetters = [getMirrorH];

	    // multiply by 2 because there is a horizontal reflection
	    self.patternSpaceHeight = 2*(self.fundamentalDomainHeight + self.patternBuffer);

	    setupPaper();
        drawPatterns();

        // Draw symmetry sets
        var h1StartY = self.fundamentalDomainHeight + self.patternBuffer;
        var hGap = self.patternSpaceHeight;
        setupH1SymmetrySet(h1StartY, hGap);

	}

    p1m1Handler = function() {
        // 'Vertical Reflection only'
        self.generatorGetters = [getMirrorV];

        self.patternSpaceHeight = (self.fundamentalDomainHeight + self.patternBuffer);

	    setupPaper();
        drawPatterns();

        // Draw symmetry sets:
        // draw v1's & v2's
        // space v-lines by 2*width of fundamental domain
        var vGap = (2*self.fundamentalDomainWidth);
        var v1Set = drawYAxesSet(self.paper, 0, vGap);
        var v2Set = drawYAxesSet(self.paper, self.fundamentalDomainWidth, vGap);

        addSymmetrySetProperties(v1Set, SYMMETRY_SET_STYLES['v1']);
        addSymmetrySetProperties(v2Set, SYMMETRY_SET_STYLES['v2']);
        self.symmetrySets['v1'] = v1Set;
        self.symmetrySets['v2'] = v2Set;
    }

  	p1a1Handler = function() {
  		// pbpbpbpb
  		// 'Glide Reflection only'
  		self.generatorGetters = [getGlideH];

  		// create H mirror within fundamental domain
        // mirrorOffsetFraction=0 will mean normal mirror at bottom of fundamental domain
  		var mirrorHOffsetFraction = (1/4);
  		var mirrorHOffset = (mirrorHOffsetFraction)*(self.fundamentalDomainHeight + self.patternBuffer);

  		self.drawOptions = {
  			mirrorOffset: mirrorHOffset,
  			gap: 0,
  		}

  		self.patternSpaceHeight = (2 - mirrorHOffsetFraction)*(self.fundamentalDomainHeight + self.patternBuffer);

	    setupPaper();
        drawPatterns();

        // draw the symmetry set
        var glideStartY = (1 - mirrorHOffsetFraction)*(self.fundamentalDomainHeight + self.patternBuffer);
        var glideSet = drawXAxesSet(self.paper, glideStartY, self.patternSpaceHeight, self.numPatterns);

        addSymmetrySetProperties(glideSet, SYMMETRY_SET_STYLES['g']);
        self.symmetrySets['g'] = glideSet;
  	}

  	p2Handler = function() {
  		// pdpdpdpd
  		// 'Order-2 Rotations'
  		self.generatorGetters = [getOrder2RotationH];

        // rotationOffsetFraction=0 will mean normal rotation in middle of fundamental domain
  		var rotationOffsetFraction = 0; // (1/4);
  		var rotationOffset = (rotationOffsetFraction)*(self.fundamentalDomainHeight + self.patternBuffer);

  		self.drawOptions = {
  			rotationOffset: rotationOffset
  		}
  		self.patternSpaceHeight = (1 + rotationOffsetFraction)*(self.fundamentalDomainHeight + self.patternBuffer);

	    setupPaper();
        drawPatterns();
  	}

  	p2mgHandler = function() {
  		// pqbdpqbdpqbdpqbdpqbd
  		// 'Vertical Reflection + (Glide Reflection || Order-2 Rotations)'
  		self.generatorGetters = [getMirrorV, getGlideH];
  		var gap = 0;

  		// create H mirror within fundamental domain
        // mirrorOffsetFraction=0 will mean normal mirror at bottom of fundamental domain
  		var mirrorHOffsetFraction = (1/4);
  		var mirrorHOffset = (mirrorHOffsetFraction)*(self.fundamentalDomainHeight + self.patternBuffer);

  		self.drawOptions = {
  			mirrorOffset: mirrorHOffset,
  			gap: gap,
  		}

  		self.patternSpaceHeight = (2 - mirrorHOffsetFraction)*(self.fundamentalDomainHeight + self.patternBuffer);

	    setupPaper();
        drawPatterns();

        // draw the symmetry sets
        var glideStartY = (1 - mirrorHOffsetFraction)*(self.fundamentalDomainHeight + self.patternBuffer);
        var glideSet = drawXAxesSet(self.paper, glideStartY, self.patternSpaceHeight, self.numPatterns);

        addSymmetrySetProperties(glideSet, SYMMETRY_SET_STYLES['g']);
        self.symmetrySets['g'] = glideSet;

        // draw v1's & v2's
        // space v-lines by 2*width of fundamental domain
        var vGap = 2*(self.fundamentalDomainWidth + gap);
        var v1Set = drawYAxesSet(self.paper, 0 - gap, vGap);
        var v2Set = drawYAxesSet(self.paper, self.fundamentalDomainWidth, vGap);

        addSymmetrySetProperties(v1Set, {'stroke': 'mediumpurple', 'stroke-width': 4});
        addSymmetrySetProperties(v2Set, {'stroke': 'darkmagenta', 'stroke-width': 4});
        self.symmetrySets['v1'] = v1Set;
        self.symmetrySets['v2'] = v2Set;

  	}

    p2mmHandler = function() {
        // patternDescription = 'Horizontal Reflection + Vertical Reflections + Order-2 Rotations + Translation';
        self.generatorGetters = [getMirrorH, getMirrorV];
        // multiply by 2 because there is a horizontal reflection
        self.patternSpaceHeight = 2*(self.fundamentalDomainHeight + self.patternBuffer);

	    setupPaper();
        drawPatterns();

        // Draw symmetry sets
        var h1StartY = self.fundamentalDomainHeight + self.patternBuffer;
        var hGap = self.patternSpaceHeight;
        setupH1SymmetrySet(h1StartY, hGap);

        // draw v1's & v2's
        // space v-lines by 2*width of fundamental domain
        var vGap = (2*self.fundamentalDomainWidth);
        var v1Set = drawYAxesSet(self.paper, 0, vGap);
        var v2Set = drawYAxesSet(self.paper, self.fundamentalDomainWidth, vGap);

        addSymmetrySetProperties(v1Set, {'stroke': 'mediumpurple', 'stroke-width': 4});
        addSymmetrySetProperties(v2Set, {'stroke': 'darkmagenta', 'stroke-width': 4});
        self.symmetrySets['v1'] = v1Set;
        self.symmetrySets['v2'] = v2Set;
    }

    var handlers = {
        'p1': p1Handler,
        'p11m': p11mHandler,
        'p1m1': p1m1Handler,
        'p1a1': p1a1Handler,
        'p2': p2Handler,
        'p2mg': p2mgHandler,
        'p2mm': p2mmHandler,
    }
    if (handlers[self.patternName]) {
        handlers[self.patternName]();
    }

});
