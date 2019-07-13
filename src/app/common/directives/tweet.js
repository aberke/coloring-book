/**
Directive for tweet button.

Use:
------
<div tweet class="share-btn"></div>
***/
function tweetDirective($timeout) {
    return {
        restrict: "EA",
        link: function(scope, element, attr) {
            $timeout(function() {
                twttr.widgets.createShareButton(
                    "http://www.coloring-book.co",
                    element[0],
                    function(el) {}, {
                        count: "none",
                        hashtags: "colorByMath",
                        text: "Math is about more than just numbers. In this 'book' the language of math is visual, shown in shapes and patterns. This is a coloring book about group theory."
                    }
                );
            });
        }
    };
}
