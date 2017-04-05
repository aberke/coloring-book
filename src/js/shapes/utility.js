"use-strict";


/**
Creates transform string for rotating shape.

@param {X: number, Y: number} origin point to rotate around
@param {number} rotationalOrder

@returns {String} transform string
*/
function getRotationTransformString(origin, rotationalOrder) {
	rotationDegrees = 360/rotationalOrder;
	return rotationTransformString = [
		"...R" + String(rotationDegrees),
		String(origin.X),
		String(origin.Y),
	].join(",");
}

