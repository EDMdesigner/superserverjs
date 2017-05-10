var fs = require("fs");
var idGenerator = require("../utils/generateId");

module.exports = function createFileProxy(config) {
	config = config || {};

	if (typeof config.basePath !== "string") {
		throw new Error("config.basePath is mandatory");
	}

	if (!config.idProperty) {
		throw new Error("config.idProperty is mandatory");
	}

	var idProperty = config.idProperty;
	var basePath = config.basePath;
	var localUrlPrefix = config.localUrlPrefix;
	var encoding = config.encoding;

	fs.mkdir(basePath, function() {
	});

	if (basePath[basePath.length - 1] !== "/") {
		basePath += "/";
	}

	var generateId = config.generateId || idGenerator();

	function read(query, filter, callback) {
		if (typeof callback === "undefined") {
			callback = filter;
			filter = null;
		}

		fs.readdir(basePath, function(err, data) {
			if (err) {
				return callback(err);
			}

			//TODO filter the resultset

			callback(null, {
				items: data.map(function(item) {
					var retObj = {};
					retObj[idProperty] = item;
					return retObj;
				}),
				count: data.length
			});
		});
	}

	function createOne(data, filter, callback) {
		if (typeof callback === "undefined") {
			callback = filter;
			filter = null;
		}

		var id = generateId();
		fs.writeFile(basePath + id, data, encoding, function(err) {
			var retObj = {};
			retObj[idProperty] = id;
			retObj["Location"] = localUrlPrefix + id;
			callback(err, retObj);
		});
	}

	function readOneById(id, filter, callback) {
		if (typeof callback === "undefined") {
			callback = filter;
			filter = null;
		}

		fs.readFile(basePath + id, encoding, function(err, data) {
			callback(err, data);
		});
	}

	function updateOneById(id, newData, filter, callback) {
		if (typeof callback === "undefined") {
			callback = filter;
			filter = null;
		}

		//should check if it exists.
		fs.writeFile(basePath + id, newData, encoding, function(err) {
			callback(err);
		});
	}

	function destroyOneById(id, filter, callback) {
		if (typeof callback === "undefined") {
			callback = filter;
			filter = null;
		}

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
