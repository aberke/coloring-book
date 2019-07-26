/*
analytics.js

Google Analytics tracking for:
pageviews
events
 - redraws
*/

// Declared globally to allow proper setup.
var googleAnalytics;

const analytics = (function() {
    'use strict';

	// google analytics
	// should only be used when production.
	const HOST0 = 'coloring-book.co';
	const HOST1 = 'beautifulsymmetry.onl';
	function initTracking() {
	    if ((location.host.indexOf(HOST0)) < 0 && (location.host.indexOf(HOST1))) {
	      console.log('not logging to Google Analytics for non-production')
	      return;
	    }
	    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	    })(window,document,'script','https://www.google-analytics.com/analytics.js','googleAnalytics');

	    googleAnalytics('create', 'UA-43101146-6', 'auto');
	}


	/* Names the page used to associate analytics events to. */
	function getPage() {
		return location.pathname + location.hash + location.search;
	}


	function trackPageView() {
		if (!googleAnalytics)
			return;

		googleAnalytics('send', 'pageview', getPage());
	}


	/*
	Track redraw of type where type is:
	  - CircularTesselation
	  - Frieze
	  - some other string...
	*/
	function trackRedraw(type) {
		let page = getPage();
		if (!googleAnalytics)
			return;

		googleAnalytics('send', {
			hitType: 'event',
			eventCategory: type,
			eventAction: 'redraw',
			eventLabel: page,
		});
	}


    return {
        initTracking: initTracking,
        trackPageView: trackPageView,
        trackRedraw: trackRedraw
    };
}());
