
const transforms = (function() {
    "use strict";

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
        let mirrorY = bbox.y2;

        let transformString = "";
        // add mirror portion
        transformString += ("S1,-1," + String(mirrorX) + "," + String(mirrorY - mirrorOffset));
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
        let mirrorX = bbox.x;  // could be either x or x2
        let mirrorY = (!!options.centeredMirror) ? (bbox.y1 + (1/2)*bbox.height) : bbox.y2;
        return "S1,-1," + String(mirrorX) + "," + String(mirrorY);
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
        let mirrorY = bbox.y; // same as either y or y2
        let mirrorX = (!!options.centeredMirror) ? (bbox.x1 + (1/2)*bbox.width) : bbox.x2;
    	return "S-1,1," + String(mirrorX) + "," + String(mirrorY);
    }

    return {
        getGlideH: getGlideH,
        getMirrorH: getMirrorH,
        getMirrorV: getMirrorV,
        getTranslationH: getTranslationH,
        getTranslationV: getTranslationV,
        getOrder2RotationH: getOrder2RotationH
    };
}());
