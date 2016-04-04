var express = require("express");

module.exports = function createCRUDRouter(config) {
	var router = config.router || express.Router();
	var proxy = config.proxy;

	function createResponseHandler(res) {
		return function handleResponse(err, result) {
			if (err) {
				return res.json({err: err});
			}

			res.json(result);
		};
	}

	router.use(function(req, res, next) {
		console.log(Date(), req.url);
		next();
	});

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



		console.log(req.query);
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
