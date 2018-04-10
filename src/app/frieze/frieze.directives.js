
/*
Use
------------------------------
<div class="frieze-pattern"
    pattern-function={function} // function with which to draw fundamental domain
    pattern-function-options={object} // options that will be passed to the pattern-function
    draw-options={} // options that will be passed to the FriezePattern constructor
    group-name={"p1" | "p11g" | ... one of the 7 frieze groups to draw}
    fundamental-domain-width={number} // TODO: rename?
    fundamental-domain-height={number}
    show-symmetry-sets={boolean} // value to watch -- show the symmetry set lines when true
></div>
**/
function friezePatternDirective($window) {
    return {

    restrict: "EAC", //E = element, A = attribute, C = class, M = comment
    scope: {}, // using isolated scope
    link: function(scope, element, attrs) {

        scope.groupName = attrs.groupName || "p1";
        scope.patternFunction = $window[attrs.patternFunction];
        scope.patternFunctionOptions = JSON.parse(attrs.patternFunctionOptions || "{}");

        // initialize the drawOptions
        scope.drawOptions = JSON.parse(attrs.drawOptions || "{}");

        scope.patternData = friezeGroupsData[scope.groupName];
        
        // Pattern design width and height:
        scope.fdWidth = Number(attrs.fundamentalDomainWidth || "80");
        scope.fdHeight = Number(attrs.fundamentalDomainHeight || "80");
        // Size of underlying fundamental domain grid tiles (width=height).
        scope.fdSize = scope.fdHeight;

        // initialize the variables that will be set later
        scope.paper = null;
        scope.friezePattern = null;
        /* transforms is an object of transformation functions (generators)
        {
            FundamentalDomain: (optional) [list of (function) transforms]
            X: (function) transform along the X-axis
        }
        */
        scope.transforms = {};
        scope.transformOptions = {};
        // pattern space height computed for each pattern group and used
        // to set height of paper, draw symmetry lines, and determine offsets for transforms.
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
            for (let symmetrySetName in scope.symmetrySets) {
                let symmetrySet = scope.symmetrySets[symmetrySetName];
                symmetrySet.attr({opacity: 0});
            }
        };
        attrs.$observe("showSymmetrySets", function(value) {
            if (!!value && value !== "false")
                scope.showSymmetrySets();
            else
                scope.hideSymmetrySets();
        });

        // Draws h1 symmetry lines
        scope.setupH1SymmetrySet = function(h1Y, hGap) {
            let h1Set = util.drawXaxis(scope.paper, h1Y, hGap);
            util.addSymmetrySetProperties(h1Set, SYMMETRY_SET_STYLES.h1);
            scope.symmetrySets.h1 = h1Set;
        };

        scope.setupPaper = function() {
            let elt = element[0];
            elt.className += " frieze-pattern";
            elt.style.height = (String(scope.patternSpaceHeight) + "px");
            scope.paper = new Raphael(elt, "100%", scope.patternSpaceHeight);
        };

        scope.drawPattern = function() {
            const origin = {X: 0, Y: 0};
            const fundamentalDomainPath = squareGridFundamentalDomain(origin, scope.fdSize);
            // Generate the path once so that it can use random variables
            // and yet still look the same when it's redrawn by the wallpaperPattern
            const patternDesignPath = scope.patternFunction(origin, scope.fdWidth,
                                                            scope.fdHeight,
                                                            scope.patternFunctionOptions);
        
            scope.friezePattern = new FriezePattern(scope.paper,
                                                    fundamentalDomainPath,
                                                    patternDesignPath,
                                                    scope.transforms,
                                                    scope.transformOptions,
                                                    scope.drawOptions);
        };


        scope.p1Handler = function() {
            scope.transforms = {
                X: transforms.translateH
            };
            scope.patternSpaceHeight = scope.fdSize;
            scope.setupPaper();
            scope.drawPattern();
        };

        scope.p11mHandler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.mirrorH],
                X: transforms.translateH
            };
            // multiply by 2 because there is a horizontal reflection
            scope.patternSpaceHeight = 2*scope.fdSize;

            scope.setupPaper();
            scope.drawPattern();

            // Draw symmetry sets
            const h1StartY = scope.fdSize;
            const hGap = scope.patternSpaceHeight;
            scope.setupH1SymmetrySet(h1StartY, hGap);
        };

        scope.p1m1Handler = function() {
            // "Vertical Reflection only"
            // getMirrorV generator used twice because:
            //  - there are two mirror lines
            //  - double transformation should be considered single unit for click -> regeneration target (bug otherwise)
            scope.transforms = {
                FundamentalDomain: [transforms.mirrorV],
                X: transforms.mirrorV
            };
            scope.patternSpaceHeight = scope.fdSize;

            scope.setupPaper();
            scope.drawPattern();

            // Draw symmetry sets:
            // draw v1's & v2's
            // space v-lines by 2*width of fundamental domain
            let vGap = 2*scope.fdSize;
            let v1Set = util.drawYAxesSet(scope.paper, 0, vGap);
            let v2Set = util.drawYAxesSet(scope.paper, scope.fdSize, vGap);

            util.addSymmetrySetProperties(v1Set, SYMMETRY_SET_STYLES.v1);
            util.addSymmetrySetProperties(v2Set, SYMMETRY_SET_STYLES.v2);
            scope.symmetrySets.v1 = v1Set;
            scope.symmetrySets.v2 = v2Set;
        };

        scope.p11gHandler = function() {
            // pbpbpbpb
            // "Glide Reflection only"
            let mirrorOffsetYMultiplier = (1/2);
            scope.transforms = {
                X: transforms.glideH
            };
            scope.transformOptions = {
                X:  {mirrorOffsetYMultiplier: mirrorOffsetYMultiplier}
            };

            scope.patternSpaceHeight = 2*mirrorOffsetYMultiplier*scope.fdSize;

            scope.setupPaper();
            scope.drawPattern();

            // draw the symmetry set
            let glideStartY = mirrorOffsetYMultiplier*scope.fdSize;
            let glideSet = util.drawXaxis(scope.paper, glideStartY)
            util.addSymmetrySetProperties(glideSet, SYMMETRY_SET_STYLES.g);
            scope.symmetrySets.g = glideSet;
        };

        scope.p2Handler = function() {
            // pdpdpdpd
            // "Order-2 Rotations"
            let rotationOffsetYMultiplier = util.isNumeric(scope.drawOptions.rotationOffset) ? scope.drawOptions.rotationOffset : (3/4);
            
            scope.transforms = {
                FundamentalDomain: [transforms.order2Rotation],
                X: transforms.translateH
            };
            scope.transformOptions = {
                FundamentalDomain: [
                    {rotationOffsetYMultiplier: rotationOffsetYMultiplier}
                ]
            };

            scope.patternSpaceHeight = 2*rotationOffsetYMultiplier*scope.fdSize;
            scope.setupPaper();
            scope.drawPattern();

            // Draw the rotation point sets
            let rotationPointSet1Start = {
                X: scope.fdSize,
                Y: rotationOffsetYMultiplier*scope.fdSize
            };
            let rotationPointSet2Start = {
                X: 2*scope.fdSize,
                Y: rotationOffsetYMultiplier*scope.fdSize
            };
            let rotationPointSetGapX = 2*scope.fdSize;

            let rotationPointSet1 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet1Start, rotationPointSetGapX);
            let rotationPointSet2 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet2Start, rotationPointSetGapX);
            util.addSymmetrySetProperties(rotationPointSet1, SYMMETRY_SET_STYLES.r1);
            util.addSymmetrySetProperties(rotationPointSet2, SYMMETRY_SET_STYLES.r2);
            scope.symmetrySets.r1 = rotationPointSet1;
            scope.symmetrySets.r2 = rotationPointSet2;
        };

        scope.p2mgHandler = function() {
            // pqbdpqbdpqbdpqbdpqbd
            // "Vertical Reflection + (Glide Reflection || Order-2 Rotations)"
            // Has H mirror within fundamental domain
            let mirrorOffsetYMultiplier = (3/4);
            scope.transforms = {
                FundamentalDomain: [transforms.mirrorV, transforms.glideH],
                X: transforms.translateH 
            };
            scope.transformOptions = {
                FundamentalDomain: [
                    {},
                    {mirrorOffsetYMultiplier: mirrorOffsetYMultiplier}
                ]
            };

            scope.patternSpaceHeight = 2*mirrorOffsetYMultiplier*scope.fdSize;
            scope.setupPaper();
            scope.drawPattern();

            // draw the symmetry sets
            let glideStartY = mirrorOffsetYMultiplier*scope.fdSize;
            let glideSet = util.drawXaxis(scope.paper, glideStartY);

            util.addSymmetrySetProperties(glideSet, SYMMETRY_SET_STYLES.g);
            scope.symmetrySets.g = glideSet;

            // draw v1"s & v2"s
            // space v-lines by 2*width of fundamental domain
            var vGap = 4*(scope.fdSize);
            var v1Set = util.drawYAxesSet(scope.paper, 3*(scope.fdSize), vGap);
            var v2Set = util.drawYAxesSet(scope.paper, scope.fdSize, vGap);

            util.addSymmetrySetProperties(v1Set, SYMMETRY_SET_STYLES.v1);
            util.addSymmetrySetProperties(v2Set, SYMMETRY_SET_STYLES.v2);
            scope.symmetrySets.v1 = v1Set;
            scope.symmetrySets.v2 = v2Set;

            // Draw the rotation point sets
            let rotationPointSet1Start = {
                X: 2*scope.fdSize,
                Y: mirrorOffsetYMultiplier*scope.fdSize
            };
            let rotationPointSet2Start = {
                X: 4*scope.fdSize,
                Y: mirrorOffsetYMultiplier*scope.fdSize
            };
            let rotationPointSetGapX = 4*scope.fdSize;

            let rotationPointSet1 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet1Start, rotationPointSetGapX);
            let rotationPointSet2 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet2Start, rotationPointSetGapX);
            util.addSymmetrySetProperties(rotationPointSet1, SYMMETRY_SET_STYLES.r1);
            util.addSymmetrySetProperties(rotationPointSet2, SYMMETRY_SET_STYLES.r2);
            scope.symmetrySets.r1 = rotationPointSet1;
            scope.symmetrySets.r2 = rotationPointSet2;
        };

        scope.p2mmHandler = function() {
            // patternDescription = "Horizontal Reflection + Vertical Reflections + Order-2 Rotations + Translation";
            scope.transforms = {
                FundamentalDomain: [transforms.mirrorH, transforms.mirrorV],
                X: transforms.mirrorV
            };
            // multiply by 2 because there is a horizontal reflection
            scope.patternSpaceHeight = 2*(scope.fdSize);
            scope.setupPaper();
            scope.drawPattern();

            // Draw symmetry sets
            let h1Y = scope.fdSize;
            let hGap = scope.patternSpaceHeight;
            scope.setupH1SymmetrySet(h1Y, hGap);

            // draw v1"s & v2"s
            // space v-lines by 2*width of fundamental domain
            let vGap = (2*scope.fdSize);
            let v1Set = util.drawYAxesSet(scope.paper, 0, vGap);
            let v2Set = util.drawYAxesSet(scope.paper, scope.fdSize, vGap);

            util.addSymmetrySetProperties(v1Set, SYMMETRY_SET_STYLES.v1);
            util.addSymmetrySetProperties(v2Set, SYMMETRY_SET_STYLES.v2);
            scope.symmetrySets.v1 = v1Set;
            scope.symmetrySets.v2 = v2Set;

            // Draw the rotation point sets
            let rotationPointSet1Start = {
                X: 0,
                Y: scope.fdSize
            };
            let rotationPointSet2Start = {
                X: scope.fdSize,
                Y: scope.fdSize
            };
            let rotationPointSetGapX = 2*scope.fdSize;

            let rotationPointSet1 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet1Start, rotationPointSetGapX);
            let rotationPointSet2 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet2Start, rotationPointSetGapX);
            util.addSymmetrySetProperties(rotationPointSet1, SYMMETRY_SET_STYLES.r1);
            util.addSymmetrySetProperties(rotationPointSet2, SYMMETRY_SET_STYLES.r2);
            scope.symmetrySets.r1 = rotationPointSet1;
            scope.symmetrySets.r2 = rotationPointSet2;
        };

        var handlers = {
            "p1": scope.p1Handler,
            "p11m": scope.p11mHandler,
            "p1m1": scope.p1m1Handler,
            "p11g": scope.p11gHandler,
            "p2": scope.p2Handler,
            "p2mg": scope.p2mgHandler,
            "p2mm": scope.p2mmHandler,
        };

        scope.init = function() {
            if (handlers[scope.groupName])
                handlers[scope.groupName]();

            if (attrs.showSymmetrySets && attrs.showSymmetrySets !== "false")
                scope.showSymmetrySets();
        };
        scope.init();

    }};
};
