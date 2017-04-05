/* 
This is to fix the issue of angular partials not executing scripts

Borrowed from: http://stackoverflow.com/questions/12197880/angularjs-how-to-make-angular-load-script-inside-ng-include

Simply add this file, load ngLoadScript module as application dependency and use type="text/javascript-lazy" as type for script you which to load lazily in partials:
<script type="text/javascript-lazy">
  console.log("It works!");
</script>

*/
(function (ng) {
  'use strict';

  var app = ng.module('ngLoadScript', []);

  app.directive('script', function() {
    return {
      restrict: 'E',
      scope: false,
      link: function(scope, elem, attr) {
        if (attr.type === 'text/javascript-lazy') {
          var code = elem.text();
          var f = new Function(code);
          f();
        }
      }
    };
  });

}(angular));
