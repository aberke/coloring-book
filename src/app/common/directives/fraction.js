/**
Directive to format fractions.

Use:
------
<fraction>numerator/denominator</fraction>
***/
function fractionDirective() {
	return {
		restrict: "EA",
		// Not using the template because want to parse
		// <fraction>1/4</fraction>
		// if template string was used instead, then innerHTML to
		// parse would be that template string.
		// This is best, because sometimes fraction does not fully load otherwise when
		// relying on angular to format it, or takes too long to show up.
		link: function (scope, element) {

			let elt = element[0];
			let splitFraction = elt.innerHTML.split("/");
			if (splitFraction.length < 2)
				return;

			scope.numerator = splitFraction[0];
			scope.denominator = splitFraction[1];

			elt.innerHTML = "<span class='fraction'><sup>" + String(scope.numerator) + "</sup><span>&frasl;</span><sub>" + String(scope.denominator) + "</sub></span>";
		}
	};
}
