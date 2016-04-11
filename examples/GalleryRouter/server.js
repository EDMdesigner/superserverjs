var express = require("express");
var mongoose = require("mongoose");
var superdataServer = require("../../src/superdata-server");
var createGalleryRouter = superdataServer.galleryRouter;
var createFileProxy = superdataServer.proxy.file;
var createMongoProxy = superdataServer.proxy.mongo;
var app = express();
var port = 3011;
var mongoUrl = "mongodb://localhost:27017/gallery";

mongoose.connect(mongoUrl);
var galleryModel = require("../../src/models/gallery");

var fileProxy = createFileProxy({
	basePath: "./tmp",
	idProperty: "id"
});

var mongoProxy = createMongoProxy({
	model: galleryModel
});

app.use("/gallery", createGalleryRouter({
	binaryProxy: fileProxy,
	infoProxy: mongoProxy
}));

app.listen(port, function(err) {
	if (err) {
		console.log(err);
	}

	console.log("Gallery server listening on port: ", port);
});
