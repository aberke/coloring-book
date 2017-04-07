/**
Creates transform string for rotating shape.

@param {X: number, Y: number} origin point to rotate around
@param {number} rotationalOrder

@returns {String} transform string
*/
function getRotationTransformString(origin, rotationalOrder) {
	return [
		"...R" + String(360/rotationalOrder),
		String(origin.X),
		String(origin.Y),
	].join(",");
};
