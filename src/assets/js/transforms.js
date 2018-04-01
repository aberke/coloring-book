/*
Transform functions for paths and path sets.
*/

const transforms = (function() {
    "use strict";


    function translateH(fdPathSet, pdPathSet, callback, options) {
        return doTransform(fdPathSet, pdPathSet, getTranslationH, callback, options);    
    }
    function translateV(fdPathSet, pdPathSet, callback, options) {
        return doTransform(fdPathSet, pdPathSet, getTranslationV, callback, options);    
    }

    function mirrorV(fdPathSet, pdPathSet, callback, options) {
        return doTransform(fdPathSet, pdPathSet, getMirrorV, callback, options); 
    }

    function mirrorH(fdPathSet, pdPathSet, callback, options) {
        return doTransform(fdPathSet, pdPathSet, getMirrorH, callback, options);
    }

    function glideH(fdPathSet, pdPathSet, callback, options) {
        return doTransform(fdPathSet, pdPathSet, getGlideH, callback, options);
    }

    function order2Rotation(fdPathSet, pdPathSet, callback, options) {
        return doRotation(fdPathSet, pdPathSet, 2, callback, options);
    }

    function order3Rotation(fdPathSet, pdPathSet, callback, options) {
        return doRotation(fdPathSet, pdPathSet, 3, callback, options);
    }

    function order4Rotation(fdPathSet, pdPathSet, callback, options) {
        return doRotation(fdPathSet, pdPathSet, 4, callback, options);
    }

    function order6Rotation(fdPathSet, pdPathSet, callback, options) {
        return doRotation(fdPathSet, pdPathSet, 6, callback, options);
    }

    // Private

    /*
    Rotates pathSet around origin point.
    Origin defaults to bottom right corner of pathSet.
    */
    function doRotation(fdPathSet, pdPathSet, rotations, callback, options={}) {
        const animateMs = options.animateMs || 0;
        const animateInterval = Math.max(animateMs/Math.round(rotations), 450);

        const bbox = fdPathSet.getBBox();
        let origin = {
            X: bbox.x2,
            Y: bbox.y2
        };
        if (!!options.rotationOffsetXMultiplier)
            origin.X = bbox.x + options.rotationOffsetXMultiplier*bbox.width;
        if (!!options.rotationOffsetYMultiplier)
            origin.Y = bbox.y + options.rotationOffsetYMultiplier*bbox.height;

        const transformString = getRotation(origin, rotations);

        let newFdPathSet = [];
        let newPdPathSet = [];
        // Use recursive routine to draw each rotated copy of pathSet
        let drawNextRotation = function(r) {
            if (r >= rotations)
                return callback(newFdPathSet, newPdPathSet);

            let nextFdPathSet, nextPdPathSet;
            if (newFdPathSet.length > 0) {
                nextFdPathSet = newFdPathSet[newFdPathSet.length - 1].clone();
                nextPdPathSet = newPdPathSet[newPdPathSet.length - 1].clone();
            } else {
                nextFdPathSet = fdPathSet;
                nextPdPathSet = pdPathSet;
            }
            
            let transformCallback = function() {
                // Add the new line and recursively call again for next rotation, r
                newFdPathSet.push(nextFdPathSet);
                newPdPathSet.push(nextPdPathSet);
                drawNextRotation(r + 1);
            };
            
            if (fdPathSet.length > 1) {
                options.animateMs = animateInterval;
                doComposedTransform(nextFdPathSet, nextPdPathSet, transformString, transformCallback, options);
            } else {
                nextFdPathSet.transform("..." + transformString);
                nextPdPathSet.animate({transform: "..." + transformString}, animateInterval, "<", transformCallback);
            }
        };
        drawNextRotation(1);
    }

    /*
    Helper function to perform the transform in animation.
    */
    function doTransform(fdPathSet, pdPathSet, transformGetter, callback, options={}) {
        let transformString = transformGetter(fdPathSet, options);
        if (hasRotation(fdPathSet))
            return doComposedTransform(fdPathSet, pdPathSet, transformString, callback, options);

        transformString = "..." + transformString;
        const animateMs = options.animateMs || 0;
        let animateCallback = function() {
            callback(fdPathSet, pdPathSet);
        };
        fdPathSet.transform(transformString)
        pdPathSet.animate({transform: transformString}, animateMs, "<", animateCallback);     
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
    function doComposedTransform(fdPathSet, pdPathSet, transformString, callback, options={}) {
        const animateMs = options.animateMs || 0;
        
        // The transformString is the transformation for the pathSet as a whole,
        // but apply it to each path individually.
        // Need to compose it within each path's previous transformation
        // matrix.

        // Must animate all elements in unison and apply callback only once
        // all animations are complete.
        let callbackCount = 0;
        let collector = function() {
            callbackCount += 1;
            if (callbackCount == fdPathSet.length)
                callback(fdPathSet, pdPathSet);
        };
        // Use .animate function for first element, and them animateWith
        // for the following elements.
        let syncElt, syncAnim; // animateWith needs element and animation to sync its animation with
        fdPathSet.forEach((fdElt, index) => {
            // Compute transform on fundamental domain pathset element, but apply to both
            // fundamental domain and pattern design path elements.
            let eltTransformString = getComposedTransform(fdElt, transformString);
            // Transform fundamental domain path element immediately and transform
            // pattern design element within animation.
            fdElt.transform(eltTransformString);

            let pdElt = pdPathSet[index];
            let animateParams = {transform: eltTransformString};
            let anim = Raphael.animation(animateParams, animateMs, "<", collector);
            if (!syncElt) {
                syncElt =pdElt;
                syncAnim = anim;
                pdElt.animate(anim);
            } else {
                pdElt.animateWith(syncElt, syncAnim, anim);  
            }
        });
    }

    function getComposedTransform(path, transformString) {
        // If there have been no previous transformations, then
        // there are none to reverse and can simply return the desired
        // transform.
        // If cannot get matrix because this is a set, give up for now <-- TODO: better
        if (!path.matrix || path.matrix.toTransformString().length == 0)
            return "..." + transformString;

        // b) get current transform matrix (m)
        let pathMatrix = path.matrix.clone();

        // c) get inverse of past transforms (-m)
        let pathMatrixInverse = path.matrix.clone().invert();

        // d) compose transformations
        // final transform application order:
        // inverse of previous transforms: (-m)
        // desired transform: (t)
        // previous transforms: (m)
        /*
        TODO: Use proper matrix multiplication.

        Hack until then...
            Problem: Want to perform complex transform that is multiple parts,
            but want it to animate as one seamless movement rather than the sequence
            of transformations composed.  i.e. Want final matrix transformation.
            Stupid solution: clone element want to transform, transform it ugly way without
            animation, grab the final transform matrix, delete cloned element, and then use
            final transform matrix to animate element we actually want to transform.
        */
        let composedTransformString = [
            matrix.getString(pathMatrixInverse),
            transformString,
            matrix.getString(pathMatrix)
        ].join(",");
        let pathClone = path.clone();
        pathClone.transform("..." + composedTransformString);
        let composedMatrixString = matrix.getString(pathClone.matrix);
        pathClone.remove();
        return composedMatrixString;
    }

    /*
    Constructor for horizontal translation transform string
    @pathSet: (Paper.path | Paper.set) to construct transformation from
    @options: (Object) dictionary of arguments
    Returns (String) transform
    */
    function getTranslationH(pathSet, options={}) {
        let width = pathSet.getBBox().width;
        let translateX = width*(options.translationOffsetXMultiplier || 1);
        return "T" + String(translateX) + ",0";
    }

    /*
    Constructor for horizontal translation transform string
    @pathSet: (Paper.path | Paper.set) to construct transformation from
    @options: (Object) dictionary of arguments
    Returns (String) transform
    */
    function getTranslationV(pathSet, options={}) {
        let height = pathSet.getBBox().height;
        let translateY = height*(options.translationOffsetYMultiplier || 1);
        return "T0," + String(translateY);
    }

    /*
    Constructor for glide reflection transformation string
    @pathSet: (Paper.path | Paper.set) to construct transformation from
    @options: (Object) dictionary of arguments
    Returns (String) transformation
    */
    function getGlideH(pathSet, options={}) {
        return getMirrorH(pathSet, options) + getTranslationH(pathSet, options);
    }

    /*
    Constructor for horizontal mirror transformation string.
    By default the mirror is on the bottom of the shape,
    not through the center.  

    @pathSet: (Paper.path | Paper.set) to construct transformation from
    @options: (Object) dictionary of arguments
    Returns (String) transformation
    */
    function getMirrorH(pathSet, options = {}) {
        let bbox = pathSet.getBBox();
        let mirrorY = bbox.y + (options.mirrorOffsetYMultiplier || 1)*bbox.height;
        return "S1,-1,0," + String(mirrorY);
    }

    /*
    Constructor for vertical mirror transform string.
    By default the mirror is on the side of the shape,
    not through the center. 

    @pathSet: (Paper.path | Paper.set) to construct transformation from
    @options: (Object) dictionary of arguments
    Returns (String) transform
    */
    function getMirrorV(pathSet, options={}) {
        /*
        Uses the Raphael transform Element.scale(sx, sy, [cx], [cy]) https://dmitrybaranovskiy.github.io/raphael/reference.html#Element.scale
        sx: (number) horisontal scale amount
        sy: (number) vertical scale amount
        cx: (number) x coordinate of the centre of scale
        cy: (number) y coordinate of the centre of scale
        */
        let bbox = pathSet.getBBox();
        let mirrorX = bbox.x + (options.mirrorOffsetXMultiplier || 1)*bbox.width;
        return "S-1,1," + String(mirrorX) + ",0";
    }

    /*
    Returns (string) transform for rotation of given rotational order around origin.
    */
    function getRotation(origin, rotationalOrder) {
        return getRotationByDegrees(origin, 360/rotationalOrder);
    }


    /*
    Returns (string) transform for rotation of given degrees order around origin.
    */
    function getRotationByDegrees(origin, rotateDegrees) {
        if (!isValidRotateDegrees(rotateDegrees)) {
            console.error("Invalid rotate degrees: ", rotateDegrees);
            return "";
        }
        return [
            "R" + String(rotateDegrees),
            origin.X,
            origin.Y,
        ].join(",");
    }


    /*
    (Private)
    Checks if passed in rotational degrees are valid.

    @param {string | number} degrees
    @returns {boolean}
    **/
    function isValidRotateDegrees(rotateDegrees) {
        return (0 <= Number(rotateDegrees));
    }

    return {
        // Fundamental domain transforms:
        order2Rotation: order2Rotation,
        order3Rotation: order3Rotation,
        order4Rotation: order4Rotation,
        order6Rotation: order6Rotation,
        glideH: glideH,
        mirrorV: mirrorV,
        mirrorH: mirrorH,
        translateH: translateH,
        translateV: translateV,

        // Other utility transformations
        getRotation: getRotation,
        getRotationByDegrees: getRotationByDegrees,

        // Utilities
        isValidRotateDegrees: isValidRotateDegrees
    };
}());
