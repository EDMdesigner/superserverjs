var fs = require("fs");
var express = require("express");
var formidable = require("express-formidable");
var request = require("superagent");


var checkProxy = require("../utils/checkProxy");
var objectify = require("../utils/objectify");
var intify = require("../utils/intify");
var createResponseHandler = require("../utils/responseHandler");


module.exports = function createGalleryRouter(config) {
	config = config || {};

	var router = config.router || express.Router();

	if (typeof config.createInfoObject !== "function") {
		throw new Error("config.createInfoObject must be a function");
	}

	if (!config.fileUploadProp) {
		throw new Error("config.fileUploadProp is mandatory");
	}

	if (!config.fromUrlProp) {
		throw new Error("config.fromUrlProp is mandatory");
	}

	checkProxy({
		proxy: config.binaryProxy,
		msgPrefix: "config.binaryProxy"
	});

	checkProxy({
		proxy: config.infoProxy,
		msgPrefix: "config.infoProxy"
	});

	var binaryProxy = config.binaryProxy;
	var infoProxy = config.infoProxy;

	var createInfoObject = config.createInfoObject;

	var fileUploadProp = config.fileUploadProp;
	var fromUrlProp = config.fromUrlProp;


	router.use(formidable.parse());

	
	router.get("/", function(req, res) {
		var query = req.query || {};

		query.find = objectify(query.find);
		query.sort = objectify(query.sort);

		query.skip = intify(query.skip, 0);
		query.limit = intify(query.limit, 10);

		infoProxy.read(query, createResponseHandler(res));
	});

	function download(config) {
		var res = config.res;
		var callback = config.callback;

		var url = config.url;

		request.get(url).end(function(err, response) {
			if (err) {
				return res.send(err);
			}

			callback({
				res: res,
				data: response.body
			});
		});
	}

	function upload(config) {
		var res = config.res;
		var data = config.data;

		binaryProxy.createOne(data, function(err, response) {
			if (err) {
				return res.send(err);
			}

			var info = createInfoObject(response);

			infoProxy.createOne(info, createResponseHandler(res));
		});
	}

	router.post("/", function(req, res) {
		var contentType = req.get("Content-Type");
		console.log("content-type", contentType);

		console.log("req.body", req.body);

		if (contentType.toLowerCase().indexOf("application/json") > -1) {
			download({
				res: res,
				callback: upload,
				url: req.body[fromUrlProp]
			});
		} else {
			console.log("file", req.body[fileUploadProp]);

			fs.readFile(req.body[fileUploadProp].path, function (err, data) {
				upload({
					res: res,
					data: data
				});
			});
		}
	});

	router.get("/:id", function(req, res) {
		var id = req.params.id;
		infoProxy.readOneById(id, createResponseHandler(res));
	});

	router.put("/:id", function(req, res) {
		var id = req.params.id;
		var data = req.body;
		infoProxy.updateOneById(id, data, createResponseHandler(res));
	});

	router.delete("/:id", function(req, res) {
		var id = req.params.id;
		infoProxy.destroyOneById(id, function(err) {
			if (err) {
				return res.send(err);
			}

			binaryProxy.destroyOneById(id, function() {});
		});
	});

	return router;
};
