
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
  ecstatic = require("ecstatic");

  // concat = require("gulp-concat"); 
  // uglify = require("gulp-uglify");

const srcFiles = {
  js: ["src/**/*.js"],
  css: ["src/**/*.css"],
  img: ["src/**/img/**"],
  html: ["src/**/*.html"],

  bookPDF: ["src/*.pdf"]
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

gulp.task("img", function() {
  gulp.src(srcFiles.img)
    .pipe(gulp.dest(destination));
});

gulp.task("css", function() {
	gulp.src(srcFiles.css)
		.pipe(gulp.dest(destination));
});

gulp.task("html", function() {
	gulp.src(srcFiles.html)
		.pipe(gulp.dest(destination));
});

gulp.task("bookPDF", function() {
  gulp.src(srcFiles.bookPDF)
    .pipe(gulp.dest(destination));
});

gulp.task("js", function (cb) {
  pump([
      gulp.src(srcFiles.js),
      babel(),
      // TODO: after linting is all set up
      // use this blogpost: http://codehangar.io/concatenate-and-minify-javascript-with-gulp/
      // concat("scripts.js"),
      // uglify(),
      gulp.dest(destination)
    ],
    cb
  );
});
/** Build Tasks **/


gulp.task("watch", function () {
  gulp.watch(srcFiles.js, ["js"]);
  gulp.watch(srcFiles.css, ["css"]);
  gulp.watch(srcFiles.img, ["img"]);
  gulp.watch(srcFiles.html, ["html"]);
  gulp.watch(srcFiles.bookPDF, ["bookPDF"]);
});


gulp.task("serve", ["watch"], function() {
  const port = process.env.PORT || 5000
  http.createServer(
    ecstatic({ root: __dirname + "/dist" })
  ).listen(port);
  console.log("Listening on port ", port);
});


gulp.task("build", ["img", "css", "html", "js", "bookPDF"]);

gulp.task("default", ["build", "lint"]);
