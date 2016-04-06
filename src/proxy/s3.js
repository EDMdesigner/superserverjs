var fs = require("fs");
var crypto = require("crypto");
var AWS = require("aws-sdk");

AWS.config.update({
	accessKeyId: "AKIAI7APKNXSBQADSRNQ",
	secretAccessKey: "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",
	region: "us-east-1"
});

module.exports = function createFileProxy(config) {
	config = config || {};

	if (!config.idProperty) {
		throw new Error("config.idProperty is mandatory");
	}

	var idProperty = config.idProperty;
	var basePath = config.basePath;
	var encoding = config.encoding;

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

	}

	function createOne(data, callback) {

		var s3bucket = new AWS.S3({
			params: {
				Bucket: "edm-testbucket"
			}
		});

		s3bucket.createBucket(function() {
			var params = {
				Key: generateId(),
				Body: data
			};

			s3bucket.upload(params, function(err, data) {
				if (err) {
					callback(err);
				} else {
					// console.log(data);
					var retObj = {};

					callback(null, data);
				}
			});
		});
	}

	function readOneById(id, callback) {

	}

	function updateOneById(id, newData, callback) {
		
	}

	function destroyOneById(id, callback) {
		
	}

	return {
		read: read,
		createOne: createOne,
		readOneById: readOneById,
		updateOneById: updateOneById,
		destroyOneById: destroyOneById
	};
};
