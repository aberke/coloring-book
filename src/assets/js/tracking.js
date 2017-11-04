'use strict';

/*
tracking.js

Google Analytics tracking for:
pageviews
events
 - redraws
*/

// google analytics
// should only be used when production.
var ga;


function initTracking() {
    if (location.host.indexOf('coloring-book.co') < 0) {
      console.log('not logging to Google Analytics for non-production')
      return;
    }
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-43101146-6', 'auto');
}


function trackPageView() {
	if (!ga)
		return;

	ga('send', 'pageview', location.hash);
}


/*
Track redraw of type where type is:
  - CircularTesselation
  - Frieze
  - some other string...
*/
function trackRedraw(type) {
	let page = location.hash;
	if (!ga)
		return;

	ga('send', {
		hitType: 'event',
		eventCategory: type,
		eventAction: 'redraw',
		eventLabel: page,
	});
}
