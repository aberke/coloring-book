
/*
Use
------------------------------
<div class="wallpaper-pattern"
    pattern-function={function} // function with which to draw fundamental domain
    pattern-function-options={object} // options that will be passed to the pattern-function
    draw-options={} // options that will be passed to the wallpaperPattern constructor
    group-name={"p1" | "p11g" | ... one of the 17 wallpaper groups to draw}
    fundamental-domain-width={number}
    fundamental-domain-height={number}
    show-symmetry-sets={boolean} // value to watch -- show the symmetry set lines when true
></div>
**/
function WallpaperPatternDirective($window) {
    return {

    restrict: "EA",
    scope: {}, // using isolated scope
    link: function(scope, element, attrs) {

        scope.groupName = attrs.groupName || "p1";
        scope.patternFunction = $window[attrs.patternFunction];
        scope.patternFunctionOptions = JSON.parse(attrs.patternFunctionOptions || "{}");

        // initialize the drawOptions
        scope.drawOptions = JSON.parse(attrs.drawOptions || "{}");
        
        scope.fundamentalDomainWidth = Number(attrs.fundamentalDomainWidth || "100");
        scope.fundamentalDomainHeight = Number(attrs.fundamentalDomainHeight || "80");

        // initialize the variables that will be set later
        scope.paper = null;
        scope.wallpaperPattern = null;
        /* transforms is an object of transformation functions (generators)
        {
            FundamentalDomain: (optional) [list of (function) transforms]
            X: (function) transform along the X-axis
            Y: (optional) (function) transform along the Y-axis
        }
        */
        scope.transforms = {};


        scope.setupPaper = function() {
            let elt = element[0];
            elt.className += " wallpaper-pattern";
            scope.paper = new Raphael(elt, "100%", "100%");
        };

        scope.drawPattern = function() {
            let origin = {
                X: 0,
                Y: scope.fundamentalDomainHeight,
            };
            // Generate the fundamental domain path once so that it can use random variables
            // and yet still look the same when it's redrawn by the wallpaperPattern
            let fundamentalDomainPath = scope.patternFunction(origin, scope.fundamentalDomainWidth, scope.fundamentalDomainHeight, scope.patternFunctionOptions);
            scope.wallpaperPattern = new WallpaperPattern(scope.paper, fundamentalDomainPath, scope.transforms, scope.drawOptions);
        };


        scope.p1Handler = function() {
            scope.transforms = {
                X: transforms.translateH,
                Y: transforms.translateV
            };

            scope.setupPaper();
            scope.drawPattern();
        };

        scope.p2Handler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.order2Rotation],
                X: transforms.translateH, // TODO: replace with order-2 rotation (set mirror offet halfway and this can work)
                Y: transforms.translateV  // TODO: replace with order-2 rotation
            };

            scope.setupPaper();
            // scope.drawOptions.rotationOffsetY = (scope.fundamentalDomainHeight)/2;
            scope.drawPattern();
        };

        scope.pmHandler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.mirrorV],
                X: transforms.mirrorV,
                Y: transforms.translateV
            };

            scope.setupPaper();
            scope.drawPattern();
        };

        scope.pgHandler = function() {
            scope.transforms = {
                X: transforms.glideH,
                Y: transforms.translateV
            };

            // create G mirror within fundamental domain
            // mirrorOffsetFraction=0 will mean normal mirror at bottom of fundamental domain
            let mirrorHOffsetFraction = (1/2);
            let mirrorHOffset = mirrorHOffsetFraction*scope.fundamentalDomainHeight;

            scope.drawOptions.mirrorOffset = mirrorHOffset;
            scope.setupPaper();
            scope.drawPattern();
        };

        scope.cmHandler = function() {
            scope.transforms = {
                X: transforms.glideH,
                Y: transforms.mirrorH
            };

            // create G mirror within fundamental domain
            // mirrorOffsetFraction=0 will mean normal mirror at bottom of fundamental domain
            let mirrorHOffsetFraction = (1/2);
            let mirrorHOffset = mirrorHOffsetFraction*scope.fundamentalDomainHeight;

            scope.drawOptions.mirrorOffset = mirrorHOffset;
            scope.setupPaper();
            scope.drawPattern();
        };

        /*
        pgg has 2 perpendicular glide reflections and an order-2 rotation
        that is on neither axis of reflection.
        */
        scope.pggHandler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.order2Rotation, transforms.glideH],
                X: transforms.translateH,
                Y: transforms.translateV
            };

            let mirrorHOffsetFraction = (1/2);
            let mirrorHOffset = mirrorHOffsetFraction*scope.fundamentalDomainHeight;
            scope.drawOptions.mirrorOffset = mirrorHOffset;

            scope.setupPaper();
            scope.drawPattern();
        };

        /*
        pmg has a glide reflection and mirror reflection that are perpendicular.
        It also has an order-2 rotation that is on neither axis of reflection.
        */
        scope.pmgHandler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.order2Rotation],
                X: transforms.mirrorV,
                Y: transforms.translateV
            };
            scope.setupPaper();
            scope.drawPattern();
        };

        scope.pmmHandler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.mirrorV, transforms.mirrorH],
                X: transforms.mirrorV,
                Y: transforms.mirrorH
            };
            scope.setupPaper();
            scope.drawPattern();
        };

        /*
        cmm has perpendicular mirror reflection axes and 2 point of order-2 rotation.
        One order-2 rotation sits at the intersection of reflection axes, and one sits
        on no axis.
        */
        scope.cmmHandler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.order2Rotation],
                X: transforms.mirrorV,
                Y: transforms.mirrorH
            };
            scope.setupPaper();
            scope.drawPattern();
        };

        /*
        p4 has an order-4 rotations with order-2 rotations between them.
        */
        scope.p4Handler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.order4Rotation],
                X: transforms.translateH, // TODO: replace with order-2 rotation
                Y: transforms.translateV  // TODO: replace with order-2 rotation
            };
            scope.setupPaper();
            scope.drawPattern();
        };

        /*
        p4g has an order-4 rotations with perpendicular axes of mirror reflections
        between them.
        It also has order-2 rotations on the intersections of the mirror axes.
        */
        scope.p4gHandler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.order4Rotation, transforms.mirrorV],
                X: transforms.translateH,
                Y: transforms.translateV
            };
            scope.setupPaper();
            scope.drawPattern();
        };

        /*
        p4m has an order-4 rotations at the intersections of perpendicular
        mirror reflection axes.
        */
        scope.p4mHandler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.mirrorH, transforms.order4Rotation],
                X: transforms.translateH,
                Y: transforms.translateV
            };
            scope.drawOptions.rotationOffsetY = scope.fundamentalDomainHeight;
            
            scope.setupPaper();
            scope.drawPattern();
        };

        const handlers = {
            "p1": scope.p1Handler,
            "pm": scope.pmHandler,
            "pg": scope.pgHandler,
            "cm": scope.cmHandler,
            "p2": scope.p2Handler,
            "pgg": scope.pggHandler,
            "pmg": scope.pmgHandler,
            "pmm": scope.pmmHandler,
            "cmm": scope.cmmHandler,
            "p4": scope.p4Handler,
            "p4g": scope.p4gHandler,
            "p4m": scope.p4mHandler,
        };

        scope.init = function() {
            if (handlers[scope.groupName])
                handlers[scope.groupName]();
        };
        scope.init();
    }};
};
