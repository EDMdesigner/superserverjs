var express = require("express");
var checkProxy = require("./checkProxy");

var routerUtils = require("./routerUtils");

var objectify = routerUtils.objectify;
var intify = routerUtils.intify;
var createResponseHandler = routerUtils.createResponseHandler;

module.exports = function createGalleryRouter(config) {
	config = config || {};

	var router = config.router || express.Router();

	checkProxy({
		proxy: config.binaryProxy,
		msgPrefix: "config.binaryProxy"
	});

	checkProxy({
		proxy: config.infoProxy,
		msgPrefix: "config.infoProxy"
	});

	//var binaryProxy = config.binaryProxy;
	var infoProxy = config.infoProxy;
	
	router.get("/", function(req, res) {
		var query = req.query || {};

		query.find = objectify(query.find);
		query.sort = objectify(query.sort);

		query.skip = intify(query.skip, 0);
		query.limit = intify(query.limit, 10);

		infoProxy.read(query, createResponseHandler(res));
	});

	/*
	router.post("/", function(req, res) {
		//createOne
	});

	router.get("/:id", function(req, res) {
		//readOneById
	});

	router.put("/:id", function(req, res) {
		//updateOneById
	});

	router.delete("/:id", function(req, res) {
		//destroyOneById
	});
*/

	return router;
};
