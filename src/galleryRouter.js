var express = require("express");

module.exports = function createGalleryRouter(config) {
	config = config || {};

	var router = config.router || express.Router();

	/*
	var binaryProxy = config.binaryProxy;
	var infoProxy = config.infoProxy;
	
	router.get("/", function(req, res) {
		//list
	});

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
	*/

	return router;
};
