
// TODO for testing only: remove
let bp0, bp1, bp2, bp3;

function setup() {
	let r4="R90,80,71"
	bp0 = BASEPATH.clone();
	bp1 = BASEPATH.clone().transform(r4);
	bp2 = BASEPATH.clone().transform(r4+r4);
	bp3 = BASEPATH.clone().transform(r4+r4+r4);

	WORKINGSET = PAPER.set().push(bp0,bp1,bp2,bp3);
}

/*

*/
const transforms = (function() {
    "use strict";


	function mirrorV(pathSet, callback, options={}) {
		return doTransform(pathSet, getMirrorV, callback, options);	
	}

    function mirrorH(pathSet, callback, options) {
    	return doTransform(pathSet, getMirrorH, callback, options);
    }

    function glideH(pathSet, callback, options) {
		return doTransform(pathSet, getGlideH, callback, options);
    }

    function order2Rotation(pathSet, callback, options) {
    	return doRotation(pathSet, 2, callback, options);
    }

    function order4Rotation(pathSet, callback, options) {
        return doRotation(pathSet, 4, callback, options);
    }

    // Private
    function doRotation(pathSet, rotations, callback, options={}) {
    	const animateMs = options.animateMs || 0;
    	
		const rotationDegrees = 360/rotations;
		const bbox = pathSet.getBBox();
        const origin = {
            X: bbox.x2 - (options.rotationOffsetX || 0),
            Y: bbox.y2 - (options.rotationOffsetY || 0)
        };
        let transform = getRotateDegreesTransformString(origin, rotationDegrees);

		// Use recursive routine to draw each rotated copy of pathSet
		let drawNextRotation = function(r) {
			if (r >= rotations)
				return callback(pathSet);

            let newPath = pathSet.items[r - 1].clone();
            let transformCallback = function() {
                // Add the new line and recursively call again for next rotation, r
                pathSet.push(newPath);
                drawNextRotation(r + 1);
            };

            let animateInterval = Math.max(animateMs/rotations, 450);
            newPath.animate({transform: transform}, animateInterval, "<", transformCallback);
        };

	    drawNextRotation(1);
    }

    /*
    Helper function to perform the transform in animation.
    */
    function doTransform(pathSet, transformGetter, callback, options={}) {
		if (hasRotation(pathSet))
			return doComposedTransform(pathSet, transformGetter, callback, options);

        const transformString = "..." + transformGetter(pathSet, options);
    	const animateMs = options.animateMs || 0;
    	let newPath = pathSet.clone();
    	let animateCallback = function() {
    		pathSet.push(newPath);
    		callback(pathSet);
    	};
        newPath.animate({transform: transformString}, animateMs, "<", animateCallback);   	
    }

	function hasRotation(pathSet) {
		let i;
		for (i=0; i<pathSet.length; i++) {
			let elt = pathSet.items[i];
			if (elt.type == "set" && hasRotation(elt))
				return true;
			if (!!elt.matrix && (elt.matrix.split().rotate > 0))
				return true;
		}
		return false;
	}

	/*
	doComposedTransform handles animating a set of paths that have
	previously been transformed.
	It takes a transform getter to apply to the set, gets the desired transformation,
	and then for each path of the set, it composes the desired transformation within
	the path and applies that composition.

	Necessary because Raphael Set objects do not properly handle the linear algebra
	of composed transformations for reflections.
	*/
	function doComposedTransform(pathSet, transformGetter, callback, options={}) {
		// Composed transformations look bad in animation because they are
		// not a fluid motion from the starting path to the end path.

		// Get the transformation for the pathSet as a whole,
		// but apply it to each path individually.
		// Need to compose it within each path's previous transformation
		// matrix.
		const transformString = transformGetter(pathSet, options);

		let newPaths = pathSet.clone();
	    newPaths.forEach((elt) => {
			const eltTransformString = "..." + getComposedTransform(elt, transformString, options);
			elt.transform(eltTransformString);
		    pathSet.push(elt);
		});
		return callback(pathSet);

		// OR IF DECIDE YOU CAN ANIMATE:

		// Must animate all elements in unison and call callback only once
		// all animations are complete.

		// let callbackCount = 0;
		// let collector = function() {
		// 	callbackCount += 1;
		// 	if (callbackCount == newPaths.length)
	 //    		callback(pathSet);
	 //    };
	 //    // Use .animate function for first element, and them animateWith
	 //    // for the following elements.
	 //    let syncElt, syncAnim; // animateWith needs element and animation to sync its animation with
	 //    newPaths.forEach((elt) => {
		// 	let eltTransformString = "..." + getComposedTransform(elt, transformString, options);
		// 	let animateParams = {transform: eltTransformString};
		//     let anim = Raphael.animation(animateParams, animateMs, "<", collector);
		//     if (!syncElt) {
		//     	syncElt = elt;
		//     	syncAnim = anim;
		//     	elt.animate(anim);
		//     } else {
		//     	elt.animateWith(syncElt, syncElt, anim);  
		//     }
		//     pathSet.push(elt);
		// });
	}

	function getComposedTransform(path, transformString, options={}) {
		// If there have been no previous transformations, then
		// there are none to reverse and can simply return the desired
		// transform.
		if (path.matrix.toTransformString().length == 0)
			return transformString;

		// b) get current transform matrix (m)
		let pathMatrix = path.matrix.clone();

		// c) get inverse of past transforms (-m)
		let pathMatrixInverse = path.matrix.clone().invert();

		// d) compose transformations
		// final transform application order:
		// inverse of previous transforms: (-m)
		// desired transform: (t)
		// previous transforms: (m)
		return [
			pathMatrixInverse.toTransformString(),
			transformString,
			pathMatrix.toTransformString()
		].join(",");
	}


    /*
    Constructor for the transformation string for order-2 rotation that extends pathSet
    in the horizontal direction.
    @pathSet: (Paper.path | Paper.set) to construct transformation from
    @options: Dict of optional items:

    Returns (String) transformation
    */
    function getOrder2RotationH(pathSet, options={}) {
        let bbox = pathSet.getBBox();
        let rotationOffsetX = options.rotationOffsetX || 0;
        let rotationOffsetY = options.rotationOffsetY || 0;
        let transformString = "R180," + String(bbox.x2 - rotationOffsetX) + "," + String(bbox.y2 - rotationOffsetY);

        return transformString;
    }

    /*
    Constructor for horizontal translation transform string
    @pathSet: (Paper.path | Paper.set) to construct transformation from
    @options:
        @gap: (Number) distance to translate past the width of the pathSet
    Returns (String) transform
    */
    function getTranslationH(pathSet, options={}) {
        let bbox = pathSet.getBBox();
        let transformX = bbox.width + (options.gap || 0);
        return "T" + String(transformX) + ",0"; // must use uppercase T
    }

    /*
    Constructor for horizontal translation transform string
    @pathSet: (Paper.path | Paper.set) to construct transformation from
    @options:
        @gap: (Number) distance to translate past the height of the pathSet
    Returns (String) transform
    */
    function getTranslationV(pathSet, options={}) {
        let bbox = pathSet.getBBox();
        let transformY = bbox.height + (options.gap || 0);
        return "T0," + String(transformY); // must use uppercase T
    }

    /*
    Constructor for glide reflection transformation string
    @pathSet: (Paper.path | Paper.set) to construct transformation from
    @options: (Object) dictionary of arguments:
        @mirrorOffset: (Number) distance from bottom of pathset to create H mirror
        @gap: (Number) distance to translate past the width of the pathSet
    Returns (String) transformation
    */
    function getGlideH(pathSet, options={}) {
        const mirrorOffset = options.mirrorOffset || 0;

        /*
        Uses the Raphael transform Element.scale(sx, sy, [cx], [cy]) https://dmitrybaranovskiy.github.io/raphael/reference.html#Element.scale
        sx: (number) horisontal scale amount
    	sy: (number) vertical scale amount
    	cx: (number) x coordinate of the centre of scale
    	cy: (number) y coordinate of the centre of scale
    		If cx & cy aren’t specified centre of the shape is used instead.
    	*/
        let bbox = pathSet.getBBox();
        let mirrorX = bbox.x;  // could be either x or x2
        let mirrorY = bbox.y2 - mirrorOffset;

        let transformString = "";
        // add mirror portion
        transformString += ("S1,-1," + String(mirrorX) + "," + String(mirrorY));
        // add translation
        transformString += getTranslationH(pathSet, options);
        return transformString;
    }

    /*
    Constructor for horizontal mirror transformation string.
    By default the mirror is on the bottom of the shape,
    not through the center.  

    @pathSet: (Paper.path | Paper.set) to construct transformation from
    @options:
        {boolean} centeredMirror - defaults to false.
    Returns (String) transformation
    */
    function getMirrorH(pathSet, options = {}) {
        let bbox = pathSet.getBBox();
        let mirrorX = 0;
        let mirrorY = (!!options.centeredMirror) ? (bbox.y1 + (1/2)*bbox.height) : bbox.y2;
        return [
        	"S1,-1,",
        	String(mirrorX),
        	String(mirrorY)
        ].join(",");
    }


    /*
    Constructor for vertical mirror transform string.
    By default the mirror is on the side of the shape,
    not through the center. 

    @pathSet: (Paper.path | Paper.set) to construct transformation from
    @options:
        {boolean} centeredMirror - defaults to false.
    Returns (String) transform
    */
    function getMirrorV(pathSet, options={}) {
        /*
        Uses the Raphael transform Element.scale(sx, sy, [cx], [cy]) https://dmitrybaranovskiy.github.io/raphael/reference.html#Element.scale
        sx: (number) horisontal scale amount
    	sy: (number) vertical scale amount
    	cx: (number) x coordinate of the centre of scale
    	cy: (number) y coordinate of the centre of scale
    		If cx & cy aren’t specified centre of the shape is used instead.
    	*/
        let bbox = pathSet.getBBox();
        let mirrorY = bbox.y2;
        let mirrorX = (!!options.centeredMirror) ? (bbox.x1 + (1/2)*bbox.width) : bbox.x2;
    	return "S-1,1," + String(mirrorX) + "," + String(mirrorY);
    }

    return {
    	getGlideH: getGlideH,
        getMirrorH: getMirrorH,
        getMirrorV: getMirrorV,
        getTranslationH: getTranslationH,
        getTranslationV: getTranslationV,
        getOrder2RotationH: getOrder2RotationH,

        // Fundamental domain transforms:
        order2Rotation: order2Rotation,
        order4Rotation: order4Rotation,
        glideH: glideH,
        mirrorV: mirrorV,
        mirrorH: mirrorH
    };
}());
