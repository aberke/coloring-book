
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
></div>
**/
function friezePatternDirective($window) {
    return {

    restrict: "EAC", // E = element, A = attribute, C = class, M = comment
    scope: {}, // using isolated scope
    link: function(scope, element, attrs) {

        scope.groupName = attrs.groupName || "p1";
        scope.patternFunction = $window[attrs.patternFunction];
        scope.patternFunctionOptions = JSON.parse(attrs.patternFunctionOptions || "{}");

        // initialize the drawOptions
        scope.drawOptions = JSON.parse(attrs.drawOptions || "{}");

        scope.patternData = frieze.GROUP_DATA[scope.groupName];
        
        // Pattern design width and height:
        scope.fdWidth = Number(attrs.fundamentalDomainWidth || "80");
        scope.fdHeight = Number(attrs.fundamentalDomainHeight || "80");
        // Size of underlying fundamental domain grid tiles (width=height).
        scope.fdSize = scope.fdHeight;

        let container = element[0];
        // Build margin within javascript instead of CSS so that patterns
        // can be spaced out while vertical symmetry lines still connect.
        const margin = 10;
        const origin = {
            X: 0,
            Y: margin
        };
        
        // Initialize the variables that will be set later
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
        // Whether or not the symmetry sets are shown is controlled by CSS.
        scope.symmetrySets = {};


        // Add class to each path element in the set to allow CSS styling.
        scope.setupSymmetrySets = function() {
            if (!!scope.symmetrySets.h1)
                util.addClassNamesToElements(scope.symmetrySets.h1, ["horizontal-mirror", "symmetry"]);
            if (!!scope.symmetrySets.v1)
                util.addClassNamesToElements(scope.symmetrySets.v1, ["vertical-mirror", "symmetry"]);
            if (!!scope.symmetrySets.v2)
                util.addClassNamesToElements(scope.symmetrySets.v2, ["vertical-mirror", "symmetry"]);
            if (!!scope.symmetrySets.g)
                util.addClassNamesToElements(scope.symmetrySets.g, ["glide-reflection", "symmetry"]);
            if (!!scope.symmetrySets.r1)
                util.addClassNamesToElements(scope.symmetrySets.r1, ["rotation", "symmetry"]);
            if (!!scope.symmetrySets.r2)
                util.addClassNamesToElements(scope.symmetrySets.r2, ["rotation", "symmetry"]);
        }


        scope.setupPaper = function() {
            container.className += " frieze-pattern";
            // Put margin above and below pattern.
            const height = scope.patternSpaceHeight + 2*margin;
            container.style.height = (String(height) + "px");
            scope.paper = new Raphael(container, "100%", height);
        };

        scope.drawPattern = function() {
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
            const h1StartY = scope.fdSize + margin;
            scope.symmetrySets.h1 = util.drawXaxis(scope.paper, h1StartY);
            scope.setupSymmetrySets();
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
            scope.symmetrySets.v1 = util.drawYAxesSet(scope.paper, 0, vGap);
            scope.symmetrySets.v2 = util.drawYAxesSet(scope.paper, scope.fdSize, vGap);
            scope.setupSymmetrySets();
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
            let glideStartY = mirrorOffsetYMultiplier*scope.fdSize + margin;
            scope.symmetrySets.g = util.drawXaxis(scope.paper, glideStartY);
            scope.setupSymmetrySets();
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
                X: origin.X + scope.fdSize,
                Y: origin.Y + rotationOffsetYMultiplier*scope.fdSize
            };
            let rotationPointSet2Start = {
                X: origin.X + 2*scope.fdSize,
                Y: origin.Y + rotationOffsetYMultiplier*scope.fdSize
            };
            let rotationPointSetGapX = 2*scope.fdSize;

            scope.symmetrySets.r1 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet1Start, rotationPointSetGapX);
            scope.symmetrySets.r2 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet2Start, rotationPointSetGapX);
            scope.setupSymmetrySets();
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
            let glideStartY = mirrorOffsetYMultiplier*scope.fdSize + margin;
            scope.symmetrySets.g = util.drawXaxis(scope.paper, glideStartY);

            // draw v1"s & v2"s
            // space v-lines by 2*width of fundamental domain
            var vGap = 4*(scope.fdSize);
            scope.symmetrySets.v1 = util.drawYAxesSet(scope.paper, 3*(scope.fdSize), vGap);
            scope.symmetrySets.v2 = util.drawYAxesSet(scope.paper, scope.fdSize, vGap);

            // Draw the rotation point sets
            let rotationPointSet1Start = {
                X: origin.X + 2*scope.fdSize,
                Y: origin.Y + mirrorOffsetYMultiplier*scope.fdSize
            };
            let rotationPointSet2Start = {
                X: origin.X + 4*scope.fdSize,
                Y: origin.Y + mirrorOffsetYMultiplier*scope.fdSize
            };
            let rotationPointSetGapX = 4*scope.fdSize;

            scope.symmetrySets.r1 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet1Start, rotationPointSetGapX);
            scope.symmetrySets.r2 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet2Start, rotationPointSetGapX);
            scope.setupSymmetrySets();
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
            let h1Y = scope.fdSize + margin;
            scope.symmetrySets.h1 = util.drawXaxis(scope.paper, h1Y);

            // draw v1"s & v2"s
            // space v-lines by 2*width of fundamental domain
            let vGap = (2*scope.fdSize);
            scope.symmetrySets.v1 = util.drawYAxesSet(scope.paper, 0, vGap);
            scope.symmetrySets.v2 = util.drawYAxesSet(scope.paper, scope.fdSize, vGap);

            // Draw the rotation point sets
            let rotationPointSet1Start = {
                X: origin.X,
                Y: origin.Y + scope.fdSize
            };
            let rotationPointSet2Start = {
                X: origin.X + scope.fdSize,
                Y: origin.Y + scope.fdSize
            };
            let rotationPointSetGapX = 2*scope.fdSize;

            scope.symmetrySets.r1 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet1Start, rotationPointSetGapX);
            scope.symmetrySets.r2 = util.drawOrder2RotationPointSet(scope.paper, rotationPointSet2Start, rotationPointSetGapX);
            scope.setupSymmetrySets();
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
        };
        scope.init();

    }};
};
