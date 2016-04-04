var fs = require("fs");

module.exports = function createFileProxy(config) {
	config = config || {};

	if (typeof config.basePath !== "string") {
		throw new Error("config.basePath is mandatory");
	}

	var basePath = config.basePath;
	var encoding = config.encoding;

	var generateId = config.generateId || (function() {
		var nextId = 0;
		return function() {
			return nextId += 1;
		};
	}());

	function read(query, callback) {
		fs.readdir(basePath, function(err, data) {
			if (err) {
				return callback(err);
			}

			//TODO filter the resultset

			callback(null, {
				items: data,
				count: data.length
			});
		});
	}

	function createOne(data, callback) {
		var id = generateId();
		fs.writeFile(basePath + id, data, encoding, function(err) {
			callback(err);
		});
	}

	function readOneById(id, callback) {
		fs.readFile(basePath + id, encoding, function(err, data) {
			callback(err, data);
		});
	}

	function updateOneById(id, newData, callback) {
		fs.writeFile(basePath + id, newData, encoding, function(err) {
			callback(err);
		});
	}

	function destroyOneById(id, callback) {
		fs.unlink(basePath + id, function(err) {
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
