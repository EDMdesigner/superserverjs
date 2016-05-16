/* 
 * MongoDB proxy 
 */

var async = require("async");
var extend = require("extend");

module.exports = function createMongoProxy(config) {

	config = config || {};

	if (!config.model) {
		throw new Error("config.model is mandatory!");
	}

	var Model = config.model;

	function read(query, callback) {
		if (!query.find) {
			query.find = {};
		}
		
		extend(query.find, obj.filter);

		async.parallel({
			items: getItems.bind(null, query),
			count: getItemCount.bind(null, query)
		}, function(err, result) {
			if (err) {
				return callback(err);
			}

			callback(null, {
				items: result.items,
				count: result.count
			});
		});
	}

	function getItems(query, done) {
		var model = Model;

		if (query.find) {
			model = model.find(query.find);
		}

		if (query.sort) {
			model = model.sort(query.sort);
		}

		if (typeof query.skip === "number") {
			model = model.skip(query.skip);
		}

		if (typeof query.limit === "number") {
			model = model.limit(query.limit);
		}

		model.exec(function(err, result) {
			done(err, result);
		});
	}

	function getItemCount(query, done) {
		Model.count(query.find, function(err, result) {
			done(err, result);
		});
	}

	function createOne(data, callback) {
		Model.create(data, function(err, result) {
			callback(err, result);
		});
	}

	function readOneById(id, callback) {
		var find = {
			_id: id
		};

		extend(find, obj.filter);

		Model.findOne(find, function(err, result) {
			callback(err, result);
		});
	}

	function updateOneById(id, newData, callback) {
		var find = {
			_id: id
		};

		extend(find, obj.filter);

		Model.findOneAndUpdate(find, newData, function(err, result) {
			callback(err, result);
		});
	}

	function destroyOneById(id, callback) {
		var find = {
			_id: id
		};

		extend(find, obj.filter);

		Model.findOneAndRemove(find, function(err, result) {
			callback(err, result);
		});
	}

	var obj = {
		filter: {},

		read: read,
		createOne: createOne,
		readOneById: readOneById,
		updateOneById: updateOneById,
		destroyOneById: destroyOneById
	};

	return obj;
};