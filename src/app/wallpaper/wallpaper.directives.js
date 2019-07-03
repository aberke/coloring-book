
/*
Use
------------------------------
<wallpaper-pattern
    pattern-function={function} // function with which to draw fundamental domain
    pattern-function-options={object} // options that will be passed to the pattern-function
    draw-options={} // options that will be passed to the WallpaperPattern constructor
    group-name={"p1" | "p11g" | ... one of the 17 wallpaper groups to draw}
    fundamental-domain-width={number}
    fundamental-domain-height={number}
></wallpaper-pattern>
**/
function WallpaperPatternDirective($window, $location) {
    return {

    restrict: "EA",
    scope: {
        // This exposes the redrawFn to the parent scope.
        // An isolated scope is used for the redraw fn with a namable
        // attribute so that a call to one directive's redraw fn does not
        // trigger another directive's fn.
        redrawFn: "=?",
    },
    link: function(scope, element, attrs) {
        
        // Initialize the variables that will be set later.
        scope.paper = null;
        scope.wallpaperPattern = null;

        // Set up the element that holds the drawing and
        // apply styling - most importantly: height.  This contains
        // the SVG/paper from overflowing.
        // Note that it is important to define the 'height' property
        // and not just the max-height property (in CSS or on elt style).
        let elt = element[0];
        elt.className += " wallpaper-pattern";

        // Set the size of both the paper, and the containing element.
        let height = elt.clientHeight;
        let width = elt.clientWidth;
        // Can optionally override default height (default from CSS rules)
        // by passing in search parameter ?height=NUMBER
        height = Number($location.search().height || height);
        elt.style.height = height;

        // Determine fundamental domain width from passed attributes
        // Make fundamental domain smaller for mobile.
        scope.fundamentalDomainWidth = Number(attrs.fundamentalDomainWidth || "100");
        scope.fundamentalDomainHeight = Number(attrs.fundamentalDomainHeight || "80");

        // Make fundamental domain smaller for mobile: Want at least 6 visible
        // instances of fundamental domain going width-wise.
        if ((6*scope.fundamentalDomainWidth > width)
            && (scope.fundamentalDomainWidth > 65))
            scope.fundamentalDomainWidth = scope.fundamentalDomainHeight = width/6;
        
        // Initialize pattern specific parameters.
        scope.groupName = attrs.groupName || "p1";
        scope.patternFunction = $window[attrs.patternFunction];
        scope.patternFunctionOptions = JSON.parse(attrs.patternFunctionOptions || "{}");
        
        /* transforms is an object of transformation functions (generators)
        {
            FundamentalDomain: (optional) [list of (function) transforms]
            X: (function) transform along the X-axis
            Y: (optional) (function) transform along the Y-axis
        }
        */
        scope.transforms = {};

        // Initialize the drawOptions.
        scope.drawOptions = JSON.parse(attrs.drawOptions || "{}");

        /*
        The underlying fundamental domain is either composed of a grid of squares (default) or
        triangles.
        A pattern design path lies on top, copying its transformations.
        */
        scope.drawPattern = function() {
            scope.paper = new Raphael(elt, "100%", height);

            if (!scope.fundamentalDomainPathFunction)
                scope.fundamentalDomainPathFunction = rectangleGridFundamentalDomain;

            const origin = {X: 0, Y: 0};
            const fundamentalDomainPath = scope.fundamentalDomainPathFunction(origin, scope.fundamentalDomainWidth, scope.fundamentalDomainHeight);
            // Generate the path once so that it can use random variables
            // and yet still look the same when it's redrawn by the wallpaperPattern
            const patternDesignPath = scope.patternFunction(origin, scope.fundamentalDomainWidth, scope.fundamentalDomainHeight, scope.patternFunctionOptions);
        
            scope.wallpaperPattern = new WallpaperPattern(scope.paper, fundamentalDomainPath,
                                                        patternDesignPath,
                                                        scope.transforms, scope.transformOptions,
                                                        scope.drawOptions);
        };
        
        scope.redrawFn = function() {
            scope.paper.clear();
            scope.drawPattern();
        }


        scope.p1Handler = function() {
            scope.transforms = {
                X: transforms.translateH,
                Y: transforms.translateV
            };
            scope.transformOptions = {
                X: {
                    translationOffsetXMultiplier: util.isNumeric(scope.drawOptions.translationOffsetXMultiplier) ? scope.drawOptions.translationOffsetXMultiplier : 1
                },
                Y: {
                    translationOffsetYMultiplier: util.isNumeric(scope.drawOptions.translationOffsetYMultiplier) ? scope.drawOptions.translationOffsetYMultiplier : 1
                }
            };
            scope.drawPattern();
        };

        scope.p2Handler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.order2Rotation],
                X: transforms.translateH,
                Y: transforms.translateV
            };
            scope.drawPattern();
        };

        scope.pmHandler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.mirrorV],
                X: transforms.mirrorV,
                Y: transforms.translateV
            };
            scope.drawPattern();
        };

        scope.pgHandler = function() {
            scope.transforms = {
            	FundamentalDomain: [transforms.glideH],
                X: transforms.glideH,
                Y: transforms.translateV
            };
            scope.transformOptions = {
            	FundamentalDomain: [
            		{mirrorOffsetYMultiplier: 1}
            	],
                X: {
                	mirrorOffsetYMultiplier: (1/2),
                	translationOffsetXMultiplier: (1/2)
                }
            };
            scope.drawPattern();
        };

        scope.cmHandler = function() {
            scope.transforms = {
            	FundamentalDomain: [transforms.glideH],
                X: transforms.glideH,
                Y: transforms.mirrorH
            };
            scope.transformOptions = {
            	FundamentalDomain: [
            		{mirrorOffsetYMultiplier: 1}
            	],
                X: {
                	mirrorOffsetYMultiplier: (1/2),
                	translationOffsetXMultiplier: (1/2)
                }
            };
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
            scope.transformOptions = {
                FundamentalDomain: [
                    {rotationOffsetYMultiplier: util.isNumeric(scope.drawOptions.rotationOffsetYMultiplier) ? scope.drawOptions.rotationOffsetYMultiplier : (3/4)},
                    {mirrorOffsetYMultiplier: (3/4)}
                ]
            };
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
            scope.transformOptions = {
                FundamentalDomain: [
                    {rotationOffsetYMultiplier: util.isNumeric(scope.drawOptions.rotationOffsetYMultiplier) ? scope.drawOptions.rotationOffsetYMultiplier : (1/2)},
                ]
            };
            scope.drawPattern();
        };

        scope.pmmHandler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.mirrorV, transforms.mirrorH],
                X: transforms.mirrorV,
                Y: transforms.mirrorH
            };
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
            scope.transformOptions = {
                FundamentalDomain: [
                    {rotationOffsetYMultiplier: util.isNumeric(scope.drawOptions.rotationOffsetYMultiplier) ? scope.drawOptions.rotationOffsetYMultiplier : (1/2)},
                ]
            };
            scope.drawPattern();
        };

        /*
        p4 has an order-4 rotations with order-2 rotations between them.
        */
        scope.p4Handler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.order4Rotation],
                X: transforms.translateH,
                Y: transforms.translateV
            };
            scope.drawPattern();
        };

        /*
        p4g has an order-4 rotations with perpendicular axes of mirror reflections
        between them.
        It also has order-2 rotations on the intersections of the mirror axes.
        */
        scope.p4gHandler = function() {
            scope.transforms = {
                FundamentalDomain: [transforms.order4Rotation, transforms.glideH],
                X: transforms.mirrorV,
                Y: transforms.mirrorH
            };
            scope.transformOptions = {
                FundamentalDomain: [
                    {},
                    {mirrorOffsetYMultiplier: (1/2)}
                ]
            };
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
            scope.transformOptions = {
                FundamentalDomain: [
                	{},
                    {rotationOffsetYMultiplier: (1/2)}
                ]
            };
            scope.drawPattern();
        };

        /*
        p3 has order-3 rotations and no reflections. 
        */
        scope.p3Handler = function() {
            scope.fundamentalDomainPathFunction = regularTriangularGridFundamentalDomain;
            scope.transforms = {
                FundamentalDomain: [
                	transforms.order3Rotation,
                	transforms.order3Rotation
                ],
                X: transforms.translateH,
                Y: transforms.translateV
            };
            scope.transformOptions = {
                FundamentalDomain: [
                    {rotationOffsetXMultiplier: 1},
                    {rotationOffsetYMultiplier: (1/2)},
                ],
                X: {translationOffsetXMultiplier: (6/7)},
                Y: {translationOffsetYMultiplier: (1/2)},
            };
            scope.drawPattern();
        };

        /*
        p31m has reflections with axes inclined at 60 degrees to one another, and order 3 rotations.
        Some of the centers of rotation lie on the reflection axes, and some do not.
        There are some glide-reflections.
        */
        scope.p31mHandler = function() {
            scope.fundamentalDomainPathFunction = triangularGridFundamentalDomainSixth;
            scope.transforms = {
                FundamentalDomain: [
                	transforms.order3Rotation,
                    transforms.mirrorV,
                	transforms.order3Rotation
                ],
                X: transforms.translateH,
                Y: transforms.translateV
            };
            scope.transformOptions = {
                FundamentalDomain: [
                    {rotationOffsetYMultiplier: 1},
                    {mirrorOffsetXMultiplier: (1/3)},
                    {
                    	rotationOffsetXMultiplier: 1,
                    	rotationOffsetYMultiplier: (1/2)
                    },
                ],
                X: {translationOffsetXMultiplier: (5/6)},
                Y: {translationOffsetYMultiplier: (1/2)},
            };
            scope.drawPattern();
        };

        /*
        p3m1 contains reflections and order-3 rotations.
        The axes of the reflections are again inclined at 60° to one another and
        all of the centers of rotation lie on the reflection axes.
        There are some glide-reflections.
        */
        scope.p3m1Handler = function() {
            scope.fundamentalDomainPathFunction = triangularGridFundamentalDomainSixth;
            scope.transforms = {
                FundamentalDomain: [
                    transforms.mirrorH,
                	transforms.order3Rotation,
                	transforms.order3Rotation
                ],
                X: transforms.translateH,
                Y: transforms.translateV
            };
            scope.transformOptions = {
                FundamentalDomain: [
                    {},
                    {rotationOffsetYMultiplier: (1/2)},
                    {rotationOffsetYMultiplier: (1/2)},
                ],
                X: {translationOffsetXMultiplier: 1},
                Y: {translationOffsetYMultiplier: (1/2)},
            };
            scope.drawPattern();
        };

        /*
        p6 has order 6 rotations.
        It also contains rotations of orders 2 and 3, but no reflections or glide-reflections.
        p6 Uses a triangular grid.
        */
        scope.p6Handler = function() {
            scope.fundamentalDomainPathFunction = regularTriangularGridFundamentalDomain;
            scope.transforms = {
                FundamentalDomain: [
                    transforms.order6Rotation,
                    transforms.order3Rotation
                ],
                X: transforms.translateH,
                Y: transforms.translateV
            };
            scope.transformOptions = {
                FundamentalDomain: [
                    {rotationOffsetXMultiplier: 1},
                    {rotationOffsetYMultiplier: (1/2)},
                ],
                X: {translationOffsetXMultiplier: (6/7)},
                Y: {translationOffsetYMultiplier: (1/2)},
            };
            scope.drawPattern();
        };

        /*
        p6m has rotations of order 2, 3, and 6 as well as reflections.
        The axes of reflection meet at all the centers of rotation.
        At the centers of the order 6 rotations, six reflection axes meet and are inclined at 30° to one another.
        There are some glide-reflections.
        It uses a triangular grid.
        */
        scope.p6mHandler = function() {
            scope.fundamentalDomainPathFunction = triangularGridFundamentalDomainSixth;
            scope.transforms = {
                FundamentalDomain: [
                	transforms.mirrorH,
                	transforms.order3Rotation,
                	transforms.order6Rotation
                ],
                X: transforms.translateH,
                Y: transforms.translateV
            };
            scope.transformOptions = {
                FundamentalDomain: [
                    {},
                    {
                        rotationOffsetXMultiplier: 1,
                        rotationOffsetYMultiplier: (1/2)
                    },
                    {
                        rotationOffsetXMultiplier: 1,
                        rotationOffsetYMultiplier: (1/2)
                    },
                ],
                X: {translationOffsetXMultiplier: 1},
                Y: {translationOffsetYMultiplier: (1/2)}
            };
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

            "p3": scope.p3Handler,
            "p31m": scope.p31mHandler,
            "p3m1": scope.p3m1Handler,

            "p6": scope.p6Handler,
            "p6m": scope.p6mHandler
        };

        scope.init = function() {
            if (handlers[scope.groupName])
                handlers[scope.groupName]();
        };
        scope.init();
    }};
};
