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
		describe("when proxy call returns error", function() {
			var mockProxy = {
				read: function(query, filter, callback) {
					callback("MockedERROR");
				},
				createOne: function(data, filter, callback) {
					callback("MockedERROR", {
						file: {}
					});
				},
				readOneById: function(id, filter, callback) {
					callback("MockedERROR");
				},
				updateOneById: function(id, data, filter, callback) {
					callback("MockedERROR");
				},
				destroyOneById: function(id, filter, callback) {
					callback("MockedERROR");
				}
			};

			var postHooks = {
				get: function() {},
				getOne: function() {},
				post: function() {},
				put: function() {},
				delete: function() {}
			};

			var app = null;

			beforeAll(function() {				
				spyOn(mockProxy, "read").and.callThrough();
				spyOn(mockProxy, "createOne").and.callThrough();
				spyOn(mockProxy, "readOneById").and.callThrough();
				spyOn(mockProxy, "updateOneById").and.callThrough();
				spyOn(mockProxy, "destroyOneById").and.callThrough();
				spyOn(postHooks, "get").and.callThrough();
				spyOn(postHooks, "getOne").and.callThrough();
				spyOn(postHooks, "post").and.callThrough();
				spyOn(postHooks, "put").and.callThrough();
				spyOn(postHooks, "delete").and.callThrough();

				app = express();
				app.use(bodyParser.urlencoded({limit: "2mb", extended: true, parameterLimit: 10000}));
				app.use(bodyParser.json({limit: "2mb"}));

				createCrudRouter({
					router: app,
					proxy: mockProxy,
					postHooks: postHooks
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
						expect(postHooks.get).toHaveBeenCalledWith("MockedERROR");

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
						expect(postHooks.post).toHaveBeenCalledWith("MockedERROR");

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
						expect(postHooks.getOne).toHaveBeenCalledWith("MockedERROR");

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
						expect(postHooks.put).toHaveBeenCalledWith("MockedERROR");

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
						expect(postHooks.delete).toHaveBeenCalledWith("MockedERROR");

						done();
					});
			});
		});


		describe("with preHooks and postHooks", function() {
			// if a route will be blocked in the prehook, don't call next
			// failing prehooks are not tested because of this behavior
			var mockProxy;
			var app;

			var preHooks = {
				get: function(req, res, next) {
					next();
				},
				getOne: function(req, res, next) {
					next();
				},
				post: function(req, res, next) {
					next();
				},
				put: function(req, res, next) {
					next();
				},
				delete: function(req, res, next) {
					next();
				}
			};

			var postHooks = {
				get: function() {},
				getOne: function() {},
				post: function() {},
				put: function() {},
				delete: function() {}
			};

			beforeAll(function() {
				mockProxy = createMockProxy();
				
				spyOn(preHooks, "get").and.callThrough();
				spyOn(preHooks, "getOne").and.callThrough();
				spyOn(preHooks, "post").and.callThrough();
				spyOn(preHooks, "put").and.callThrough();
				spyOn(preHooks, "delete").and.callThrough();

				spyOn(postHooks, "get").and.callThrough();
				spyOn(postHooks, "getOne").and.callThrough();
				spyOn(postHooks, "post").and.callThrough();
				spyOn(postHooks, "put").and.callThrough();
				spyOn(postHooks, "delete").and.callThrough();

				app = express();
				app.use(bodyParser.urlencoded({limit: "2mb", extended: true, parameterLimit: 10000}));
				app.use(bodyParser.json({limit: "2mb"}));

				createCrudRouter({
					router: app,
					proxy: mockProxy,
					preHooks: preHooks,
					postHooks: postHooks
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
						expect(preHooks.get).toHaveBeenCalled();
						expect(postHooks.get).toHaveBeenCalled();
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
						expect(preHooks.post).toHaveBeenCalled();
						expect(postHooks.post).toHaveBeenCalled();
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
						expect(preHooks.getOne).toHaveBeenCalled();
						expect(postHooks.getOne).toHaveBeenCalled();
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
						expect(preHooks.put).toHaveBeenCalled();
						expect(postHooks.put).toHaveBeenCalled();
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
						expect(preHooks.delete).toHaveBeenCalled();
						expect(postHooks.delete).toHaveBeenCalled();
						done();
					});
			});
		});

		describe("without preHooks", function() {
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
});
