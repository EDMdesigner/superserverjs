var express = require("express");

module.exports = function createCRUDRouter(config) {
	config = config || {};

	if (!config.proxy) {
		throw new Error("config.proxy is mandatory");
	}

	var proxy = config.proxy;

	if (typeof proxy.read !== "function") {
		throw new Error("config.proxy.read must be a function");
	}

	if (typeof proxy.createOne !== "function") {
		throw new Error("config.proxy.createOne must be a function");
	}

	if (typeof proxy.readOneById !== "function") {
		throw new Error("config.proxy.readOneById must be a function");
	}

	if (typeof proxy.updateOneById !== "function") {
		throw new Error("config.proxy.updateOneById must be a function");
	}

	if (typeof proxy.destroyOneById !== "function") {
		throw new Error("config.proxy.destroyOneById must be a function");
	}


	var router = config.router || express.Router();

	function createResponseHandler(res) {
		return function handleResponse(err, result) {
			if (err) {
				return res.json({err: err});
			}

			res.json(result);
		};
	}

	function intify(value, defaultValue) {
		value = parseInt(value, 10);
		if (isNaN(value)) {
			value = defaultValue;
		}
		return value;
	}

	function objectify(value) {
		if (typeof value === "object") {
			return value;
		}

		try {
			return JSON.parse(value);
		} catch (e) {
			return {};
		}
	}

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
