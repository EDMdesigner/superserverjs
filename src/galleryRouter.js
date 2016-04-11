var express = require("express");


module.exports = function createGalleryRouter(config) {
	config = config || {};

	var router = config.router || express.Router();


	var binaryProxy = config.binaryProxy;
	var infoProxy = config.infoProxy;

	/*
	router.get("/", function(req, res) {
		var query = req.query || {};

		query.find = objectify(query.find);
		query.sort = objectify(query.sort);

		query.skip = intify(query.skip, 0);
		query.limit = intify(query.limit, 10);

		binaryProxy.read(query, createResponseHandler(res));
	});
*/
	router.post("/", function(req, res) {
		console.log(req.file);
		binaryProxy.createOne(req.file, function(err, binData) {
			if (err) {
				return res.send(err);
			}
			console.log(binData);
			infoProxy.createOne(req.file, function(err, infData) {
				if (err) {
					return console.log(err);
				}
				res.send(infData);
			});
		});
	});

	/*
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
