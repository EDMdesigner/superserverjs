var express = require("express");
var bodyParser = require("body-parser");

var request = require("supertest");

var createCrudRouter = require("../src/crudRouter");

describe("crudRouter", function() {
	describe("with invalid config", function() {
		it("missing proxy", function() {
			expect(createCrudRouter).toThrowError("config.proxy is mandatory");
		});

		it("config.proxy.read", function() {
			expect(function() {
				createCrudRouter({
					proxy: {
						read: "yo"
					}
				});
			}).toThrowError("config.proxy.read must be a function");
		});

		it("config.proxy.createOne", function() {
			expect(function() {
				createCrudRouter({
					proxy: {
						read: function() {}
					}
				});
			}).toThrowError("config.proxy.createOne must be a function");
		});

		it("config.proxy.readOneById", function() {
			expect(function() {
				createCrudRouter({
					proxy: {
						read: function() {},
						createOne: function() {}
					}
				});
			}).toThrowError("config.proxy.readOneById must be a function");
		});

		it("config.proxy.updateOneById", function() {
			expect(function() {
				createCrudRouter({
					proxy: {
						read: function() {},
						createOne: function() {},
						readOneById: function() {}
					}
				});
			}).toThrowError("config.proxy.updateOneById must be a function");
		});

		it("config.proxy.destroyOneById", function() {
			expect(function() {
				createCrudRouter({
					proxy: {
						read: function() {},
						createOne: function() {},
						readOneById: function() {},
						updateOneById: function() {}
					}
				});
			}).toThrowError("config.proxy.destroyOneById must be a function");
		});
	});

	describe("with valid config", function() {
		var mockProxy = {
			read: function(query, callback) {
				callback();
			},
			createOne: function(data, callback) {
				callback();
			},
			readOneById: function(id, callback) {
				callback();
			},
			updateOneById: function(id, data, callback) {
				callback();
			},
			destroyOneById: function(id, callback) {
				callback();
			}
		};

		var app;

		beforeAll(function() {
			app = express();
			app.use(bodyParser.urlencoded({limit: "2mb", extended: true, parameterLimit: 10000}));
			app.use(bodyParser.json({limit: "2mb"}));

			createCrudRouter({
				router: app,
				proxy: mockProxy
			});

			spyOn(mockProxy, "read").and.callThrough();
			spyOn(mockProxy, "createOne").and.callThrough();
			spyOn(mockProxy, "readOneById").and.callThrough();
			spyOn(mockProxy, "updateOneById").and.callThrough();
			spyOn(mockProxy, "destroyOneById").and.callThrough();
		});

		it("GET /", function(done) {
			request(app)
				.get("/")
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockProxy.read).toHaveBeenCalled();
					expect(mockProxy.createOne).not.toHaveBeenCalled();
					expect(mockProxy.readOneById).not.toHaveBeenCalled();
					expect(mockProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockProxy.destroyOneById).not.toHaveBeenCalled();
					done();
				});
		});

		it("POST /", function(done) {
			request(app)
				.post("/")
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockProxy.read).toHaveBeenCalled();
					expect(mockProxy.createOne).toHaveBeenCalled();
					expect(mockProxy.readOneById).not.toHaveBeenCalled();
					expect(mockProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockProxy.destroyOneById).not.toHaveBeenCalled();
					done();
				});
		});

		it("GET /:id", function(done) {
			request(app)
				.get("/1")
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockProxy.read).toHaveBeenCalled();
					expect(mockProxy.createOne).toHaveBeenCalled();
					expect(mockProxy.readOneById).toHaveBeenCalled();
					expect(mockProxy.updateOneById).not.toHaveBeenCalled();
					expect(mockProxy.destroyOneById).not.toHaveBeenCalled();
					done();
				});
		});

		it("PUT /:id", function(done) {
			request(app)
				.put("/1")
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockProxy.read).toHaveBeenCalled();
					expect(mockProxy.createOne).toHaveBeenCalled();
					expect(mockProxy.readOneById).toHaveBeenCalled();
					expect(mockProxy.updateOneById).toHaveBeenCalled();
					expect(mockProxy.destroyOneById).not.toHaveBeenCalled();
					done();
				});
		});

		it("DEL /:id", function(done) {
			request(app)
				.del("/1")
				.set("Accept", "application/json")
				.expect(200)
				.end(function(err, res) {
					expect(err).toBeNull();
					expect(res).toBeDefined();

					expect(mockProxy.read).toHaveBeenCalled();
					expect(mockProxy.createOne).toHaveBeenCalled();
					expect(mockProxy.readOneById).toHaveBeenCalled();
					expect(mockProxy.updateOneById).toHaveBeenCalled();
					expect(mockProxy.destroyOneById).toHaveBeenCalled();
					done();
				});
		});
	});
});
