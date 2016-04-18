var express = require("express");
var bodyParser = require("body-parser");

var request = require("supertest");

var createCrudRouter = require("../../src/router/crud");

var proxyConfigBehaviour = require("../proxy/proxyConfigBehaviour");
var createMockProxy = require("../utils/createMockProxy");

describe("crudRouter", function() {
	describe("with invalid config", function() {
		proxyConfigBehaviour({
			config: {},
			factoryMethod: createCrudRouter,
			msgPrefix: "config.proxy",
			prop: "proxy"
		});
	});

	describe("with valid config", function() {
		var mockProxy;
		var app;

		beforeAll(function() {
			mockProxy = createMockProxy();
			
			app = express();
			app.use(bodyParser.urlencoded({limit: "2mb", extended: true, parameterLimit: 10000}));
			app.use(bodyParser.json({limit: "2mb"}));

			createCrudRouter({
				router: app,
				proxy: mockProxy
			});
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
