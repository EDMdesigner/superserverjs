/* 
 * AWS S3 proxy 
 */

var crypto = require("crypto");
var AWS = require("aws-sdk");

module.exports = function createS3Proxy(config) {
	config = config || {};

	if (!config.accessKeyId) {
		throw new Error("config.accessKeyId is mandatory!");
	}

	if (!config.secretAccessKey) {
		throw new Error("config.secretAccessKey is mandatory!");
	}

	if (!config.bucket) {
		throw new Error("config.bucket is mandatory!");
	}

	var s3 = new AWS.S3({
		accessKeyId: config.accessKeyId,
		secretAccessKey: config.secretAccessKey,
		region: config.region,
		params: {
			Bucket: config.bucket
		}
	});

	var generateId = config.generateId || (function() {
		var nextNum = 0;

		return function() {
			var now = new Date();
			var hex = crypto.createHash("md5").update(now.toString() + nextNum).digest("hex");

			nextNum += 1;

			return hex;
		};
	}());

	function read(query, callback) {
		s3.listObjects(function(err, data) {
			if (err) {
				return callback(err);
			}

			callback(null, {
				items: data.Contents,
				count: data.Contents.length
			});
		});
	}

	function createOne(data, callback) {
		var params = {
			Key: generateId(),
			Body: data
		};

		s3.upload(params, function(err, data) {
			if (err) {
				return callback(err);
			}

			callback(null, data);
		});
	}

	function readOneById(id, callback) {
		var params = {
			Key: id
		};

		s3.getObject(params, function(err, data) {
			if (err) {
				return callback(err);
			}

			callback(null, data);
		});
	}

	function updateOneById(id, newData, callback) {
		var params = {
			Key: id,
			Body: newData
		};

		s3.upload(params, function(err, data) {
			if (err) {
				return callback(err);
			}

			callback(null, data);
		});
	}

	function destroyOneById(id, callback) {
		var params = {
			Key: id
		};

		s3.deleteObject(params, function(err, data) {
			return callback(err, data);
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
