var fs = require("fs");
var crypto = require("crypto");

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
	var encoding = config.encoding;

	fs.mkdir(basePath, function() {
	});

	if (basePath[basePath.length - 1] !== "/") {
		basePath += "/";
	}

	var generateId = config.generateId || (function() {
		var md5 = crypto.createHash("md5");
		var nextNum = 0;
		return function() {
			var now = new Date();
			md5.update(now.toString() + nextNum);

			nextNum += 1;

			return md5.digest("hex");
		};
	}());

	function read(query, callback) {
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

	function createOne(data, callback) {
		var id = generateId();
		fs.writeFile(basePath + id, data, encoding, function(err) {
			var retObj = {};
			retObj[idProperty] = id;
			callback(err, retObj);
		});
	}

	function readOneById(id, callback) {
		fs.readFile(basePath + id, encoding, function(err, data) {
			callback(err, data);
		});
	}

	function updateOneById(id, newData, callback) {
		//should check if it exists.
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
