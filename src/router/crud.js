var express = require("express");

var checkProxy = require("../utils/checkProxy");
var checkBelongsTo = require("../utils/checkBelongsTo");

var objectify = require("../utils/objectify");
var intify = require("../utils/intify");
var createResponseHandler = require("../utils/responseHandler");
var createFilterObjFromParams = require("../utils/createFilterObjFromParams");

module.exports = function createCRUDRouter(config) {
	config = config || {};

	checkProxy({
		proxy: config.proxy,
		msgPrefix: "config.proxy"
	});

	checkBelongsTo(config.belongsTo);

	var proxy = config.proxy;
	var router = config.router || express.Router({mergeParams: true});

	router.get("/", function(req, res) {
		var filter = createFilterObjFromParams({
			belongsTo: config.belongsTo,
			params: req.params
		});

		var query = {};

		if (req.query) {
			query = req.query;
		}

		query.find = objectify(query.find);
		query.sort = objectify(query.sort);

		query.skip = intify(query.skip, 0);
		query.limit = intify(query.limit, 10);

		proxy.read(query, filter, createResponseHandler(res));
	});

	router.post("/", function(req, res) {
		var filter = createFilterObjFromParams({
			belongsTo: config.belongsTo,
			params: req.params
		});

		proxy.createOne(req.body, filter, createResponseHandler(res));
	});

	router.get("/:id", function(req, res) {
		var filter = createFilterObjFromParams({
			belongsTo: config.belongsTo,
			params: req.params
		});
		
		var id = req.params.id;

		proxy.readOneById(id, filter, createResponseHandler(res));
	});

	router.put("/:id", function(req, res) {
		var filter = createFilterObjFromParams({
			belongsTo: config.belongsTo,
			params: req.params
		});

		proxy.updateOneById(req.params.id, req.body, filter, createResponseHandler(res));
	});

	router.delete("/:id", function(req, res) {
		var filter = createFilterObjFromParams({
			belongsTo: config.belongsTo,
			params: req.params
		});

		proxy.destroyOneById(req.params.id, filter, createResponseHandler(res));
	});

	return router;
};
