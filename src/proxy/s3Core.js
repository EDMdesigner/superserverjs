/* 
 * AWS S3 proxy core
 */

module.exports = function(dependencies) {
	if (!dependencies.AWS) {
		throw new Error("AWS dependency is mandatory!");
	}
	
	if (!dependencies.generateId) {
		throw new Error("generateId dependency is mandatory!");
	}
	
	if (!dependencies.fileType) {
		throw new Error("fileType module dependency is mandatory!");
	}
	
	return function createS3Proxy(config) {
		config = config || {};

		if (!config.accessKeyId) {
			throw new Error("config.accessKeyId is mandatory!");
		}

		if (!config.secretAccessKey) {
			throw new Error("config.secretAccessKey is mandatory!");
		}

		if (!config.region) {
			throw new Error("config.region is mandatory!");
		}

		if (!config.bucket) {
			throw new Error("config.bucket is mandatory!");
		}

		if (config.generateId && typeof config.generateId !== "function") {
			throw new Error("config.generateId must be a function!");
		}

		var fileType = dependencies.fileType;
		var generateId = config.generateId || dependencies.generateId();
		var AWS = dependencies.AWS;
		var s3 = new AWS.S3({
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
			region: config.region,
			params: {
				Bucket: config.bucket
			}
		});

		function read(query, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}

			s3.listObjects({}, function(err, data) {
				if (err) {
					return callback(err);
				}

				callback(null, {
					items: data.Contents,
					count: data.Contents.length
				});
			});
		}

		function createOne(data, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}

			var params = {
				Key: generateId(data),
				Body: data,
				ACL: "public-read",
				ContentType: fileType(data).mime
			};

			s3.upload(params, function(err, data) {
				if (err) {
					return callback(err);
				}

				callback(null, data);
			});
		}

		function readOneById(id, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}

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

		function updateOneById(id, newData, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}

			var params = {
				Key: id,
				Body: newData,
				ACL: "public-read"
			};

			s3.upload(params, function(err, data) {
				if (err) {
					return callback(err);
				}

				callback(null, data);
			});
		}

		function destroyOneById(id, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}
			
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
};
