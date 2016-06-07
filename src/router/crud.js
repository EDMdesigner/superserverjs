var express = require("express");

var checkProxy = require("../utils/checkProxy");
var checkBelongsTo = require("../utils/checkBelongsTo");

var objectify = require("../utils/objectify");
var intify = require("../utils/intify");
var createResponseHandler = require("../utils/responseHandler");

module.exports = function createCRUDRouter(config) {
	config = config || {};
	config.preHooks = config.preHooks || {};

	checkProxy({
		proxy: config.proxy,
		msgPrefix: "config.proxy"
	});

	checkBelongsTo(config.belongsTo);

	var proxy = config.proxy;
	var router = config.router || express.Router({mergeParams: true});

	function empty(req, res, next) {
		next();
	}

	router.get("/", config.preHooks.get ? config.preHooks.get : empty, function(req, res) {
		console.log(req.lol);

		var query = {};

		if (req.query) {
			query = req.query;
		}

		query.find = objectify(query.find);
		query.sort = objectify(query.sort);

		query.skip = intify(query.skip, 0);
		query.limit = intify(query.limit, 10);

		if (config.postHooks && config.postHooks.get) {
			proxy.read(query, req.filter, createResponseHandler(req, res, config.postHooks.get));
		} else {
			proxy.read(query, req.filter, createResponseHandler(req, res));
		}
	});

	router.post("/", config.preHooks.post ? config.preHooks.post : empty, function(req, res) {
		if (config.postHooks && config.postHooks.post) {
			proxy.createOne(req.body, req.filter, createResponseHandler(req, res, config.postHooks.post));
		} else {
			proxy.createOne(req.body, req.filter, createResponseHandler(req, res));
		}
	});

	router.get("/:id", config.preHooks.getOne ? config.preHooks.getOne : empty, function(req, res) {
		var id = req.params.id;

		if (config.postHooks && config.postHooks.getOne) {
			proxy.readOneById(id, req.filter, createResponseHandler(req, res, config.postHooks.getOne));
		} else {
			proxy.readOneById(id, req.filter, createResponseHandler(req, res));
		}
	});

	router.put("/:id", config.preHooks.put ? config.preHooks.put : empty, function(req, res) {
		if (config.postHooks && config.postHooks.put) {
			proxy.updateOneById(req.params.id, req.body, req.filter, createResponseHandler(req, res, config.postHooks.put));
		} else {
			proxy.updateOneById(req.params.id, req.body, req.filter, createResponseHandler(req, res));
		}
	});

	router.delete("/:id", config.preHooks.delete ? config.preHooks.delete : empty, function(req, res) {
		if (config.postHooks && config.postHooks.delete) {
			proxy.destroyOneById(req.params.id, req.filter, createResponseHandler(req, res, config.postHooks.delete));
		} else {
			proxy.destroyOneById(req.params.id, req.filter, createResponseHandler(req, res));
		}
	});

	return router;
};
