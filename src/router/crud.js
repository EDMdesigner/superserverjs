"use strict";

const express = require("express");

const checkProxy = require("../utils/checkProxy");
const checkBelongsTo = require("../utils/checkBelongsTo");
const objectify = require("../utils/objectify");
const intify = require("../utils/intify");
const createResponseHandlerWithHooks = require("../utils/responseHandler");
const addPrehooksToParams = require("../utils/addPrehooks");


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


	/*
		 ██████  ███████ ████████
		██       ██         ██
		██   ███ █████      ██
		██    ██ ██         ██
		 ██████  ███████    ██
	*/

	function get(req, res) {
		let query = {};

		if (req.query) {
			query = req.query;
		}

		query.find = objectify(query.find);
		query.sort = objectify(query.sort);

		query.skip = intify(query.skip, 0);
		query.limit = intify(query.limit, 10);

		proxy.read(
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

	function post(req, res) {
		proxy.createOne(
			req.body,
			req.filter,
			createResponseHandlerWithHooks(config, req, res, "post")
		);
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
		// avoid accidentally apply id to the filter from preHooks
		if (req.filter && req.filter.id) {
			delete req.filter.id;
		}

		proxy.readOneById(
			req.params.id,
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
		// avoid accidentally apply id to the filter from preHooks
		if (req.filter && req.filter.id) {
			delete req.filter.id;
		}

		proxy.updateOneById(
			req.params.id,
			req.body,
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
		// avoid accidentally apply id to the filter from preHooks
		if (req.filter && req.filter.id) {
			delete req.filter.id;
		}

		proxy.destroyOneById(
			req.params.id,
			req.filter,
			createResponseHandlerWithHooks(config, req, res, "delete")
		);
	}

	let deleteParams = addPrehooksToParams(config, ["/:id"], "delete");
	deleteParams.push(del);
	router.delete.apply(router, deleteParams);


	return router;
};
