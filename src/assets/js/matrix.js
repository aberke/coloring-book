/*
Collection of SVG and Raphael Matrix utility functions.

[a c e]
[b d f]
[0 0 1]
For matrix transforms, see W3 SVG spec:
https://www.w3.org/TR/SVG/coords.html#InterfaceSVGMatrix

*/


const matrix = (function() {
    "use strict";

    /*
    The transform string returned by Raphael.matrix.toTransformString is
    incorrect.  Returning the matrix itself is the most precise mechanism for
    performing transformations.
    */
    function getString(matrix) {
        return [
            "m",
            matrix.a,
            matrix.b,
            matrix.c,
            matrix.d,
            matrix.e,
            matrix.f,
        ].join(",");
    }

    /*
    Multiplies two Raphael.Matrix objects that represent path transforms.
    Returns result Raphael.matrix(a, b, c, d, e, f)
    */
    function rightMultiply(m1, m2) {
        return Raphael.matrix(
            m1.a*m2.a + m1.c*m2.b + m1.e*0, // a
            m1.b*m2.a + m1.d*m2.b + m1.f*0, // b
            m1.a*m2.c + m1.c*m2.d + m1.e*0, // c
            m1.b*m2.c + m1.d*m2.d + m1.f*0, // d
            m1.a*m2.e + m1.c*m2.f + m1.e*1, // e
            m1.b*m2.e + m1.d*m2.f + m1.f*1, // f
        );
    }

    return {
        getString: getString,
        rightMultiply: rightMultiply
    }
})();
