var gulp = require("gulp");
var jscs = require("gulp-jscs");
var jshint = require("gulp-jshint");
var stylish = require("gulp-jscs-stylish");
var jsonlint = require("gulp-jsonlint");
var jasmine = require("gulp-jasmine");

var jsFiles = [
	"./**/*.js",
	"!node_modules/**/*",
	"!./**/*.built.js"
];

var jsonFiles = [
	".jshintrc",
	".jscsrc",
	"!node_modules/**/*",
	"./**/*.json"
];

// JSON lint
// ==================================================
gulp.task("jsonlint", function() {
	return gulp.src(jsonFiles)
		.pipe(jsonlint())
		.pipe(jsonlint.failOnError());
});


// JS Hint
// ==================================================
gulp.task("jshint", function() {
	return gulp.src(jsFiles)
		.pipe(jshint(".jshintrc"))
		.pipe(jshint.reporter("jshint-stylish"))
		.pipe(jshint.reporter("fail"));
});


// JS CodeStyle
// ==================================================
gulp.task("jscs", function() {
	return gulp.src(jsFiles)
		.pipe(jscs({
			configPath: ".jscsrc",
			fix: true
		}))
		.pipe(stylish())
		.pipe(jscs.reporter("fail"));
});


// Jasmine
// ==================================================
gulp.task("jasmine", function() {
	return gulp.src([
		"spec/**/*.js"
	])
	.pipe(jasmine());
});


gulp.task("test", ["jsonlint", "jshint", "jscs"]);
