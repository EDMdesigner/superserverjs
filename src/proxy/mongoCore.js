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

	const extend = dependencies.extend;
	const async = dependencies.async;
	const objectId = dependencies.ObjectId;
	
	return function createMongoProxy(config) {
		config = config || {};

		if (!config.model) {
			throw new Error("config.model is mandatory!");
		}

		const Model = config.model;

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
				count: getItemCount.bind(null, filter)
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
			let model = Model;

			if (config.foreignFields) {
				config.foreignFields.forEach((item) => {
					if(query.find.hasOwnProperty(item)) {
						query.find[item] = objectId(query.find[item]);
					}
				});
			}
			
			let aggregateArray = [];

			if (config.populate) {
				if (!Array.isArray(config.populate)) {
					config.populate = [config.populate];
				}
				config.populate.forEach(item => {
					aggregateArray.push({$lookup: item});
					aggregateArray.push({$unwind: "$" + item.as});
				});
			}

			if (config.populateArray) {
				if (!Array.isArray(config.populateArray)) {
					config.populateArray = [config.populateArray];
				}

				config.populateArray.forEach(item => {
					aggregateArray = aggregateArray.concat([
						{
							$unwind: {
								path: "$" + item.localField,
								preserveNullAndEmptyArrays: true
							}
						},
						{
							$lookup: item
						},
						{
							$unwind: "$" + item.as
						},
						{
							$group: {
								_id: "$_id",
								[item.localField]: {
									$push: "$" + item.localField
								},
								[item.as]: {
									$push: "$" + item.as
								},
								"__doc": { $first: "$$ROOT" }
							}
						},
						{
							$project: {
								"__doc": "$__doc",
								["__doc." + item.localField]: "$" + item.localField,
								["__doc." + item.as]: "$" + item.as
							}
						},
						{
							$replaceRoot: {
								newRoot: "$__doc"
							}
						}
					]);					
				});
			}
				
			if (query.find) {
				aggregateArray.push({$match: query.find});
			}
			
			if (query.sort) {
				aggregateArray.push({$sort: query.sort});
			}

			if (query.skip) {
				aggregateArray.push({$skip: query.skip});
			}

			if (query.limit) {
				aggregateArray.push({$limit: query.limit});
			}

			model
				.aggregate(aggregateArray)
				.exec((err, result) => {
					done(err, result);
			});
		}

		function getItemCount(query, done) {
			Model.count(query, function(err, result) {
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

			let find = {
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
				let aggregateArray = [];
				
				if(Array.isArray(config.populate)) {
					config.populate.forEach((item, idx) => {
						if(Model.schema.path(item.localField).instance === "Array") {
							aggregateArray.push({$unwind: "$" + item.localField});
							aggregateArray.push({$lookup: item});
							aggregateArray.push({$unwind: "$" + item.as});
					
							let group = {
								_id: "$_id",
								[item.localField]: {
									$push: "$" + item.localField
								},
								[item.as]: {
									$push: "$" + item.as
								}
							};

							config.populate.forEach((object, idy) => {
								if(item.as !== object.as && idx > idy) {
									group[object.as] = {
										$first: "$" + object.as
									};
								}

								group[object.localField] = {
									$first: "$" + object.localField
								};
							});
					
							config.foreignFields.forEach((field) => {
								group[field] = {
									$first: "$" + field
								};
							});
					
							aggregateArray.push({$group: group});
						} else {
							aggregateArray.push({$lookup: item});
							aggregateArray.push({$unwind: "$" + item.as});		
						}
					});
				} else {
					aggregateArray.push({$lookup: config.populate});
					aggregateArray.push({$unwind: "$" + config.populate.as});
				}

				aggregateArray.push({$match: find});

				Model
					.aggregate(aggregateArray)
					.exec((err, result) => {
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

			let find = {
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

			let find = {
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

			let find = {
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