"use strict";
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
	const objectId = dependencies.ObjectId;
	
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

			if(config.foreignFields) {
				config.foreignFields.forEach((item) => {
					if(query.find.hasOwnProperty(item)) {
						query.find[item] = objectId(query.find[item]);
					}
				});
			}

			if(config.populate) {
				let aggregateArray = [{$lookup: config.populate}];
				
				if(query.find) {
					aggregateArray.push({$match: query.find});
				}
				
				if(query.sort) {
					aggregateArray.push({$sort: query.sort});
				}

				if(query.skip) {
					aggregateArray.push({$skip: query.skip});
				}

				if(query.limit) {
					aggregateArray.push({$limit: query.limit});
				}

				model
					.aggregate(aggregateArray)
					.exec((err, result) => {
						result.forEach((item, index, array) => {
							array[index][config.populate.as] = item[config.populate.as][0];
						});

						done(err, result);
					});
					
			} else {
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

				model.exec((err, result) => {
					done(err, result);
				});
			}
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
				_id: objectId(id)
			};

			if (filter) {
				extend(find, filter);	
			}

			if(config.foreignFields) {
				config.foreignFields.forEach((item) => {
					if(find.hasOwnProperty(item)) {
						find[item] = objectId(find[item]);
					}
				});
			}

			if(config.populate) {
				Model
					.aggregate([
						{
							$lookup: config.populate
						},
						{
							$match: find
						}
					])
					.exec((err, result) => {
						if(Object.keys(result).length !== 0) {
							result[config.populate.as] = result[config.populate.as][0];
						}

						callback(err, result);	
					});
			} else {
				Model.findOne(find, function(err, result) {
					callback(err, result);
				}); 
			}
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

			Model.findOneAndUpdate(find, newData, {new: true}, function(err, result) {
				callback(err, result);
			});
		}


		function patchOneById(id, newData, filter, callback) {
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

			Model.findOneAndUpdate(find, newData, {new: true}, function(err, result) {
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
			patchOneById: patchOneById,
			destroyOneById: destroyOneById
		};
	};
};