var createMongoProxy = require("../../src/proxy/mongo");

describe("Mongo proxy", function() {
	
	describe("with invalid config", function() {
		
		describe("missing mongo url", function() {
			it("should return an error", function() {
				expect(function() {
					createMongoProxy({
						model: {}
					});
				}).toThrowError("config.mongoUrl is mandatory!");
			});
		});

		describe("missing model object", function() {
			it("should return an error", function() {
				expect(function() {
					createMongoProxy({
						mongoUrl: ""
					});
				}).toThrowError("config.model is mandatory!");
			});
		});

	});

	describe("with valid config", function() {
		
		/*
		var mongoProxy = createMongoProxy({
			mongoUrl: "",
			model: {}
		});
		*/
	});

});