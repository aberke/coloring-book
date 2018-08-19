/*
Collection of utility functions.
*/


const util = (function() {
    'use strict';


    const SYMMETRY_STROKE_WIDTH = 5;


    /*
    Adds a list of class names to each element in a pathSet.
    */
    function addClassNamesToElements(pathSet, classNames) {
        flattenedList(pathSet).forEach(elt => { 
            classNames.forEach(cn => {
                if (!elt.node.className.baseVal)
                    elt.node.className.baseVal = cn;
                else
                    elt.node.className.baseVal += (" " + cn);
            });
        });
    }

    /*
    Returns a flattened list of elements.
    Items in toFlatten may be Paper.Set() objects.
    These objects have a forEach function but not a concat function - so only forEach is used.
    */
    function flattenedList(toFlatten) {
        if (!toFlatten)
            return [];
        if (!toFlatten.forEach)
            return [toFlatten];
        
        let toReturn = [];
        toFlatten.forEach((a) => {
            flattenedList(a).forEach((b) => { toReturn.push(b); });
        });
        return toReturn;
    }

    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    /**
    Draws a diamond to represent the order-2 rotation point.

    @param {Paper} paper to draw on
    @param {X: Number, Y: Number} point to draw around
    @param {Number} size (width) of point to draw

    @returns {paper.path} path of drawn diamond.
    **/
    function drawOrder2RotationPoint(paper, point, size=1) {
        let pathList = [
            ["M", point.X - size, point.Y],
            ["L", point.X, point.Y - 2*size],
            ["L", point.X + size, point.Y],
            ["L", point.X, point.Y + 2*size],
            ["Z"]
        ];
        return paper.path(pathList);
    }


    /**
    Draws set of order-2 rotations.

    @param {Paper} paper to draw on
    @param {X: Number, Y: Number} startPoint to draw around
    @param {Number} gapX as horizontal distance between points drawn
    @param {Number} gapY as vertical distance between points drawn
        - TODO: Use for wallpaper patterns

    @returns {paper.set()} set of drawn points.
    **/
    function drawOrder2RotationPointSet(paper, startPoint, gapX, gapY=0, maxIterationsX=null, maxIterationsY=null) {    
        let set = paper.set();

        let canvasSize = paper.getSize().height,
            canvasWidth = paper.getSize().width;
        let point = startPoint;
        let i = 0;
        while (point.X < canvasWidth) {
            if (maxIterationsX && i >= maxIterationsX)
                break;

            set.push(drawOrder2RotationPoint(paper, point));
            
            point.X += gapX;
            i += 1;
        }
        return set;
    }


    /**
     * Draws set of Y-Axes of the same type
     * @param {Paper} paper to draw on
     * @param {number} starting X coordinate
     * @param {number} gap between axes
     * @returns {paper.Set} set of paths
    **/
    function drawYAxesSet(paper, startX, gap) {
        let canvasHeight = paper.getSize().height;
        let set = paper.set();
        let X = startX;
        while (X < paper.getSize().width) {
            let pathString = 'M' + String(X) + ',0 v' + String(canvasHeight);
            let path = paper.path(pathString);
            set.push(path);

            X += gap;
        }
        return set;
    }

    /**
     * Draws set of X-Axes of the same type
     * @param {Paper} paper to draw on
     * @param {number} starting Y coordinate
     * @param {number} gap between axes
     * @param {number} count: number of axes to draw -- defaults to 1
     * @returns {paper.Set} set of paths
    **/
    function drawXAxesSet(paper, startY, gap, count) {
        count = count || 1;
        let canvasWidth = paper.getSize().width;
        let set = paper.set();
        let Y = startY;

        for (let i=0; i<count; i++) {
            let pathString = 'M0,' + String(Y) + ' h' + String(canvasWidth);
            let path = paper.path(pathString);
            set.push(path);
            Y += gap;
        }
        return set;
    }

    /**
     * Draws X-axis
     * @param {Paper} paper to draw on
     * @param {number} starting Y coordinate
     * @returns {paper.Path}
    **/
    function drawXaxis(paper, y) {
        let paperWidth = paper.getSize().width;
        let xAxisPathString = "M0," + String(y) + " l" + String(paperWidth) + ",0";
        let xAxisPath = paper.path(xAxisPathString);
        return xAxisPath;
    }


    function getRotateFn(pathSet, origin, rotateDegrees, animateMs=3000) {
        if (rotateDegrees <= 0 || !transforms.isValidRotateDegrees(rotateDegrees))
            return; 
        let transformString = "..." + transforms.getRotationByDegrees(origin, rotateDegrees);
        return function() {
            if (pathSet.isRotating)
                return; // avoid rotating if already rotating

            pathSet.isRotating = true;
            pathSet.animate({transform: transformString}, animateMs, function() {
                pathSet.isRotating = false;
            });
        };
    }

    function getReflectFn(pathSet, origin, mirror, animateMs=3000) {
        let transformString = "...";
        if (mirror === "V")
            transformString += transforms.getMirrorVString(origin.X, origin.Y);
        else if (mirror === "H")
            transformString += transforms.getMirrorHString(origin.X, origin.Y);
        else
            return;

        return function() {
            if (pathSet.isReflecting)
                return; // avoid reflecting if already reflecting

            pathSet.isReflecting = true;
            pathSet.animate({transform: transformString}, animateMs, function() {
                pathSet.isReflecting = false;
            });
        };
    }


    return {
        addClassNamesToElements: addClassNamesToElements,
        flattenedList: flattenedList,
        isNumeric: isNumeric,
        
        // Symmetry set drawing
        drawOrder2RotationPointSet: drawOrder2RotationPointSet,
        drawYAxesSet: drawYAxesSet,
        drawXaxis: drawXaxis,

        // Function getters
        getRotateFn: getRotateFn,
        getReflectFn: getReflectFn,
    };
}());
