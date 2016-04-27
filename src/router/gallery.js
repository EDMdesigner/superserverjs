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

	if (typeof config.calculateBinaryId !== "function") {
		throw new Error("config.calculateBinaryId must be a function");
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
	var calculateBinaryId = config.calculateBinaryId;

	var fileUploadProp = config.fileUploadProp;
	var fromUrlProp = config.fromUrlProp;


	router.use(formidable.parse());

	router.get("/", function(req, res) {
		var query = req.query || {};


		query.find = objectify(query.find);
		query.sort = objectify(query.sort);
		var key = Object.keys(query.find)[0];

		if (typeof query.find[key] === "string") {
			try	{
				var findSplit = query.find[key].split("/");
				var rgxOptions = findSplit[findSplit.length - 1];

				findSplit.pop();
				findSplit.shift();
				var rgxPattern = findSplit.join("/");

				query.find[key] = new RegExp(rgxPattern, rgxOptions);
			} catch (e) {
			}
		}

		query.skip = intify(query.skip, 0);
		query.limit = intify(query.limit, 10);

		infoProxy.read(query, createResponseHandler(res));
	});

	function download(config) {
		var res = config.res;
		var callback = config.callback;
		var url = config.url;
		var name = url.split("/");

		name = name[name.length - 1];

		request.get(url).end(function(err, response) {
			if (err) {
				return res.send(err);
			}

			var data = {
				buffer: response.body,
				file: {
					name: name
				}
			};

			callback({
				res: res,
				data: data
			});
		});
	}

	function upload(config) {
		var res = config.res;
		var data = config.data;

		binaryProxy.createOne(data.buffer, function(err, response) {
			if (err) {
				return res.send(err);
			}

			response.file = data.file;
			var info = createInfoObject(response);

			infoProxy.createOne(info, createResponseHandler(res));
		});
	}

	router.post("/", function(req, res) {
		var contentType = req.get("Content-Type");

		setTimeout(function() {
			if (contentType.toLowerCase().indexOf("application/json") > -1) {
				download({
					res: res,
					callback: upload,
					url: req.body[fromUrlProp]
				});
			} else {
				fs.readFile(req.body[fileUploadProp].path, function(err, buffer) {
					var data = {
						file: req.body.file,
						buffer: buffer
					};

					upload({
						res: res,
						data: data
					});
				});
			}
		}, 3000);
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
		infoProxy.destroyOneById(id, function(err, result) {
			if (err) {
				return res.send(err);
			}

			var binId = calculateBinaryId(result);

			console.log("www", binId);

			binaryProxy.destroyOneById(binId, function() {
				res.send(result);
			});
		});
	});

	return router;
};
