var express = require("express");

var checkProxy = require("../utils/checkProxy");
var objectify = require("../utils/objectify");
var intify = require("../utils/intify");
var createResponseHandler = require("../utils/responseHandler");

module.exports = function createCRUDRouter(config) {
	config = config || {};

	checkProxy({
		proxy: config.proxy,
		msgPrefix: "config.proxy"
	});

	var proxy = config.proxy;
	var router = config.router || express.Router();

	router.get("/", function(req, res) {
		var query = {}; //TODO sophisticate this!

		if (req.query) {
			query = req.query;
		}

		query.find = objectify(query.find);
		query.sort = objectify(query.sort);

		query.skip = intify(query.skip, 0);
		query.limit = intify(query.limit, 10);

		proxy.read(query, createResponseHandler(res));
	});

	router.post("/", function(req, res) {
		proxy.createOne(req.body, createResponseHandler(res));
	});

	router.get("/:id", function(req, res) {
		var id = req.params.id;
		proxy.readOneById(id, createResponseHandler(res));
	});

	router.put("/:id", function(req, res) {
		proxy.updateOneById(req.params.id, req.body, createResponseHandler(res));
	});

	router.delete("/:id", function(req, res) {
		proxy.destroyOneById(req.params.id, createResponseHandler(res));
	});

	return router;
};
