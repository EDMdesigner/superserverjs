/* 
 * MongoDB proxy 
 */

var mongoose = require("mongoose");

module.exports = function createMongoProxy(config) {
	
	config = config || {};

	if (typeof config.mongoUrl !== "string") {
		throw new Error("config.mongoUrl is mandatory!");
	}

	if (typeof config.model !== "object") {
		throw new Error("config.model is mandatory!");
	}

	var Model = config.model;

	mongoose.connect(config.mongoUrl);

	mongoose.connection.on("error", function() {
		console.error("Mongoose connection error");
	});

	mongoose.connection.on("open", function() {
		console.log("Mongoose connection successful");
	});

	function read(query, callback) {
		Model.find(query, function(err, data) {
			if (err) {
				return callback(err);
			}

			callback(null, {
				items: data,
				count: data.length
			});
		});
	}

	function createOne(data, callback) {
		Model.create(data, function(err) {
			callback(err);
		});
	}

	function readOneById(id, callback) {
		Model.findById(id, function(err, result) {
			if (err) {
				return callback(err);
			}

			callback(null, result);
		});
	}

	function updateOneById(id, newData, callback) {
		Model.findByIdAndUpdate(id, newData, function(err) {
			callback(err);
		});
	}

	function destroyOneById(id, callback) {
		Model.findByIdAndRemove(id, function(err) {
			callback(err);
		});
	}

	return {
		read: read,
		createOne: createOne,
		readOneById: readOneById,
		updateOneById: updateOneById,
		destroyOneById: destroyOneById
	};
};