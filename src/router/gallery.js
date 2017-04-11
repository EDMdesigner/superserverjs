"use strict";

const fs = require("fs");
const express = require("express");
const formidable = require("express-formidable");
const request = require("superagent");
const fileType = require("file-type");

const checkProxy = require("../utils/checkProxy");
const checkBelongsTo = require("../utils/checkBelongsTo");
const objectify = require("../utils/objectify");
const intify = require("../utils/intify");
const createResponseHandlerWithHooks = require("../utils/responseHandler");
const addPrehooksToParams = require("../utils/addPrehooks");


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

	if (config.validMimeTypes &&
		!(typeof config.validMimeTypes === "string" ||
		config.validMimeTypes.constructor === Array))
	{
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

	if (typeof config.downloadImagesFromUrl === "boolean") {
		var downloadImagesFromUrl = config.downloadImagesFromUrl;
	} else {
		var downloadImagesFromUrl = true;
	}

	router.use(formidable.parse());


	/*
		 ██████  ███████ ████████
		██       ██         ██
		██   ███ █████      ██
		██    ██ ██         ██
		 ██████  ███████    ██
	*/

	function get(req, res) {
		let query = req.query || {};

		query.find = objectify(query.find);
		query.sort = objectify(query.sort);
		let key = Object.keys(query.find)[0];

		if (typeof query.find[key] === "string") {
			try	{
				let findSplit = query.find[key].split("/");
				let rgxOptions = findSplit[findSplit.length - 1];

				findSplit.pop();
				findSplit.shift();
				let rgxPattern = findSplit.join("/");

				query.find[key] = new RegExp(rgxPattern, rgxOptions);
			} catch (e) {
			}
		}

		query.skip = intify(query.skip, 0);
		query.limit = intify(query.limit, 10);

		infoProxy.read(
			query,
			req.filter,
			createResponseHandlerWithHooks(config, req, res, "get")
		);
	}

	let getParams = addPrehooksToParams(config, ["/"], "get");
	getParams.push(get);
	router.get.apply(router, getParams);


	/*
		██████   ██████  ███████ ████████
		██   ██ ██    ██ ██         ██
		██████  ██    ██ ███████    ██
		██      ██    ██      ██    ██
		██       ██████  ███████    ██
	*/

	function download(config) {
		let req = config.req;
		let res = config.res;
		let callback = config.callback;
		let url = config.url;
		let name = url.split("/");

		name = name[name.length - 1];

		request.get(url).end((err, response) => {
			if (err) {
				return res.send(err);
			}

			let data = {
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

			infoProxy.createOne(
				info,
				req.filter,
				createResponseHandlerWithHooks(config, req, res, "post")
			);
		});
	}

	function post(req, res) {
		var contentType = req.get("Content-Type");

		if (contentType.toLowerCase().indexOf("application/json") > -1) {
			console.log("FROMURL");
			if (downloadImagesFromUrl) {
				// if image should be downloaded
				download({
					req: req,
					res: res,
					url: req.body[fromUrlProp],
					callback: upload
				});
			} else {
				// if image should be referenced with original URL
				var url = req.body[fromUrlProp];
				var slicedUrl = url.split("/");
				var info = {
					title: slicedUrl[slicedUrl.length - 1],
					url: req.body[fromUrlProp],
					createdAt: new Date()
				};

				infoProxy.createOne(
					info,
					req.filter,
					createResponseHandlerWithHooks(config, req, res, "post")
				);
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

	let postParams = addPrehooksToParams(config, ["/"], "post");
	postParams.push(post);
	router.post.apply(router, postParams);


	/*
		 ██████  ███████ ████████  ██████  ███    ██ ███████
		██       ██         ██    ██    ██ ████   ██ ██
		██   ███ █████      ██    ██    ██ ██ ██  ██ █████
		██    ██ ██         ██    ██    ██ ██  ██ ██ ██
		 ██████  ███████    ██     ██████  ██   ████ ███████
	*/

	function getOne(req, res) {
		let id = req.params.id;

		// avoid accidentally apply id to the filter from preHooks
		if (req.filter && req.filter.id) {
			delete req.filter.id;
		}

		infoProxy.readOneById(
			id,
			req.filter,
			createResponseHandlerWithHooks(config, req, res, "getOne")
		);
	}

	let getOneParams = addPrehooksToParams(config, ["/:id"], "getOne");
	getOneParams.push(getOne);
	router.get.apply(router, getOneParams);


	/*
		██████  ██    ██ ████████
		██   ██ ██    ██    ██
		██████  ██    ██    ██
		██      ██    ██    ██
		██       ██████     ██
	*/

	function put(req, res) {
		var id = req.params.id;
		var data = req.body;

		// avoid accidentally apply id to the filter from preHooks
		if (req.filter && req.filter.id) {
			delete req.filter.id;
		}

		infoProxy.updateOneById(
			id,
			data,
			req.filter,
			createResponseHandlerWithHooks(config, req, res, "put")
		);
	}

	let putParams = addPrehooksToParams(config, ["/:id"], "put");
	putParams.push(put);
	router.put.apply(router, putParams);


	/*
		██████  ███████ ██      ███████ ████████ ███████
		██   ██ ██      ██      ██         ██    ██
		██   ██ █████   ██      █████      ██    █████
		██   ██ ██      ██      ██         ██    ██
		██████  ███████ ███████ ███████    ██    ███████
	*/

	function del(req, res) {
		let id = req.params.id;

		// avoid accidentally apply id to the filter from preHooks
		if (req.filter && req.filter.id) {
			delete req.filter.id;
		}

		infoProxy.destroyOneById(id, req.filter, function(err, result) {
			if (err) {
				return res.send(err);
			}

			let binId = calculateBinaryId(result);

			binaryProxy.destroyOneById(
				binId,
				req.filter,
				createResponseHandlerWithHooks(config, req, res, "delete")
			);
		});
	}

	let deleteParams = addPrehooksToParams(config, ["/:id"], "delete");
	deleteParams.push(del);
	router.delete.apply(router, deleteParams);


	return router;
};
