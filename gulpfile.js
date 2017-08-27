
const gulp = require("gulp"),
  // pump is a wrapper to help handle/propogate errors
  pump = require("pump"),
  // babel compiles ES6 javascript to be compatible with older browsers
  babel = require("gulp-babel"),

  // for javascript linting
  jshint = require("gulp-jshint"),

  // For watching and rebuilding files
  watch = require("gulp-watch"),

  // Replaces pipe method and removes standard onerror handler on error event, which unpipes streams on error by default.
  // https://github.com/floatdrop/gulp-plumber
  plumber = require("gulp-plumber"),

  // For serving from gulp
  http = require("http"),

  ecstatic = require("ecstatic"),

  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  uglify = require("gulp-uglify");

const srcFiles = {
  js: "src/**/*.js",
  css: "src/**/*.css",
  img: "src/**/img/**",
  html: "src/**/*.html",

  bookPDF: "src/*.pdf"
};
const destination = "./dist";


/** Lint Tasks **/

gulp.task("lint", ["jslint"]);

gulp.task("jslint", function() {
  return gulp.src(srcFiles.js)
    .pipe(jshint())
    .pipe(jshint.reporter("default"));
});

/** Lint Tasks **/


/** Build Tasks **/

// Handle building all files in one task
gulp.task("all", function (cb) {
  pump([
    gulp.src([
        srcFiles.js,
        srcFiles.css,
        srcFiles.img,
        srcFiles.html,
        srcFiles.bookPDF,
      ]),
      // concatenate files in HTML
      gulpif("*.html", useref()),
       // transpile JS with babel
      gulpif('*.js', babel()),
      // minify JS
      // gulpif('*.js', uglify()),
      // .pipe(gulpif('*.css', minifyCss()))
      gulp.dest(destination)
    ],
    cb
  )
 });


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
