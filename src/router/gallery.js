var fs = require("fs");
var express = require("express");
var formidable = require("express-formidable");
var request = require("superagent");
var extend = require("extend");
var fileType = require("file-type");

var checkProxy = require("../utils/checkProxy");
var checkBelongsTo = require("../utils/checkBelongsTo");
var createFilterObjFromParams = require("../utils/createFilterObjFromParams");

var objectify = require("../utils/objectify");
var intify = require("../utils/intify");
var createResponseHandler = require("../utils/responseHandler");


module.exports = function createGalleryRouter(config) {
	config = config || {};

	var router = config.router || express.Router({mergeParams: true});

	if (typeof config.createInfoObject !== "function") {
		throw new Error("config.createInfoObject must be a function");
	}

	if (typeof config.calculateBinaryId !== "function") {
		throw new Error("config.calculateBinaryId must be a function");
	}

	if (config.validMimeTypes && !(typeof config.validMimeTypes === "string" || config.validMimeTypes.constructor === Array)) {
		throw new Error("config.validMimeTypes must be a string, or array");
	}

	if (!config.fileUploadProp) {
		throw new Error("config.fileUploadProp is mandatory");
	}

	if (!config.fromUrlProp) {
		throw new Error("config.fromUrlProp is mandatory");
	}

	checkBelongsTo(config.belongsTo);

	checkProxy({
		proxy: config.binaryProxy,
		msgPrefix: "config.binaryProxy"
	});

	checkProxy({
		proxy: config.infoProxy,
		msgPrefix: "config.infoProxy"
	});

	var validMimeTypes = config.validMimeTypes;

	if (validMimeTypes && typeof validMimeTypes === "string") {
		validMimeTypes = [validMimeTypes];
	}

	var binaryProxy = config.binaryProxy;
	var infoProxy = config.infoProxy;

	var createInfoObject = config.createInfoObject;
	var calculateBinaryId = config.calculateBinaryId;

	var fileUploadProp = config.fileUploadProp;
	var fromUrlProp = config.fromUrlProp;

	var downloadImagesFromUrl = typeof config.downloadImagesFromUrl === "boolean" ? config.downloadImagesFromUrl : true;

	router.use(formidable.parse());

	router.get("/", function(req, res) {
		infoProxy.filter = createFilterObjFromParams({
			belongsTo: config.belongsTo,
			params: req.params
		});

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
		var req = config.req;
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
				req: req,
				res: res,
				data: data
			});
		});
	}

	function upload(conf) {
		var req = conf.req;
		var res = conf.res;
		var data = conf.data;

		if (validMimeTypes) {
			var ft = fileType(data.buffer);

			if (!ft || !ft.mime) {
				console.log("Gallery router: undefined mime type");
				return res.send({
					err: "Gallery router: undefined mime type"
				});
			}

			if (validMimeTypes.indexOf(ft.mime) === -1) {
				console.log("Gallery router: Invalid mime type");
				return res.send({
					err: "Gallery router: Invalid mime type"
				});
			}
		}

		binaryProxy.createOne(data.buffer, function(err, response) {
			if (err) {
				return res.send(err);
			}

			response.file = data.file;
			var info = createInfoObject(response);

			var filterObj = createFilterObjFromParams({
				belongsTo: config.belongsTo,
				params: req.params
			});

			extend(info, filterObj);

			infoProxy.createOne(info, createResponseHandler(res));
		});
	}

	router.post("/", function(req, res) {
		infoProxy.filter = createFilterObjFromParams({
			belongsTo: config.belongsTo,
			params: req.params
		});

		var contentType = req.get("Content-Type");

		if (contentType.toLowerCase().indexOf("application/json") > -1) {
			if (downloadImagesFromUrl) {
				download({
					req: req,
					res: res,
					url: req.body[fromUrlProp],
					callback: upload
				});	
			} else {
				//dirty hotfix, should be removed. Also, gallery router should be refactored to use crud router with pre and post hooks
				var url = req.body[fromUrlProp];
				var slicedUrl = url.slice("/");
				var info = {
					title: slicedUrl[slicedUrl.length - 1],
					url: req.body[fromUrlProp],
					createdAt: new Date()
				};

				var filterObj = createFilterObjFromParams({
					belongsTo: config.belongsTo,
					params: req.params
				});

				extend(info, filterObj);

				infoProxy.createOne(info, createResponseHandler(res));
			}
		} else {
			fs.readFile(req.body[fileUploadProp].path, function(err, buffer) {
				var data = {
					file: req.body.file,
					buffer: buffer
				};

				upload({
					req: req,
					res: res,
					data: data
				});
			});
		}
	});

	router.get("/:id", function(req, res) {
		infoProxy.filter = createFilterObjFromParams({
			belongsTo: config.belongsTo,
			params: req.params
		});

		var id = req.params.id;
		infoProxy.readOneById(id, createResponseHandler(res));
	});

	router.put("/:id", function(req, res) {
		infoProxy.filter = createFilterObjFromParams({
			belongsTo: config.belongsTo,
			params: req.params
		});

		var id = req.params.id;
		var data = req.body;

		infoProxy.updateOneById(id, data, createResponseHandler(res));
	});

	router.delete("/:id", function(req, res) {
		infoProxy.filter = createFilterObjFromParams({
			belongsTo: config.belongsTo,
			params: req.params
		});
		
		var id = req.params.id;
		infoProxy.destroyOneById(id, function(err, result) {
			if (err) {
				return res.send(err);
			}

			var binId = calculateBinaryId(result);

			binaryProxy.destroyOneById(binId, function() {
				res.send(result);
			});
		});
	});

	return router;
};
