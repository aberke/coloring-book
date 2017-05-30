
/*
Use
------------------------------
<div class='frieze-pattern'
    pattern-function={function} // function with which to draw fundamental domain
    pattern-function-options={object} // options that will be passed to the pattern-function
    draw-options={} // options that will be passed to the FriezePattern constructor
    group-name={'p1' | 'p11g' | ... one of the 7 frieze groups to draw}
    fundamental-domain-width={number}
    fundamental-domain-height={number}
    margin={Number} // margin of space to allow around fundamental domain
    show-symmetry-sets={boolean} // value to watch -- show the symmetry set lines when true
></div>
**/
function friezePatternDirective($window) {
	return {

	restrict: 'EAC', //E = element, A = attribute, C = class, M = comment
	scope: {}, // using isolated scope
	link: function(scope, element, attrs) {

		scope.groupName = attrs.groupName || 'p1';
		scope.patternFunction = $window[attrs.patternFunction];
		scope.patternFunctionOptions = JSON.parse(attrs.patternFunctionOptions || "{}");

		// initialize the drawOptions
		scope.drawOptions = JSON.parse(attrs.drawOptions || "{}");

		scope.patternData = friezeGroupsData[scope.groupName];

		// margin is the margin to leave above and below the drawn pattern
		// useful for patterns that have rotations that otherwise send their patterns outside
		// the canvas
		scope.margin = Number(attrs.margin || 1);
		
		scope.fundamentalDomainWidth = Number(attrs.fundamentalDomainWidth || '100');
		scope.fundamentalDomainHeight = Number(attrs.fundamentalDomainHeight || '80');

		// initialize the variables that will be set later
		scope.paper = null;
		scope.friezePattern = null;
		scope.generatorGetters = null;
		scope.patternSpaceHeight = null;
		// object mapping symmetryName -> Set of symmetries
		// eg, {g: paper.Set([line1, line2]), h1: paper.Set([line1, line2]), v1: paper.Set([line1, line2]), }
		scope.symmetrySets = {};


		/*
		Shows the lines that illustrate the group's symmetry elements
		*/
		scope.showSymmetrySets = function() {
			for (let symmetrySetName in scope.symmetrySets) {
				let symmetrySet = scope.symmetrySets[symmetrySetName];
				symmetrySet.toFront().attr({opacity: 1});
			}
		};
		/*
		Hides the lines that illustrate the group's symmetry elements
		*/
		scope.hideSymmetrySets = function() {
			for (var symmetrySetName in scope.symmetrySets) {
				var symmetrySet = scope.symmetrySets[symmetrySetName];
				symmetrySet.attr({opacity: 0});
			}
		};
		attrs.$observe('showSymmetrySets', function(value) {
			if (!!value && value !== "false")
				scope.showSymmetrySets();
			else
				scope.hideSymmetrySets();
		});

		scope.setupPaper = function() {
			var elt = element[0];
			var height = (scope.patternSpaceHeight || scope.fundamentalDomainHeight);
			elt.style.height = (String(height) + "px");
			scope.paper = new Raphael(elt, '100%', height);
		};

		// draws h1's
		scope.setupH1SymmetrySet = function(h1Y, hGap) {
		    var h1Set = drawXaxis(scope.paper, h1Y, hGap);
		    addSymmetrySetProperties(h1Set, SYMMETRY_SET_STYLES.h1);
		    scope.symmetrySets.h1 = h1Set;
		};

		scope.drawPattern = function() {
		    let origin = {
		    	X: 0,
		    	Y: scope.fundamentalDomainHeight + scope.margin,
		    };
		    // generate the fundamental domain path once so that it can use random variables
		    // and yet still look the same when it's redrawn by the FriezePattern
		    let fundamentalDomainPath = scope.patternFunction(origin, scope.fundamentalDomainWidth, scope.fundamentalDomainHeight, scope.patternFunctionOptions);
		    scope.friezePattern = new FriezePattern(scope.paper, fundamentalDomainPath, scope.generatorGetters, scope.drawOptions);
		};


		scope.p1Handler = function() {
		    scope.generatorGetters = [];
		    scope.patternSpaceHeight = scope.fundamentalDomainHeight + scope.margin;

		    scope.setupPaper();
		    scope.drawPattern();
		};

		scope.p11mHandler = function() {

		    scope.generatorGetters = [getMirrorH];

		    // multiply by 2 because there is a horizontal reflection
		    scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin);

		    scope.setupPaper();
		    scope.drawPattern();

		    // Draw symmetry sets
		    var h1StartY = scope.fundamentalDomainHeight + scope.margin;
		    var hGap = scope.patternSpaceHeight;
		    scope.setupH1SymmetrySet(h1StartY, hGap);
		};

		scope.p1m1Handler = function() {
		    // 'Vertical Reflection only'
		    scope.generatorGetters = [getMirrorV];

		    scope.patternSpaceHeight = (scope.fundamentalDomainHeight + scope.margin);

		    scope.setupPaper();
		    scope.drawPattern();

		    // Draw symmetry sets:
		    // draw v1's & v2's
		    // space v-lines by 2*width of fundamental domain
		    var vGap = (2*scope.fundamentalDomainWidth);
		    var v1Set = drawYAxesSet(scope.paper, 0, vGap);
		    var v2Set = drawYAxesSet(scope.paper, scope.fundamentalDomainWidth, vGap);

		    addSymmetrySetProperties(v1Set, SYMMETRY_SET_STYLES.v1);
		    addSymmetrySetProperties(v2Set, SYMMETRY_SET_STYLES.v2);
		    scope.symmetrySets.v1 = v1Set;
		    scope.symmetrySets.v2 = v2Set;
		};

		scope.p11gHandler = function() {
			// pbpbpbpb
			// 'Glide Reflection only'
			scope.generatorGetters = [getGlideH];

			// create H mirror within fundamental domain
			// mirrorOffsetFraction=0 will mean normal mirror at bottom of fundamental domain
			var mirrorHOffsetFraction = (1/4);
			var mirrorHOffset = mirrorHOffsetFraction*scope.fundamentalDomainHeight;

			scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin)*(1 - mirrorHOffsetFraction);

			scope.drawOptions.mirrorOffset = mirrorHOffset;
			scope.setupPaper();
			scope.drawPattern();

			// draw the symmetry set
			let glideStartY = scope.fundamentalDomainHeight + scope.margin - mirrorHOffset;
			let glideSet = drawXaxis(scope.paper, glideStartY)
			addSymmetrySetProperties(glideSet, SYMMETRY_SET_STYLES.g);
			scope.symmetrySets.g = glideSet;
		};

		scope.p2Handler = function() {
			// pdpdpdpd
			// 'Order-2 Rotations'
			scope.generatorGetters = [getOrder2RotationH];

			let rotationOffsetYFraction = isNumeric(scope.drawOptions.rotationOffset) ? scope.drawOptions.rotationOffset : (1/4);
			let rotationOffsetY = (rotationOffsetYFraction)*(scope.fundamentalDomainHeight);

			scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin - rotationOffsetY);
			scope.setupPaper();

			scope.drawOptions.rotationOffsetY = rotationOffsetY;
			scope.drawPattern();

			// Draw the rotation point sets
			let rotationPointSet1Start = {
				X: scope.fundamentalDomainWidth,
				Y: scope.fundamentalDomainHeight + scope.margin - rotationOffsetY
			};
			let rotationPointSet2Start = {
				X: 2*scope.fundamentalDomainWidth,
				Y: scope.fundamentalDomainHeight + scope.margin - rotationOffsetY
			};
			let rotationPointSetGapX = 2*scope.fundamentalDomainWidth;

			let rotationPointSet1 = drawOrder2RotationPointSet(scope.paper, rotationPointSet1Start, rotationPointSetGapX);
			let rotationPointSet2 = drawOrder2RotationPointSet(scope.paper, rotationPointSet2Start, rotationPointSetGapX);
			addSymmetrySetProperties(rotationPointSet1, SYMMETRY_SET_STYLES.r1);
			addSymmetrySetProperties(rotationPointSet2, SYMMETRY_SET_STYLES.r2);
			scope.symmetrySets.r1 = rotationPointSet1;
			scope.symmetrySets.r2 = rotationPointSet2;
		};

		scope.p2mgHandler = function() {
			// pqbdpqbdpqbdpqbdpqbd
			// 'Vertical Reflection + (Glide Reflection || Order-2 Rotations)'
			scope.generatorGetters = [getMirrorV, getGlideH];

			// create H mirror within fundamental domain
			// mirrorOffsetFraction=0 will mean normal mirror at bottom of fundamental domain
			var mirrorHOffsetFraction = (1/4);
			var mirrorHOffset = (mirrorHOffsetFraction)*(scope.fundamentalDomainHeight);

			scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin)*(1 - mirrorHOffsetFraction);
			scope.setupPaper();

			scope.drawOptions.mirrorOffset = mirrorHOffset;
			scope.drawPattern();

			// draw the symmetry sets
			let glideStartY = scope.fundamentalDomainHeight + scope.margin - mirrorHOffset;
			let glideSet = drawXaxis(scope.paper, glideStartY);

			addSymmetrySetProperties(glideSet, SYMMETRY_SET_STYLES.g);
			scope.symmetrySets.g = glideSet;

			// draw v1's & v2's
			// space v-lines by 2*width of fundamental domain
			var vGap = 4*(scope.fundamentalDomainWidth);
			var v1Set = drawYAxesSet(scope.paper, 3*(scope.fundamentalDomainWidth), vGap);
			var v2Set = drawYAxesSet(scope.paper, scope.fundamentalDomainWidth, vGap);

			addSymmetrySetProperties(v1Set, SYMMETRY_SET_STYLES.v1);
			addSymmetrySetProperties(v2Set, SYMMETRY_SET_STYLES.v2);
			scope.symmetrySets.v1 = v1Set;
			scope.symmetrySets.v2 = v2Set;

			// Draw the rotation point sets
			let rotationPointSet1Start = {
				X: 2*scope.fundamentalDomainWidth,
				Y: scope.fundamentalDomainHeight + scope.margin - mirrorHOffset
			};
			let rotationPointSet2Start = {
				X: 4*scope.fundamentalDomainWidth,
				Y: scope.fundamentalDomainHeight + scope.margin - mirrorHOffset
			};
			let rotationPointSetGapX = 4*scope.fundamentalDomainWidth;

			let rotationPointSet1 = drawOrder2RotationPointSet(scope.paper, rotationPointSet1Start, rotationPointSetGapX);
			let rotationPointSet2 = drawOrder2RotationPointSet(scope.paper, rotationPointSet2Start, rotationPointSetGapX);
			addSymmetrySetProperties(rotationPointSet1, SYMMETRY_SET_STYLES.r1);
			addSymmetrySetProperties(rotationPointSet2, SYMMETRY_SET_STYLES.r2);
			scope.symmetrySets.r1 = rotationPointSet1;
			scope.symmetrySets.r2 = rotationPointSet2;
		};

		scope.p2mmHandler = function() {
			// patternDescription = 'Horizontal Reflection + Vertical Reflections + Order-2 Rotations + Translation';
			scope.generatorGetters = [getMirrorH, getMirrorV];
			// multiply by 2 because there is a horizontal reflection
			scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin);
			scope.setupPaper();
			scope.drawPattern();

			// Draw symmetry sets
			var h1Y = scope.fundamentalDomainHeight + scope.margin;
			var hGap = scope.patternSpaceHeight;
			scope.setupH1SymmetrySet(h1Y, hGap);

			// draw v1's & v2's
			// space v-lines by 2*width of fundamental domain
			var vGap = (2*scope.fundamentalDomainWidth);
			var v1Set = drawYAxesSet(scope.paper, 0, vGap);
			var v2Set = drawYAxesSet(scope.paper, scope.fundamentalDomainWidth, vGap);

			addSymmetrySetProperties(v1Set, SYMMETRY_SET_STYLES.v1);
			addSymmetrySetProperties(v2Set, SYMMETRY_SET_STYLES.v2);
			scope.symmetrySets.v1 = v1Set;
			scope.symmetrySets.v2 = v2Set;

			// Draw the rotation point sets
			let rotationPointSet1Start = {
				X: 0,
				Y: scope.fundamentalDomainHeight + scope.margin
			};
			let rotationPointSet2Start = {
				X: scope.fundamentalDomainWidth,
				Y: scope.fundamentalDomainHeight + scope.margin
			};
			let rotationPointSetGapX = 2*scope.fundamentalDomainWidth;

			let rotationPointSet1 = drawOrder2RotationPointSet(scope.paper, rotationPointSet1Start, rotationPointSetGapX);
			let rotationPointSet2 = drawOrder2RotationPointSet(scope.paper, rotationPointSet2Start, rotationPointSetGapX);
			addSymmetrySetProperties(rotationPointSet1, SYMMETRY_SET_STYLES.r1);
			addSymmetrySetProperties(rotationPointSet2, SYMMETRY_SET_STYLES.r2);
			scope.symmetrySets.r1 = rotationPointSet1;
			scope.symmetrySets.r2 = rotationPointSet2;
		};

		var handlers = {
		    'p1': scope.p1Handler,
		    'p11m': scope.p11mHandler,
		    'p1m1': scope.p1m1Handler,
		    'p11g': scope.p11gHandler,
		    'p2': scope.p2Handler,
		    'p2mg': scope.p2mgHandler,
		    'p2mm': scope.p2mmHandler,
		};

		scope.init = function() {
			if (handlers[scope.groupName])
				handlers[scope.groupName]();

			if (attrs.showSymmetrySets && attrs.showSymmetrySets !== 'false')
				scope.showSymmetrySets();
		};
		scope.init();

	}};
};
