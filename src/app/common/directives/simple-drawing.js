/*
Use
--------
<simple-drawing
    draw-function="nameOfFunctionToCall"
    draw-function-options={object}
></simple-drawing>
**/
function simpleDrawingDirective($window) {
    return {
        restrict: "EAC", //E = element, A = attribute, C = class, M = comment
        scope: {
            // Binds directive's scope to the following attributes.
            // '?' indicates that the attribute is optional.
            drawFunction: "@",
            drawFunctionOptions: "@?",
        },
        link: function (scope, element, attrs) {
            //DOM manipulation

            let drawFunction = $window[scope.drawFunction];
            let drawFunctionOptions = JSON.parse(scope.drawFunctionOptions || "{}");

            // get the element to draw canvas paper on
            let elt = element[0];
            let width = elt.clientWidth;
            let height = elt.clientHeight;
            // add the canvas class in case not already there.
            elt.className += " canvas";
            // create the canvas paper and define it's size
            let paper = new Raphael(elt);
            let origin = {X: 0, Y: 0};
            // Draw.
            scope.pathList = drawFunction(origin, width, height, drawFunctionOptions);
            scope.path = paper.path(scope.pathList);
        }
    }
};
