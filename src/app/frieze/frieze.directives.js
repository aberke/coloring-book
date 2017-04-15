
/*
Use
------------------------------
<div class='frieze-pattern'
    pattern-function={function} // function with which to draw fundamental domain
    group-name={'p1' | 'p1a1' | ... one of the 7 frieze groups to draw}
    fundamental-domain-width={number}
    fundamental-domain-height={number}
    margin={Number} // margin of space to allow around fundamental domain
    show-symmetry-sets={boolean} // value to watch -- show the symmetry set lines when true
></div>
**/
function friezePatternDirective() {
	return {

	restrict: 'EAC', //E = element, A = attribute, C = class, M = comment
	scope: {}, // using isolated scope
	link: function(scope, element, attrs) {

		scope.groupName = attrs.groupName || 'p1';
		scope.patternFunction = eval(attrs.patternFunction);
		scope.patternData = friezeGroupsData[scope.groupName];
		scope.patternDescription = scope.patternData.description || '';

		scope.margin = eval(attrs.margin || 1);
		scope.fundamentalDomainWidth = eval(attrs.fundamentalDomainWidth || '100');
		scope.fundamentalDomainHeight = eval(attrs.fundamentalDomainHeight || '80');

		scope.paper;

		// object mapping symmetryName -> Set of symmetries
		// eg, {g: paper.Set([line1, line2]), h1: paper.Set([line1, line2]), v1: paper.Set([line1, line2]), }
		scope.symmetrySets = {};

		scope.friezePattern;
		scope.generatorGetters;
		scope.patternSpaceHeight;
			

		/*
		Shows the lines that illustrate the group's symmetry elements
		*/
		scope.showSymmetrySets = function() {
			for (var symmetrySetName in scope.symmetrySets) {
				var symmetrySet = scope.symmetrySets[symmetrySetName];
				symmetrySet.attr({opacity: 0.6});
			}
		}
		/*
		Hides the lines that illustrate the group's symmetry elements
		*/
		scope.hideSymmetrySets = function() {
			for (var symmetrySetName in scope.symmetrySets) {
				var symmetrySet = scope.symmetrySets[symmetrySetName];
				symmetrySet.attr({opacity: 0});
			}
		}
		attrs.$observe('showSymmetrySets', function(value) {
			if (eval(value))
				scope.showSymmetrySets();
			else
				scope.hideSymmetrySets();
		});

		setupPaper = function() {
			var elt = element[0];
			var height = (scope.patternSpaceHeight || scope.fundamentalDomainHeight);
			elt.style.height = (String(height) + "px");
			scope.paper = new Raphael(elt, '100%', height);
		}

		// draws h1's
		setupH1SymmetrySet = function(h1StartY, hGap) {
		    var h1Set = drawXAxesSet(scope.paper, h1StartY, hGap);
		    addSymmetrySetProperties(h1Set, SYMMETRY_SET_STYLES['h1']);
		    scope.symmetrySets['h1'] = h1Set;
		}

		drawPattern = function(options) {
			options = options || {};

		    var origin = {
		    	X: 0,
		    	Y: scope.fundamentalDomainHeight + (1/2)*scope.margin,
		    };
		    var fundamentalDomainPathFactory = getFundamentalDomainPathFactory(scope.patternFunction, origin, scope.fundamentalDomainWidth, scope.fundamentalDomainHeight);
		    scope.friezePattern = new FriezePattern(scope.paper, fundamentalDomainPathFactory, scope.generatorGetters, options);
		}


		p1Handler = function() {
		    scope.generatorGetters = [];
		    scope.patternSpaceHeight = scope.fundamentalDomainHeight + scope.margin;

		    setupPaper();
		    drawPattern();
		}

		p11mHandler = function() {

		    scope.generatorGetters = [getMirrorH];

		    // multiply by 2 because there is a horizontal reflection
		    scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin);

		    setupPaper();
		    drawPattern();

		    // Draw symmetry sets
		    var h1StartY = scope.fundamentalDomainHeight;
		    var hGap = scope.patternSpaceHeight;
		    setupH1SymmetrySet(h1StartY, hGap);

		}

		p1m1Handler = function() {
		    // 'Vertical Reflection only'
		    scope.generatorGetters = [getMirrorV];

		    scope.patternSpaceHeight = (scope.fundamentalDomainHeight + scope.margin);

		    setupPaper();
		    drawPattern();

		    // Draw symmetry sets:
		    // draw v1's & v2's
		    // space v-lines by 2*width of fundamental domain
		    var vGap = (2*scope.fundamentalDomainWidth);
		    var v1Set = drawYAxesSet(scope.paper, 0, vGap);
		    var v2Set = drawYAxesSet(scope.paper, scope.fundamentalDomainWidth, vGap);

		    addSymmetrySetProperties(v1Set, SYMMETRY_SET_STYLES['v1']);
		    addSymmetrySetProperties(v2Set, SYMMETRY_SET_STYLES['v2']);
		    scope.symmetrySets['v1'] = v1Set;
		    scope.symmetrySets['v2'] = v2Set;
		}

		p1a1Handler = function() {
			// pbpbpbpb
			// 'Glide Reflection only'
			scope.generatorGetters = [getGlideH];

			// create H mirror within fundamental domain
			// mirrorOffsetFraction=0 will mean normal mirror at bottom of fundamental domain
			var mirrorHOffsetFraction = (1/4);
			var mirrorHOffset = mirrorHOffsetFraction*scope.fundamentalDomainHeight;

			scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin)*(1 - mirrorHOffsetFraction);

			drawOptions = {
				mirrorOffset: mirrorHOffset,
				gap: 0,
			}
			setupPaper();
			drawPattern(drawOptions);

			// draw the symmetry set
			var glideStartY = (1 - mirrorHOffsetFraction)*(scope.fundamentalDomainHeight);
			var glideSet = drawXAxesSet(scope.paper, glideStartY, scope.patternSpaceHeight);

			addSymmetrySetProperties(glideSet, SYMMETRY_SET_STYLES['g']);
			scope.symmetrySets['g'] = glideSet;
		}

		p2Handler = function() {
			// pdpdpdpd
			// 'Order-2 Rotations'
			scope.generatorGetters = [getOrder2RotationH];

			// rotationOffsetFraction=0 will mean normal rotation in middle of fundamental domain
			var rotationOffsetFraction = (1/4);
			var rotationOffset = (rotationOffsetFraction)*(scope.fundamentalDomainHeight);

			scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin - rotationOffset);
			setupPaper();

			drawOptions = {
				rotationOffset: rotationOffset
			}
			drawPattern(drawOptions);
		}

		p2mgHandler = function() {
			// pqbdpqbdpqbdpqbdpqbd
			// 'Vertical Reflection + (Glide Reflection || Order-2 Rotations)'
			scope.generatorGetters = [getMirrorV, getGlideH];
			var gap = 0;

			// create H mirror within fundamental domain
			// mirrorOffsetFraction=0 will mean normal mirror at bottom of fundamental domain
			var mirrorHOffsetFraction = (1/4);
			var mirrorHOffset = (mirrorHOffsetFraction)*(scope.fundamentalDomainHeight);

			scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin)*(1 - mirrorHOffsetFraction);
			setupPaper();

			drawOptions = {
				mirrorOffset: mirrorHOffset,
				gap: gap,
			}
			drawPattern(drawOptions);

			// draw the symmetry sets
			var glideStartY = (1 - mirrorHOffsetFraction)*(scope.fundamentalDomainHeight);
			var glideSet = drawXAxesSet(scope.paper, glideStartY, scope.patternSpaceHeight);

			addSymmetrySetProperties(glideSet, SYMMETRY_SET_STYLES['g']);
			scope.symmetrySets['g'] = glideSet;

			// draw v1's & v2's
			// space v-lines by 2*width of fundamental domain
			var vGap = 2*(scope.fundamentalDomainWidth + gap);
			var v1Set = drawYAxesSet(scope.paper, 0 - gap, vGap);
			var v2Set = drawYAxesSet(scope.paper, scope.fundamentalDomainWidth, vGap);

			addSymmetrySetProperties(v1Set, {'stroke': 'mediumpurple', 'stroke-width': 4});
			addSymmetrySetProperties(v2Set, {'stroke': 'darkmagenta', 'stroke-width': 4});
			scope.symmetrySets['v1'] = v1Set;
			scope.symmetrySets['v2'] = v2Set;
		}

		p2mmHandler = function() {
			// patternDescription = 'Horizontal Reflection + Vertical Reflections + Order-2 Rotations + Translation';
			scope.generatorGetters = [getMirrorH, getMirrorV];
			// multiply by 2 because there is a horizontal reflection
			scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin);
			setupPaper();
			drawPattern();

			// Draw symmetry sets
			var h1StartY = scope.fundamentalDomainHeight;
			var hGap = scope.patternSpaceHeight;
			setupH1SymmetrySet(h1StartY, hGap);

			// draw v1's & v2's
			// space v-lines by 2*width of fundamental domain
			var vGap = (2*scope.fundamentalDomainWidth);
			var v1Set = drawYAxesSet(scope.paper, 0, vGap);
			var v2Set = drawYAxesSet(scope.paper, scope.fundamentalDomainWidth, vGap);

			addSymmetrySetProperties(v1Set, {'stroke': 'mediumpurple', 'stroke-width': 4});
			addSymmetrySetProperties(v2Set, {'stroke': 'darkmagenta', 'stroke-width': 4});
			scope.symmetrySets['v1'] = v1Set;
			scope.symmetrySets['v2'] = v2Set;
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
		if (handlers[scope.groupName]) {
		    handlers[scope.groupName]();
		}

		if (eval(attrs.showSymmetrySets))
			scope.showSymmetrySets();
		}
	}
}
