var fs = require("fs");
var express = require("express");
var formidable = require("express-formidable");
var request = require("superagent");
var fileType = require("file-type");

var checkProxy = require("../utils/checkProxy");
var checkBelongsTo = require("../utils/checkBelongsTo");
var createFilterObjFromParams = require("../utils/createFilterObjFromParams");

var objectify = require("../utils/objectify");
var intify = require("../utils/intify");
var createResponseHandler = require("../utils/responseHandler");


module.exports = function createGalleryRouter(config) {
	config = config || {};
	config.preHooks = config.preHooks || {};

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


	function get(req, res) {
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

		if (config.postHooks && config.postHooks.get) {
			infoProxy.read(query, req.filter, createResponseHandler(req, res, config.postHooks.get));
		} else {
			infoProxy.read(query, req.filter, createResponseHandler(req, res));
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

		binaryProxy.createOne(data.buffer, req.filter, function(err, response) {
			if (err) {
				return res.send(err);
			}

			response.file = data.file;
			var info = createInfoObject(response);

			if (config.postHooks && config.postHooks.post) {
				infoProxy.createOne(info, req.filter, createResponseHandler(req, res, config.postHooks.post));
			} else {
				infoProxy.createOne(info, req.filter, createResponseHandler(req, res));
			}
		});
	}

	function post(req, res) {
		var contentType = req.get("Content-Type");

		if (contentType.toLowerCase().indexOf("application/json") > -1) {
			console.log("FROMURL");
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
				var slicedUrl = url.split("/");
				var info = {
					title: slicedUrl[slicedUrl.length - 1],
					url: req.body[fromUrlProp],
					createdAt: new Date()
				};

				if (config.postHooks && config.postHooks.post) {
					infoProxy.createOne(info, req.filter, createResponseHandler(req, res, config.postHooks.post));
				} else {
					infoProxy.createOne(info, req.filter, createResponseHandler(req, res));
				}
			}
		} else {
			fs.readFile(req.body[fileUploadProp].path, function(err, buffer) {
				var data = {
					file: req.body.file,
					buffer: buffer
				};

				// note: posthooks are handled in this function
				upload({
					req: req,
					res: res,
					data: data
				});
			});
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

		// avoid accidentally apply id to the filter from preHooks
		if (req.filter.id) {
			delete req.filter.id;
		}

		if (config.postHooks && config.postHooks.getOne) {
			infoProxy.readOneById(id, req.filter, createResponseHandler(req, res, config.postHooks.getOne));
		} else {
			infoProxy.readOneById(id, req.filter, createResponseHandler(req, res));
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
		var id = req.params.id;
		var data = req.body;

		if (config.postHooks && config.postHooks.put) {
			infoProxy.updateOneById(id, data, req.filter, createResponseHandler(req, res, config.postHooks.put));
		} else {
			infoProxy.updateOneById(id, data, req.filter, createResponseHandler(req, res));
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
		var id = req.params.id;
		infoProxy.destroyOneById(id, req.filter, function(err, result) {
			if (err) {
				return res.send(err);
			}

			var binId = calculateBinaryId(result);

			binaryProxy.destroyOneById(binId, req.filter, function() {
				// execute delete posthook when all the delete tasks are don
				if (config.postHooks && config.postHooks.delete) {
					config.postHooks.delete();
				}

				res.send(result);
			});
		});
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
