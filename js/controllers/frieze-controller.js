
friezeApp.controller('friezeController', function($rootScope, $scope, $location, $routeParams, fundamentalDomainPatterns, fundamentalDomainProperties, patternsData) {

    var self = this;

	this.paper;

	// object mapping symmetryName -> Set of symmetries
	// eg, {h1: paper.Set([line1, line2]), v1: paper.Set([line1, line2]), }
	this.symmetrySets = {};
	this.friezePatterns = [];

	this.patternName = $routeParams.patternName;
    this.patternData = patternsData[this.patternName];

	// set PatternName on the root scope so can update <head/> title
	$rootScope.patternName = this.patternName;
	$scope.patternName = this.patternName;
	$scope.patternDescription = this.patternDescription;

    self.numPatterns = fundamentalDomainPatterns.length;

    self.fundamentalDomainWidth = fundamentalDomainProperties.width;
    self.fundamentalDomainHeight = fundamentalDomainProperties.height;

    // pixel buffer between pattern space start & fundamental domain
    self.patternBuffer = fundamentalDomainProperties.buffer;


    setupPaper = function() {
        var canvasHeight = self.patternSpaceHeight*self.numPatterns;
        self.paper = new Raphael(document.getElementById('canvas'), '100%', canvasHeight);
    }

    // draws h1's
    setupH1SymmetrySet = function(h1StartY, hGap) {
        var h1Set = drawXAxesSet(self.paper, h1StartY, hGap, self.numPatterns);
        addSymmetrySetProperties(h1Set, {'stroke': 'red', 'stroke-width': 4});
        self.symmetrySets['h1'] = h1Set;
    }

    drawPatterns = function() {
        var X = self.fundamentalDomainHeight + self.patternBuffer;
        for (var i=0; i<self.numPatterns; i++) {
            // draw Pattern
            var fundamentalDomainPattern = fundamentalDomainPatterns[i];
            var options = {'id': getPatternId(self.patternName, i)};
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

	    var canvasHeight = self.patternSpaceHeight*self.numPatterns;
	    self.paper = new Raphael(document.getElementById('canvas'), '100%', canvasHeight);

        drawPatterns();

        // Draw symmetry sets
        var h1StartY = self.fundamentalDomainHeight + self.patternBuffer;
        var hGap = self.patternSpaceHeight;
        setupH1SymmetrySet(h1StartY, hGap);

	}

    p2mmHandler = function() {

        self.generatorGetters = [getMirrorH, getMirrorV];
        // multiply by 2 because there is a horizontal reflection
        self.patternSpaceHeight = 2*(self.fundamentalDomainHeight + self.patternBuffer);

        var canvasHeight = self.patternSpaceHeight*self.numPatterns;
        self.paper = new Raphael(document.getElementById('canvas'), '100%', canvasHeight);

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
        'p2mm': p2mmHandler,
    }
    if (handlers[self.patternName]) {
        handlers[self.patternName]();
    }

});
