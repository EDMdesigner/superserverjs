var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var path = require("path");

var superdataServer = require("../../src/main");
var createGalleryRouter = superdataServer.router.gallery;
var createCrudRouter = superdataServer.router.crud;
var createS3Proxy = superdataServer.proxy.s3;
var createMongoProxy = superdataServer.proxy.mongo;

var app = express();
var port = 7357;
var mongoUrl = "mongodb://localhost:27017/testgallery";

var gallerySchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	thumbUrl: {
		type: String
	}
});

var galleryModel = mongoose.model("TestGalleryItems", gallerySchema);

mongoose.connect(mongoUrl);

var s3Proxy = createS3Proxy({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: "us-east-1",
	bucket: "edm-testbucket"
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
	proxy: s3Proxy
}));

app.use("/gallery", createGalleryRouter({
	createInfoObject: function(data) {
		return {
			title: data.file.name,
			id: data.id,
			createdAt: data.createdAt,
			url: data.Location
		};
	},
	calculateBinaryId: function(data) {
		var url = data.url;
		var binaryId = url.split("/");

		binaryId = binaryId[binaryId.length - 1];
		return binaryId;
	},
	binaryProxy: s3Proxy,
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
