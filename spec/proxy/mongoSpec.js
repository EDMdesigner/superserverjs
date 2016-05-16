var createMongoProxy = require("../../src/proxy/mongo");

describe("Mongo proxy", function() {
	
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
			var mockModel = {
				find: function(query, callback) {
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

				findOneAndUpdate: function(id, data, callback) {
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

		it("- createOne should create an item", function(done) {
			mongoProxy.createOne({user: "User1"}, function(err) {
				expect(err).toBeNull();
				
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

		it("- updateOneById should return without error", function(done) {
			mongoProxy.updateOneById("id", "data", function(err) {
				expect(err).toBeNull();

				done();
			});
		});

		it("- destroyOneById should return without error", function(done) {
			mongoProxy.destroyOneById("id", function(err) {
				expect(err).toBeNull();

				done();
			});
		});

	});

});