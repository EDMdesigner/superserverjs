var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var path = require("path");

var superdataServer = require("../../src/superdata-server");
var createGalleryRouter = superdataServer.router.gallery;
var createCrudRouter = superdataServer.router.crud;
var createFileProxy = superdataServer.proxy.file;
var createMongoProxy = superdataServer.proxy.mongo;

var app = express();
var port = 7357;
var mongoUrl = "mongodb://localhost:27017/testgallery";

var gallerySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	thumbUrl: {
		type: String
	}
});

var galleryModel = mongoose.model("TestGalleryItems", gallerySchema);

mongoose.connect(mongoUrl);

var fileProxy = createFileProxy({
	basePath: "./tmp",
	idProperty: "id"
});

var mongoProxy = createMongoProxy({
	model: galleryModel
});

app.use(cors());

app.use(function(req, res, next) {
	console.log("req.path", req.path);
	next();
});

app.use(bodyParser.json());

app.options("*", cors());

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/upload", function(req, res) {
	res.sendFile(path.join(__dirname + "/upload.html"));
});


app.get("/from-url", function(req, res) {
	res.sendFile(path.join(__dirname + "/fromUrl.html"));
});

app.use("/images", createCrudRouter({
	proxy: fileProxy
}));

app.use("/gallery", createGalleryRouter({
	createInfoObject: function(data) {
		return {
			name: data.id,
			url: "http://localhost:7357/images/" + data.id
		};
	},
	binaryProxy: fileProxy,
	infoProxy: mongoProxy,

	fileUploadProp: "file",
	fromUrlProp: "url"
}));

app.listen(port, function(err) {
	if (err) {
		return console.log(err);
	}

	console.log("Gallery server listening on port: ", port);
});
