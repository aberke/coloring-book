/*
Main commands for development:
$ gulp build
$ gulp serve

$ gulp lint

About:
  I use gulp to build and compile the src files and then put the compiled
  files in the /dist directory.
  src/ is there files are developed
  dist/ is generated from builds and is where files are served from

  I include the JS files in HTML and then use user-ref to concatenate them
  JS files are also transpiled with babel + minified with uglify.

*/

const gulp = require("gulp"),
  // pump is a wrapper to help handle/propogate errors
  pump = require("pump"),
  // babel compiles ES6 javascript to be compatible with older browsers
  babel = require("gulp-babel"),

  // for javascript linting
  jshint = require("gulp-jshint"),

  // For watching and rebuilding files
  watch = require("gulp-watch"),

  // For serving from gulp
  http = require("http"),

  ecstatic = require("ecstatic"),

  // Makes angular code safe for minification by adding DI Annotation
  // (Note: I could have just written better Angular JS code to not need this)
  ngAnnotate = require("gulp-ng-annotate"),

  util = require("gulp-util"),
  useref = require("gulp-useref"),
  gulpif = require("gulp-if"),

  // For minification
  cleanCSS = require("gulp-clean-css"),
  uglify = require("gulp-uglify");

const srcFiles = {
  js: "src/**/*.js",
  css: "src/**/*.css",
  icons: "src/**/icons/**",
  img: "src/**/img/**",
  html: "src/**/*.html",

  bookPDF: "src/*.pdf"
};
const destination = "./dist";

var production = !!util.env.production;


/** Lint Tasks **/

gulp.task("lint", ["jslint"]);

gulp.task("jslint", function() {
  return gulp.src(srcFiles.js)
    .pipe(jshint())
    .pipe(jshint.reporter("default"));
});

/** Lint Tasks **/


/** Build Tasks **/

/*
Handle building all files in one task.
This allows contatenating files in HTML with userref via build blocks in HTML.
  - Assets inside the build blocks concatenated and passed through in the
    stream as well.
*/
gulp.task("all", function (cb) {
  pump([
    gulp.src([
        srcFiles.js,
        srcFiles.css,
        srcFiles.icons,
        srcFiles.img,
        srcFiles.html,
        srcFiles.bookPDF,
      ]),

      // For production only: Concatenate files in HTML build blocks.
      // They then get piped downstream for further processing,
      // as well as the files within the build blocks that were
      // concatenated.
      gulpif((production && "*.html"), useref()),

      // Dealing with JS:
      // Transpile JS with babel
      gulpif("*.js", babel()),

      // For production only: minify files.
      // Angular DI annotation:
      // Why?: This safeguards your code from any
      // dependencies that may not be using minification-safe practices.
      // (i.e. in order to overcome injection errors that were occurring after minification.)
      // I had this problem:
      // https://stackoverflow.com/questions/38768152/angularjs-minification-process
      // Another reference:
      // http://bguiz.github.io/js-standards/angularjs/minification-and-annotation/
      gulpif(production && "*.js", ngAnnotate()),
      // minify JS:
      gulpif(production && "*.js", uglify()),
      gulpif(production && "*.css", cleanCSS()),

      // Always: send file to destination directory after processing.
      gulp.dest(destination)
    ],
    cb
  )
 });


// Watch for when file changes occur to these files, and then rebuild with 'all' task.
gulp.task("watch", function () {
  gulp.watch([
    srcFiles.js,
    srcFiles.css,
    srcFiles.img,
    srcFiles.html,
    srcFiles.bookPDF
  ], ["all"]);
});


gulp.task("serve", ["watch"], function() {
  const port = process.env.PORT || 5000
  http.createServer(
    ecstatic({ root: __dirname + "/dist" })
  ).listen(port);
  console.log("Listening on port ", port);
});


gulp.task("build", ["all"]);

gulp.task("default", ["build", "lint"]);
