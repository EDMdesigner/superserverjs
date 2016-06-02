var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var path = require("path");

var superdataServer = require("../../src/main");
var createCrudRouter = superdataServer.router.crud;
var createMongoProxy = superdataServer.proxy.mongo;

var app = express();
var port = 7357;
var mongoUrl = "mongodb://localhost:27017/testgallery";

var gallerySchema = new mongoose.Schema({
	user: {
		type: String,
		required: true
	},
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

app.use("/user/:userId/galery", createCrudRouter({
	proxy: mongoProxy,
	belongsTo: [
			{
				param: "userId",
				prop: "user"
			}
		]
}));


app.listen(port, function(err) {
	if (err) {
		return console.log(err);
	}

	console.log("Gallery server listening on port: ", port);
});
