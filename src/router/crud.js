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

	function get(req, res) {
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
	}

	var getParams = ["/"];

	if (config.preHooks.get) {
		if (typeof config.preHooks.get === "function") {
			getParams.push(config.preHooks.get);
		} else if (config.preHooks.get instanceof Array) {
			getParams = getParams.concat(config.preHooks.get);
		} else {
			throw new Error("config.preHooks.get must be a function or Array");
		}
	}

	getParams.push(get);
	router.get.apply(router, getParams);


	function post(req, res) {
		if (config.postHooks && config.postHooks.post) {
			proxy.createOne(req.body, req.filter, createResponseHandler(req, res, config.postHooks.post));
		} else {
			proxy.createOne(req.body, req.filter, createResponseHandler(req, res));
		}
	}

	var postParams = ["/"];

	if (config.preHooks.post) {
		if (typeof config.preHooks.post === "function") {
			postParams.push(config.preHooks.post);
		} else if (config.preHooks.post instanceof Array) {
			postParams = postParams.concat(config.preHooks.post);
		} else {
			throw new Error("config.preHooks.post must be a function or Array");
		}
	}

	postParams.push(post);
	router.post.apply(router, postParams);


	function getOne(req, res) {
		var id = req.params.id;

		if (config.postHooks && config.postHooks.getOne) {
			proxy.readOneById(id, req.filter, createResponseHandler(req, res, config.postHooks.getOne));
		} else {
			proxy.readOneById(id, req.filter, createResponseHandler(req, res));
		}
	}

	var getOneParams = ["/:id"];

	if (config.preHooks.getOne) {
		if (typeof config.preHooks.getOne === "function") {
			getOneParams.push(config.preHooks.getOne);
		} else if (config.preHooks.getOne instanceof Array) {
			getOneParams = getOneParams.concat(config.preHooks.getOne);
		} else {
			throw new Error("config.preHooks.getOne must be a function or Array");
		}
	}

	getOneParams.push(getOne);
	router.get.apply(router, getOneParams);


	function put(req, res) {
		if (config.postHooks && config.postHooks.put) {
			proxy.updateOneById(req.params.id, req.body, req.filter, createResponseHandler(req, res, config.postHooks.put));
		} else {
			proxy.updateOneById(req.params.id, req.body, req.filter, createResponseHandler(req, res));
		}
	}

	var putParams = ["/:id"];

	if (config.preHooks.put) {
		if (typeof config.preHooks.put === "function") {
			putParams.push(config.preHooks.put);
		} else if (config.preHooks.put instanceof Array) {
			putParams = putParams.concat(config.preHooks.put);
		} else {
			throw new Error("config.preHooks.put must be a function or Array");
		}
	}

	putParams.push(put);
	router.put.apply(router, putParams);


	function del(req, res) {
		if (config.postHooks && config.postHooks.delete) {
			proxy.destroyOneById(req.params.id, req.filter, createResponseHandler(req, res, config.postHooks.delete));
		} else {
			proxy.destroyOneById(req.params.id, req.filter, createResponseHandler(req, res));
		}
	}

	var deleteParams = ["/:id"];

	if (config.preHooks.delete) {
		if (typeof config.preHooks.delete === "function") {
			deleteParams.push(config.preHooks.delete);
		} else if (config.preHooks.delete instanceof Array) {
			deleteParams = deleteParams.concat(config.preHooks.delete);
		} else {
			throw new Error("config.preHooks.delete must be a function or Array");
		}
	}

	deleteParams.push(del);
	router.delete.apply(router, deleteParams);


	return router;
};
