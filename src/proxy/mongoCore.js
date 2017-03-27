/* 
 * MongoDB proxy core
 */

"use strict";

module.exports = (dependencies) => {
	if (!dependencies.async) {
		throw new Error("async dependency is mandatory!");
	}
	
	if (!dependencies.extend) {
		throw new Error("extend dependency is mandatory!");
	}

	const extend = dependencies.extend;
	const async = dependencies.async;
	
	return function createMongoProxy(config) {
		config = config || {};

		if (!config.model) {
			throw new Error("config.model is mandatory!");
		}

		let Model = config.model;
		let populate = config.populate || null;
		let populateFields = "";

		if (populate) {
			for (let field of populate) {
				populateFields += field + " ";
			}
		}

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
			}, (err, result) => {
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

			if (query.find) {
				if (populate) {
					model = model.find(query.find).populate(populateFields);
				} else {
					model = model.find(query.find);
				}
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

			model.exec(function(err, result) {
				done(err, result);
			});
		}

		function getItemCount(query, done) {
			Model.count(query.find, (err, result) => {
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

			Model.create(data, (err, result) => {
				callback(err, result);
			});
		}

		function readOneById(id, filter, callback) {
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

			Model.findOne(find, function(err, result) {
				callback(err, result);
			});

			Model.findOne(find).populate(populateFields, (err, result) => {
				callback(err, result);
			});
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

			Model.findOneAndUpdate(find, newData, (err, result) => {
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

			Model.findOneAndRemove(find, (err, result) => {
				callback(err, result);
			});
		}

		return { read, createOne, readOneById, updateOneById, destroyOneById };
	};
};