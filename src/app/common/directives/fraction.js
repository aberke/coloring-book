/**
Directive to format fractions.

Use:
------
<fraction numerator={number} denominator={number}></fraction>
***/
function fractionDirective() {
	return {
		restrict: "EA",
		scope: {
			numerator: "@",
			denominator: "@",
		},
		template: "<span class='fraction'><sup>{{numerator}}</sup><span>&frasl;</span><sub>{{denominator}}</sub></span>"
	}
}
