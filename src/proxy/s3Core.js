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

	if (!dependencies.path) {
		throw new Error("path module dependency is mandatory!");
	}

	if (!dependencies.dateformat) {
		throw new Error("dateformat module dependency is mandatory!");
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
		var dateformat = dependencies.dateformat;
		var s3 = new AWS.S3({
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
			region: config.region,
			params: {
				Bucket: config.bucket
			}
		});
		var path = dependencies.path;

		var getBinaryDirNameFromFilter = config.getBinaryDirNameFromFilter;

		function read(query, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}

			var params = {};

			if (getBinaryDirNameFromFilter) {
				params = {
					Prefix: getBinaryDirNameFromFilter(filter)
				};
			}

			s3.listObjects(params, function(err, data) {
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

			var id = generateId(data);
			var dirName;

			if (getBinaryDirNameFromFilter) {
				dirName = getBinaryDirNameFromFilter(filter);
			}

			var params = {
				Body: data.buffer,
				ACL: "public-read",
				ContentType: fileType(data.buffer).mime
			};

			s3.listObjects({ Bucket:config.bucket, Prefix: dirName ? dirName + "/" + id : id }, function(err, objectList) {
				if (err) {
					return callback(err);
				}

				params.Key = dirName ? `${dirName}/${path.basename(id)}` : path.basename(id);
				if (objectList.Contents.length > 0) {
					var name = `${path.basename(id, path.extname(id))}_${dateformat(Date.now(), "yyyy-mm-ddTHH.MM.ss.l")}${path.extname(id)}`;
					params.Key = dirName? `${dirName}/${name}` : name;
					data.file.name = name;
				}

				s3.upload(params, function(err, data) {
					if (err) {
						return callback(err);
					}
	
					callback(null, data);
				});
			});

		}

		function readOneById(id, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}

			var myKey = id;

			if (getBinaryDirNameFromFilter) {
				myKey = getBinaryDirNameFromFilter(filter) + "/" + id;
			}

			var params = {
				Key: myKey
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

			var myKey = id;

			if (getBinaryDirNameFromFilter) {
				myKey = getBinaryDirNameFromFilter(filter) + "/" + id;
			}

			var params = {
				Key: myKey,
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

			var myKey = id;

			if (getBinaryDirNameFromFilter) {
				myKey = getBinaryDirNameFromFilter(filter) + "/" + id;
			}

			var params = {
				Key: myKey
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
