var gulp = require("gulp");
var createSuperGulp = require("edm-supergulp");

var superGulp = createSuperGulp({
	gulp: gulp
});

var packageJson = require("./package.json");

var jsFiles = [
	"./*.js",
	"./src/**/*.js",
	"./spec/**/*.js"
];

var jsonFiles = [
	".jshintrc",
	".jscsrc",
	"./package.json",
	"./src/**/*.json",
	"./spec/**/*.json"
];

var specFiles = [
	"spec/**/*Spec.js"
];

var sourceFiles = [
	"src/**/*.js"
];

superGulp.taskTemplates.initBackendTasks({
	packageJson: packageJson,
	coverage: 60,
	files: {
		js: jsFiles,
		json: jsonFiles,
		spec: specFiles,
		source: sourceFiles
	}
});
