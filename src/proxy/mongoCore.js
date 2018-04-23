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
			var model = Model;

			let foreignFields = config.foreignFields || [];
			let otherFields = config.otherFields || [];

			foreignFields.forEach((item) => {
				if(query.find.hasOwnProperty(item)) {
					query.find[item] = objectId(query.find[item]);
				}
			});

			if (!config.populate && !config.populateArrayField) {
				if (query.find) {
					model = model.find(query.find);
				}
	
				if (query.sort) {
					model = model.sort(query.sort);
				}

				if(query.select) {
					model = model.select(query.select);
				}
	
				if (typeof query.skip === "number") {
					model = model.skip(query.skip);
				}
	
				if (typeof query.limit === "number") {
					model = model.limit(query.limit);
				}

				return model.exec((err, result) => {
					done(err, result);
				});
			}

			let aggregateArray = [];

			if(config.populate) {
				if (!Array.isArray(config.populate)) {
					config.populate = [ config.populate ];
				}
				config.populate.forEach(item => {
					aggregateArray = aggregateArray.concat([
						{
							$lookup: item
						},
						{
							$unwind: "$" + item.as // unwrapping the resulting one-element array
						}
					]);
				});
			}

			if (config.populateArrayField) {
				if (!Array.isArray(config.populateArrayField)) {
					config.populateArrayField = [ config.populateArrayField ];
				}

				config.populateArrayField.forEach(item => {
					aggregateArray = aggregateArray.concat([
						{
							$unwind: { // creates multiple documents by "splitting" the array field
								path: "$" + item.localField,
								preserveNullAndEmptyArrays: true
							}
						},
						{
							$lookup: item
						},
						{
							$unwind: { // unwrapping the resulting one-element array
								path: "$" + item.as,
								preserveNullAndEmptyArrays: true
							}
						}
					]);

					let group = {
						_id: "$_id",
						[item.localField]: {
							$push: "$" + item.localField
						},
						[item.as]: {
							$push: "$" + item.as
						}
					};

					config.populateArrayField.forEach(otherPopulateItem => {
						if (otherPopulateItem !== item) {
							group[otherPopulateItem.as] = {
								$first: "$" + otherPopulateItem.as
							};
							group[otherPopulateItem.localField] = {
								$first: "$" + otherPopulateItem.localField
							};
						}
					});

					config.populate.forEach(otherPopulateItem => {
						group[otherPopulateItem.as] = {
							$first: "$" + otherPopulateItem.as
						};
						group[otherPopulateItem.localField] = {
							$first: "$" + otherPopulateItem.localField
						};
					});

					foreignFields.forEach((field) => {
						group[field] = {
							$first: "$" + field
						};
					});

					otherFields.forEach((field) => {
						group[field] = {
							$first: "$" + field
						};
					});

					aggregateArray.push({
						$group: group
					});
				});
			}
				
			if(query.find) {
				aggregateArray.push({
					$match: query.find
				});
			}
			
			if(query.sort) {
				aggregateArray.push({
					$sort: query.sort
				});
			}

			if(query.select) {
				aggregateArray.push({
					$select: query.select
				});
			}

			if(query.skip) {
				aggregateArray.push({
					$skip: query.skip
				});
			}

			if(query.limit) {
				aggregateArray.push({
					$limit: query.limit
				});
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

			let foreignFields = config.foreignFields || [];
			let otherFields = config.otherFields || [];

			var find = {
				_id: objectId(id)
			};

			if (filter) {
				extend(find, filter);	
			}

			foreignFields.forEach((item) => {
				if(find.hasOwnProperty(item)) {
					find[item] = objectId(find[item]);
				}
			});

			if (!config.populate && !config.populateArrayField) {
				return Model.findOne(find, function(err, result) {
					callback(err, result);
				});
			}

			let aggregateArray = [];

			if (config.populate) {
				if (!Array.isArray(config.populate)) {
					config.populate = [ config.populate ];
				}
				config.populate.forEach(item => {
					aggregateArray = aggregateArray.concat([
						{
							$lookup: item
						},
						{
							$unwind: "$" + item.as // unwrapping the resulting one-element array
						}
					]);
				});
			}

			if (config.populateArrayField) {
				if (!Array.isArray(config.populateArrayField)) {
					config.populateArrayField = [ config.populateArrayField ];
				}

				config.populateArrayField.forEach(item => {
					aggregateArray = aggregateArray.concat([
						{
							$unwind: { // creates multiple documents by "splitting" the array field
								path: "$" + item.localField,
								preserveNullAndEmptyArrays: true
							}
						},
						{
							$lookup: item
						},
						{
							$unwind: { // unwrapping the resulting one-element array
								path: "$" + item.as,
								preserveNullAndEmptyArrays: true
							}
						}
					]);

					let group = {
						_id: "$_id",
						[item.localField]: {
							$push: "$" + item.localField
						},
						[item.as]: {
							$push: "$" + item.as
						}
					};

					config.populateArrayField.forEach(otherPopulateItem => {
						if (otherPopulateItem !== item) {
							group[otherPopulateItem.as] = {
								$first: "$" + otherPopulateItem.as
							};
							group[otherPopulateItem.localField] = {
								$first: "$" + otherPopulateItem.localField
							};
						}
					});

					config.populate.forEach(otherPopulateItem => {
						group[otherPopulateItem.as] = {
							$first: "$" + otherPopulateItem.as
						};
						group[otherPopulateItem.localField] = {
							$first: "$" + otherPopulateItem.localField
						};
					});

					foreignFields.forEach((field) => {
						group[field] = {
							$first: "$" + field
						};
					});

					otherFields.forEach((field) => {
						group[field] = {
							$first: "$" + field
						};
					});

					aggregateArray.push({
						$group: group
					});

					aggregateArray.push({
						$match: find
					});
				});
			}

			Model
				.aggregate(aggregateArray)
				.exec((err, result) => {
					callback(err, result[0]);
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

			Model.findOneAndUpdate(find, newData, {new: true}, function(err, result) {
				if(err) {
					callback(err, result);
				} else {
					readOneById(id, filter, callback);
				}
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
				if(err) {
					callback(err, result);
				} else {
					readOneById(id, filter, callback);
				}
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

			Model.findOne(find, (err, result) => {
				if(err) {
					return callback(err);
				}

				result.remove(callback);
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