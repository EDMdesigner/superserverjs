"use strict";

var createMongoProxyCore = require("../../src/proxy/mongoCore");

var mockAsync = {
	parallel: function(array, done) {
		setTimeout(function() {
			done(null, {
				items: [],
				count: 0
			});
		}, 1);
	}
};

var mockExtend = jasmine.createSpy().and.callThrough();

describe("Mongo proxy", function() {
	var createMongoProxy = createMongoProxyCore({
		async: mockAsync,
		extend: mockExtend,
		ObjectId: (aString) => {return aString;}
	});

	describe("with invalid config", function() {

		describe("missing model function", function() {
			it("should return an error", function() {
				expect(function() {
					createMongoProxy({});
				}).toThrowError("config.model is mandatory!");
			});
		});

	});

	describe("with valid config", function() {
		var mongoProxy;

		beforeAll(function(done) {
			spyOn(mockAsync, "parallel").and.callThrough();

			var mockModel = {
				find: function() {
					return mockModel;
				},

				exec: function(callback) {
					callback(null, []);
				},

				count: function(query, callback) {
					callback(null, 0);
				},

				create: function(data, callback) {
					callback(null);
				},

				findOne: function(id, callback) {
					callback(null, {});
				},

				findOneAndUpdate: function(id, data, options, callback) {
					callback(null);
				},

				findOneAndRemove: function(id, callback) {
					callback(null);
				}
			};

			mongoProxy = createMongoProxy({
				model: mockModel
			});

			done();
		});
		
		it("- read should return with list of items", function(done) {
			mongoProxy.read({}, function(err, result) {
				expect(err).toBeNull();
				expect(result).toBeDefined();
				expect(typeof result).toEqual("object");
				expect(result.items instanceof Array).toEqual(true);
				expect(result.items).toEqual([]);
				expect(result.count).toEqual(0);
				
				done();
			});
		});

		it("- read with filter object should return with list of items", function(done) {
			mongoProxy.read({}, {user: "User1"}, function(err, result) {
				expect(err).toBeNull();
				expect(result).toBeDefined();
				expect(typeof result).toEqual("object");
				expect(result.items instanceof Array).toEqual(true);
				expect(result.items).toEqual([]);
				expect(result.count).toEqual(0);
				expect(mockExtend).toHaveBeenCalled();
				expect(mockAsync.parallel).toHaveBeenCalled();

				done();
			});
		});

		it("- createOne should create an item", function(done) {
			mongoProxy.createOne({user: "User1"}, function(err) {
				expect(err).toBeNull();
				
				done();
			});
		});

		it("- createOne with filter object should create an item", function(done) {
			mongoProxy.createOne({user: "User1"}, {user2: "User2"}, function(err) {
				expect(err).toBeNull();
				expect(mockExtend).toHaveBeenCalled();
				expect(mockAsync.parallel).toHaveBeenCalled();

				done();
			});
		});

		it("- createOne should create an item", function(done) {
			mongoProxy.createOne({user: "User1"}, function(err) {
				expect(err).toBeNull();
				
				done();
			});
		});

		it("- createOne with filter object should create an item", function(done) {
			mongoProxy.createOne({user: "User1"}, {user2: "User2"}, function(err) {
				expect(err).toBeNull();
				expect(mockExtend).toHaveBeenCalled();
				expect(mockAsync.parallel).toHaveBeenCalled();
				
				done();
			});
		});

		it("- readOneById should return with an item object", function(done) {
			mongoProxy.readOneById("id", function(err, result) {
				expect(err).toBeNull();
				expect(result).toBeDefined();
				expect(typeof result).toEqual("object");
				
				done();
			});
		});

		it("- readOneById with filter object should return with an item object", function(done) {
			mongoProxy.readOneById("id", {user2: "User2"}, function(err, result) {
				expect(err).toBeNull();
				expect(result).toBeDefined();
				expect(typeof result).toEqual("object");
				expect(mockExtend).toHaveBeenCalled();
				expect(mockAsync.parallel).toHaveBeenCalled();
				
				done();
			});
		});

		it("- updateOneById should return without error", function(done) {
			mongoProxy.updateOneById("id", "data", function(err) {
				expect(err).toBeNull();

				done();
			});
		});

		it("- updateOneById with filter object should return without error", function(done) {
			mongoProxy.updateOneById("id", "data", {user2: "User2"}, function(err) {
				expect(err).toBeNull();
				expect(mockExtend).toHaveBeenCalled();
				expect(mockAsync.parallel).toHaveBeenCalled();

				done();
			});
		});

		it("- destroyOneById should return without error", function(done) {
			mongoProxy.destroyOneById("id", function(err) {
				expect(err).toBeNull();

				done();
			});
		});

		it("- destroyOneById  with filter object should return without error", function(done) {
			mongoProxy.destroyOneById("id",  {user2: "User2"}, function(err) {
				expect(err).toBeNull();
				expect(mockExtend).toHaveBeenCalled();
				expect(mockAsync.parallel).toHaveBeenCalled();

				done();
			});
		});

		describe("populate tests", () => {
			let mongoProxy, createMongoProxy, mockModel;

			it("readOne should call aggregate if populate exists in config", (done) => {
				let mockModel = {
					aggregate: () => {
						return mockModel;
					},
					find: function() {
						return mockModel;
					},

					exec: function(callback) {
						callback(null, []);
					},

					count: function(query, callback) {
						callback(null, 0);
					},

					create: function(data, callback) {
						callback(null);
					},

					findOne: function() {
						return mockModel;
					},

					findOneAndUpdate: function(id, data, callback) {
						callback(null);
					},

					findOneAndRemove: function(id, callback) {
						callback(null);
					}
				};

				spyOn(mockModel, "aggregate").and.callThrough();

				createMongoProxy = createMongoProxyCore({
					extend: mockExtend,
					async: mockAsync,
					ObjectId: (aString) => {return aString;}
				});

				mongoProxy = createMongoProxy({
					model: mockModel,
					populate: {
						from: "anothercollection",
						localField: "anId",
						foreignField: "anotherId",
						as: "aProp"
					}
				});
				
				mongoProxy.readOneById({}, {user: "User1"}, (err, result) => {
					expect(mockModel.aggregate).toHaveBeenCalled();
					expect(typeof result).toBe("object");
					expect(err).toBe(null);
				});

				done();
			});

			it("read should call aggregate if popoulate exists in config", (done) => {
				mockModel = {
					aggregate: () => {
						return mockModel;
					},
					find: () => {
						return mockModel;
					},
					sort: () => {
						return mockModel;
					},
					skip: () => {
						return mockModel;
					},
					limit: () => {
						return mockModel;
					},
					exec: (callback) => {
						callback(null, []);
					},
					count: function(query, callback) {
						callback(null, 0);
					}
				};

				spyOn(mockModel, "aggregate").and.callThrough();

				createMongoProxy = createMongoProxyCore({
					extend: mockExtend,
					async: {
						parallel: (functions) => {
							Object.keys(functions).forEach((func) => {
								functions[func](done);
							});
						}
					},
					ObjectId: (aString) => {return aString;}
				});

				mongoProxy = createMongoProxy({
					model: mockModel,
					populate: {
						from: "anothercollection",
						localField: "anId",
						foreignField: "anotherId",
						as: "aProp"
					}
				});

				mongoProxy.read({}, {user: "User1"}, (err, result) => {
					expect(mockModel.aggregate).toHaveBeenCalled();
					expect(Array.isArray(result)).toBe(true);
					expect(err).toBe(null);
				});

				done();
			});
		});
	});

});