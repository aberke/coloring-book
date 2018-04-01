
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
            if (!scope.fundamentalDomainPath) {
                let origin = {
                    X: 0,
                    Y: 0,
                };
                // Generate the fundamental domain path once so that it can use random variables
                // and yet still look the same when it's redrawn by the wallpaperPattern
                scope.fundamentalDomainPath = scope.patternFunction(origin, scope.fundamentalDomainWidth, scope.fundamentalDomainHeight, scope.patternFunctionOptions);
            }
            scope.wallpaperPattern = new WallpaperPattern(scope.paper, scope.fundamentalDomainPath,
                                                            scope.transforms, scope.transformOptions,
                                                            scope.drawOptions);
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
                X: transforms.translateH,
                Y: transforms.translateV
            };

            scope.setupPaper();
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

            scope.setupPaper();
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
                X: transforms.translateH,
                Y: transforms.translateV
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
            scope.transformOptions = {
                FundamentalDomain: [
                	{},
                    {rotationOffsetYMultiplier: (1/2)}
                ]
            };
            
            scope.setupPaper();
            scope.drawPattern();
        };

        /*
        p3 has order-3 rotations and no reflections.
		___     
	  /_\ /_\___  
	  \ / \ /\ /\
		--- ------     
	  /_\ /_\/_\/  
	  \ / \ /  
		---   
        */
        scope.p3Handler = function() {
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
                    {rotationOffsetYMultiplier: 1},
                    {rotationOffsetYMultiplier: (1/2)},
                ],
                X: {translationOffsetXMultiplier: 1},
                Y: {translationOffsetYMultiplier: (1/2)},
            };
            
            scope.setupPaper();
        	// TODO: implement use of underlying grids and then draw
        	// pattern functions on top of grid
        	let origin = {X: 0, Y: 0};
        	scope.fundamentalDomainPath = triangularGridFundamentalDomainSixth(origin, scope.fundamentalDomainWidth);
            scope.drawPattern();
        };

        /*
        p31m has reflections with axes inclined at 60 degrees to one another, and order 3 rotations.
        Some of the centers of rotation lie on the reflection axes, and some do not.
        There are some glide-reflections.
		*/
		scope.p31mHandler = function() {
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
            
            scope.setupPaper();
        	// TODO: implement use of underlying grids and then draw
        	// pattern functions on top of grid
        	let origin = {X: 0, Y: 0};
        	scope.fundamentalDomainPath = triangularGridFundamentalDomainSixth(origin, scope.fundamentalDomainWidth);
            scope.drawPattern();
        };

		/*
		p3m1 contains reflections and order-3 rotations.
		The axes of the reflections are again inclined at 60° to one another and
		all of the centers of rotation lie on the reflection axes.
		There are some glide-reflections.
		*/
        scope.p3m1Handler = function() {
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
            
            scope.setupPaper();
        	// TODO: implement use of underlying grids and then draw
        	// pattern functions on top of grid
        	let origin = {X: 0, Y: 0};
        	scope.fundamentalDomainPath = triangularGridFundamentalDomainSixth(origin, scope.fundamentalDomainWidth);
            scope.drawPattern();
        };

        /*
		p6 has order 6 rotations.
		It also contains rotations of orders 2 and 3, but no reflections or glide-reflections.
		p6 Uses a triangular grid.
        */
        scope.p6Handler = function() {
            // TODO: implement use of underlying grids and then draw
            // pattern functions on top of grid
            let origin = {X: 0, Y: 0};
            scope.fundamentalDomainPath = triangularGridFundamentalDomainSixth(origin, scope.fundamentalDomainWidth);
            scope.transforms = {
                FundamentalDomain: [
                	transforms.order3Rotation,
                	transforms.order6Rotation
                ],
                X: transforms.translateH,
                Y: transforms.translateV
            };
            scope.transformOptions = {
                FundamentalDomain: [
                    {rotationOffsetYMultiplier: 1},
                    {rotationOffsetYMultiplier: (1/2)},
                ],
                X: {translationOffsetXMultiplier: 1},
                Y: {translationOffsetYMultiplier: (1/2)},
            };
            
            scope.setupPaper();
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
            // TODO: implement use of underlying grids and then draw
            // pattern functions on top of grid
            let origin = {X: 0, Y: 0};
            scope.fundamentalDomainPath = triangularGridFundamentalDomainSixth(origin, scope.fundamentalDomainWidth);
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
