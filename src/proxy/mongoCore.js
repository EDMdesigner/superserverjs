/* 
 * MongoDB proxy core
 */

module.exports = function(dependencies) {
	if (!dependencies.async) {
		throw new Error("async dependency is mandatory!");
	}
	
	if (!dependencies.extend) {
		throw new Error("extend dependency is mandatory!");
	}

	var extend = dependencies.extend;
	var async = dependencies.async;
	
	return function createMongoProxy(config) {
		config = config || {};

		if (!config.model) {
			throw new Error("config.model is mandatory!");
		}

		var Model = config.model;

		function read(query, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}

			if (!query.find) {
				query.find = {};
			}
			
			if (filter) {
				extend(query.find, filter);	
			}

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

			if(config.populate) {
				model = model.populate(config.populate.by);
			}

			model.exec(function(err, result) {
				if(config.populate) {
					for(let idx = 0; idx < result.length; idx += 1) {
						result[idx] = result[idx].toObject();

						result[idx][config.populate.setProp] = {};
						
						for(let key in result[idx][config.populate.by]) {
							if(key !== "_id"){
								result[idx][config.populate.setProp][key] = result[idx][config.populate.by][key];
							}
						}

						result[idx][config.populate.by] = result[idx][config.populate.by]._id;
					}
				}
				
				done(err, result);
			});
		}

		function getItemCount(query, done) {
			Model.count(query.find, function(err, result) {
				done(err, result);
			});
		}

		function createOne(data, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}
			
			if (filter) {
				extend(data, filter);	
			}

			Model.create(data, function(err, result) {
				callback(err, result);
			});
		}

		function readOneById(id, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}

			var find = {
				_id: id
			};

			if (filter) {
				extend(find, filter);	
			}

			if(config.populate) {
				Model.findOne(find).populate(config.populate.by).exec((err, result) => {
					if(!(Object.keys(result).length === 1 && result.toObject)) {
						result = result.toObject();
						result[config.populate.setProp] = {};

						for(let key in result[config.populate.by]) {
							if(key !== "_id"){
								result[config.populate.setProp][key] = result[config.populate.by][key];
							}
						}
						
						result[config.populate.by] = result[config.populate.by]._id;
					}
					return callback(err, result);
				});
			}

			Model.findOne(find, function(err, result) {
				callback(err, result);
			});
		}


		function updateOneById(id, newData, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}

			var find = {
				_id: id
			};

			if (filter) {
				extend(find, filter);	
			}

			Model.findOneAndUpdate(find, newData, function(err, result) {
				callback(err, result);
			});
		}

		function destroyOneById(id, filter, callback) {
			if (typeof callback === "undefined") {
				callback = filter;
				filter = null;
			}

			var find = {
				_id: id
			};

			if (filter) {
				extend(find, filter);	
			}

			Model.findOneAndRemove(find, function(err, result) {
				callback(err, result);
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